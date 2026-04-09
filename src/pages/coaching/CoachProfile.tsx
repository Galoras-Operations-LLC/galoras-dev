import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Calendar, MessageCircle, Package } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/hooks/useAuth";
import { ContactModal } from "@/components/coaching/ContactModal";
import { ProductCard, CoachProduct } from "@/components/coaching/ProductCard";
import { useProductTypes } from "@/hooks/useProductTypes";
import { CheckoutModal } from "@/components/coaching/CheckoutModal";
import { RequestModal } from "@/components/coaching/RequestModal";
import { EnterpriseRequestModal } from "@/components/coaching/EnterpriseRequestModal";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "@/hooks/use-toast";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "");

// ── Galoras Platform Sessions ─────────────────────────────────────────────────
// Standard offerings available on every qualified coach's profile.

const GALORAS_PLATFORM_PRODUCTS: CoachProduct[] = [
  {
    id:               "galoras-discovery",
    product_type:     "single_session",
    title:            "Discovery Session",
    outcome_statement:
      "A focused 1-on-1 session to assess where you are, clarify what's holding you back, and map the fastest path to your next performance breakthrough. You'll walk away with a clear picture of your leadership gaps and a concrete action plan — no fluff, just signal.",
    target_audience:  ["Leaders ready to stop guessing and start executing with clarity"],
    delivery_format:  "online",
    session_count:    1,
    duration_minutes: 60,
    duration_weeks:   null,
    price_type:       "fixed",
    price_amount:     100,  // $1 for live testing — revert to 25000 ($250) after
    price_range_min:  null,
    price_range_max:  null,
    enterprise_ready: false,
    booking_mode:     "enquiry",
    visibility_scope: "public",
    is_active:        true,
    sort_order:       0,
  },
  {
    id:               "galoras-workshop",
    product_type:     "workshop_event",
    title:            "Strategic Initiative Workshop",
    outcome_statement:
      "A high-intensity 90-minute working session designed to pressure-test your biggest strategic initiative. Bring your real challenge — leave with a validated plan, sharper priorities, and the blind spots you didn't know you had. Built for leaders who move fast and need thinking partners, not theory.",
    target_audience:  ["Executives and founders navigating high-stakes decisions"],
    delivery_format:  "online",
    session_count:    1,
    duration_minutes: 90,
    duration_weeks:   null,
    price_type:       "fixed",
    price_amount:     45000,
    price_range_min:  null,
    price_range_max:  null,
    enterprise_ready: false,
    booking_mode:     "enquiry",
    visibility_scope: "public",
    is_active:        true,
    sort_order:       1,
  },
];

type CoachProfileData = {
  id: string;
  slug: string | null;
  display_name: string | null;
  headline: string | null;
  positioning_statement: string | null;
  methodology: string | null;
  coaching_style: string | null;
  engagement_format: string | null;
  primary_pillar: string | null;
  proof_points: unknown;
  audience: string[] | null;
  tier: string | null;
  lifecycle_status: string | null;
  booking_url: string | null;
  avatar_url: string | null;
};

function normalizeProofPoints(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object" && "text" in item) {
          const text = (item as { text?: unknown }).text;
          return typeof text === "string" ? text.trim() : "";
        }
        return "";
      })
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split("\n").map((line) => line.trim()).filter(Boolean);
  }
  return [];
}

export default function CoachProfile() {
  const { slug, id, coachId } = useParams();

  const resolvedSlug = slug;
  const fallbackId = !slug ? id || coachId : null;

  const [coach, setCoach] = useState<CoachProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState("");
  const [showContact, setShowContact] = useState(false);
  const { isLoggedIn } = useAuth();
  const { getConfig: getTypeConfig } = useProductTypes();
  const { toast } = useToast();

  // Products
  const [products, setProducts] = useState<CoachProduct[]>([]);

  // Stripe checkout for platform products and coach products with booking_mode=stripe
  const [checkoutProduct, setCheckoutProduct] = useState<CoachProduct | null>(null);
  const [checkoutSecret, setCheckoutSecret] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Request & Enterprise modals
  const [requestProduct, setRequestProduct] = useState<CoachProduct | null>(null);
  const [enterpriseProduct, setEnterpriseProduct] = useState<CoachProduct | null>(null);

  const handlePlatformCheckout = async (product: CoachProduct) => {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (!coach || !product.price_amount) return;

    setCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await supabase.functions.invoke("create-payment-intent", {
        body: {
          productId: product.id,
          coachId: coach.id,
          amountCents: product.price_amount,
          currency: "cad",
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCheckoutLoading(false);
      if (res.error) {
        toast({ title: "Checkout error", description: res.error.message, variant: "destructive" });
        return;
      }
      if (res.data?.clientSecret) {
        setCheckoutProduct(product);
        setCheckoutSecret(res.data.clientSecret);
      } else {
        toast({ title: "Checkout error", description: res.data?.error ?? "Could not start checkout.", variant: "destructive" });
      }
    } catch (err: unknown) {
      setCheckoutLoading(false);
      const msg = err instanceof Error ? err.message : "Unexpected error";
      toast({ title: "Checkout error", description: msg, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchCoach();
  }, [resolvedSlug, fallbackId]);

  useEffect(() => {
    if (coach?.id) fetchProducts(coach.id);
  }, [coach?.id]);

  const fetchProducts = async (coachId: string) => {
    const { data } = await supabase
      .from("coach_products")
      .select("id, product_type, title, outcome_statement, target_audience, delivery_format, session_count, duration_minutes, duration_weeks, price_type, price_amount, price_range_min, price_range_max, enterprise_ready, booking_mode, visibility_scope, is_active, sort_order")
      .eq("coach_id", coachId)
      .eq("is_active", true)
      .eq("visibility_scope", "public")
      .order("sort_order", { ascending: true });
    setProducts((data as CoachProduct[]) || []);
  };

  const fetchCoach = async () => {
    setLoading(true);
    setDebugError("");
    try {
      let query = supabase
        .from("coaches")
        .select(
          "id, slug, display_name, headline, positioning_statement, methodology, coaching_style, engagement_format, primary_pillar, proof_points, audience, tier, lifecycle_status, booking_url, avatar_url"
        )
        .eq("lifecycle_status", "published");

      if (resolvedSlug) {
        query = query.eq("slug", resolvedSlug);
      } else if (fallbackId) {
        query = query.eq("id", fallbackId);
      } else {
        setDebugError("Missing slug or coach id");
        setCoach(null);
        setLoading(false);
        return;
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error(error);
        setDebugError(JSON.stringify(error));
        setCoach(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setCoach(null);
        setLoading(false);
        return;
      }

      setCoach(data as unknown as CoachProfileData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setDebugError("Unexpected profile load error");
      setCoach(null);
      setLoading(false);
    }
  };

  const proofPoints = useMemo(
    () => normalizeProofPoints(coach?.proof_points),
    [coach?.proof_points]
  );

  return (
    <Layout>
      <section className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30" />
        <div className="container-wide relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <Link
                to="/coaching"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Coaching Exchange
              </Link>
            </div>

            {loading && (
              <div className="py-16 text-center text-muted-foreground">
                Loading profile...
              </div>
            )}

            {!loading && debugError && (
              <pre className="whitespace-pre-wrap text-red-500 text-sm">
                {debugError}
              </pre>
            )}

            {!loading && !debugError && !coach && (
              <div className="py-16 text-center">
                <h1 className="text-2xl font-semibold mb-2">Coach not found</h1>
                <p className="text-muted-foreground">
                  This profile is not currently available.
                </p>
              </div>
            )}

            {!loading && !debugError && coach && (
              <>
                <div className="rounded-2xl border border-border bg-card p-8 md:p-10 mb-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar */}
                    {coach.avatar_url && (
                      <div className="shrink-0">
                        <img
                          src={coach.avatar_url}
                          alt={coach.display_name || "Coach"}
                          className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover object-top"
                        />
                      </div>
                    )}

                    <div className="flex-1 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                          <Sparkles className="h-3.5 w-3.5" />
                          Galoras Coaching Exchange
                        </div>
                        {coach.tier && (
                          <div className="inline-flex items-center px-3 py-1 rounded-full border border-border text-xs font-medium capitalize">
                            {coach.tier}
                          </div>
                        )}
                        {coach.audience && coach.audience.length > 0 && (
                          <div className="inline-flex items-center px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
                            {coach.audience.slice(0, 2).join(", ")}
                          </div>
                        )}
                      </div>

                      <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-3">
                        {coach.display_name || "Unnamed Coach"}
                      </h1>

                      {coach.headline && (
                        <p className="text-sm text-primary font-medium mb-4">
                          {coach.headline}
                        </p>
                      )}

                      <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl">
                        {coach.positioning_statement || "Positioning statement not available."}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <AuthGate isLoggedIn={isLoggedIn} message="Sign in to book a session">
                          {coach.booking_url ? (
                            <a href={coach.booking_url} target="_blank" rel="noopener noreferrer">
                              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                                <Calendar className="mr-2 h-5 w-5" />
                                Book a Call
                              </Button>
                            </a>
                          ) : (
                            <Button size="lg" className="bg-primary text-primary-foreground" disabled>
                              <Calendar className="mr-2 h-5 w-5" />
                              Book a Call
                            </Button>
                          )}
                        </AuthGate>

                        <AuthGate isLoggedIn={isLoggedIn} message="Sign in to message this coach">
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => setShowContact(true)}
                          >
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Message
                          </Button>
                        </AuthGate>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">

                  {/* ── Galoras Platform Sessions ── */}
                  <section className="rounded-2xl border border-primary/20 bg-card p-8">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h2 className="text-2xl font-semibold">Galoras Sessions</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Standard sessions available through the Galoras Coaching Exchange.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {GALORAS_PLATFORM_PRODUCTS.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          coachName={coach.display_name || ""}
                          getTypeConfig={getTypeConfig}
                          onCtaClick={() => handlePlatformCheckout(product)}
                        />
                      ))}
                    </div>
                    {checkoutLoading && (
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Preparing checkout…
                      </p>
                    )}
                  </section>

                  {/* ── Coach's Own Products ── */}
                  {products.length > 0 && (
                    <section className="rounded-2xl border border-border bg-card p-8">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-semibold">{coach.display_name ? `${coach.display_name}'s` : "Coach"} Sessions & Engagements</h2>
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">
                        Custom offerings designed by this coach.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {products.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            coachName={coach.display_name || ""}
                            bookingUrl={coach.booking_url}
                            getTypeConfig={getTypeConfig}
                            onBookNow={
                              product.booking_mode === "stripe" && product.price_amount
                                ? () => handlePlatformCheckout(product)
                                : undefined
                            }
                            onRequest={() => setRequestProduct(product)}
                            onEnterprise={() => setEnterpriseProduct(product)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="rounded-2xl border border-border bg-card p-8">
                    <h2 className="text-2xl font-semibold mb-4">Methodology</h2>
                    <p className="text-muted-foreground leading-7 whitespace-pre-wrap">
                      {coach.methodology || "Methodology not available."}
                    </p>
                  </section>

                  {/* ── Coaching Style & Details ── */}
                  {(coach.coaching_style || coach.engagement_format || coach.primary_pillar) && (
                    <section className="rounded-2xl border border-border bg-card p-8">
                      <h2 className="text-2xl font-semibold mb-4">Coaching Style</h2>
                      {coach.coaching_style && (
                        <p className="text-muted-foreground leading-7 whitespace-pre-wrap mb-6">
                          {coach.coaching_style}
                        </p>
                      )}
                      {(coach.engagement_format || coach.primary_pillar) && (
                        <div className="flex flex-wrap gap-3">
                          {coach.primary_pillar && (
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm">
                              <span className="text-muted-foreground mr-1.5">Pillar:</span>
                              <span className="font-medium">{coach.primary_pillar}</span>
                            </div>
                          )}
                          {coach.engagement_format && (
                            <div className="inline-flex items-center px-3 py-1.5 rounded-full border border-border text-sm">
                              <span className="text-muted-foreground mr-1.5">Format:</span>
                              <span className="font-medium capitalize">{coach.engagement_format}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  )}

                  <section className="rounded-2xl border border-border bg-card p-8">
                    <h2 className="text-2xl font-semibold mb-4">Proof Points</h2>
                    {proofPoints.length > 0 ? (
                      <div className="space-y-4">
                        {proofPoints.map((point, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-border bg-muted/30 p-5"
                          >
                            <p className="text-muted-foreground leading-7">{point}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Proof points not available.</p>
                    )}
                  </section>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <AuthGate isLoggedIn={isLoggedIn} message="Sign in to book a session">
                    {coach.booking_url ? (
                      <a href={coach.booking_url} target="_blank" rel="noopener noreferrer">
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Calendar className="mr-2 h-5 w-5" />
                          Book a Call
                        </Button>
                      </a>
                    ) : (
                      <Button size="lg" className="bg-primary text-primary-foreground" disabled>
                        <Calendar className="mr-2 h-5 w-5" />
                        Book a Call
                      </Button>
                    )}
                  </AuthGate>
                  <Link to="/coaching">
                    <Button variant="outline">Back to Coaching Exchange</Button>
                  </Link>
                </div>

                {showContact && coach && (
                  <ContactModal
                    coachId={coach.id}
                    coachName={coach.display_name || "Coach"}
                    onClose={() => setShowContact(false)}
                  />
                )}

                {checkoutProduct && checkoutSecret && (
                  <CheckoutModal
                    open={!!checkoutSecret}
                    stripePromise={stripePromise}
                    clientSecret={checkoutSecret}
                    productTitle={checkoutProduct.title}
                    amountCents={checkoutProduct.price_amount!}
                    currency="cad"
                    onSuccess={() => {
                      setCheckoutProduct(null);
                      setCheckoutSecret("");
                    }}
                    onClose={() => {
                      setCheckoutProduct(null);
                      setCheckoutSecret("");
                    }}
                  />
                )}

                {requestProduct && coach && (
                  <RequestModal
                    coachId={coach.id}
                    coachName={coach.display_name || "Coach"}
                    productId={requestProduct.id}
                    productTitle={requestProduct.title}
                    productType={requestProduct.product_type}
                    onClose={() => setRequestProduct(null)}
                  />
                )}

                {enterpriseProduct && coach && (
                  <EnterpriseRequestModal
                    coachId={coach.id}
                    coachName={coach.display_name || "Coach"}
                    productId={enterpriseProduct.id}
                    productTitle={enterpriseProduct.title}
                    productType={enterpriseProduct.product_type}
                    onClose={() => setEnterpriseProduct(null)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
