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
import { CheckoutModal } from "@/components/coaching/CheckoutModal";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "");

type CoachProfileData = {
  id: string;
  slug: string | null;
  display_name: string | null;
  headline: string | null;
  positioning_statement: string | null;
  methodology: string | null;
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

  // Products
  const [products, setProducts] = useState<CoachProduct[]>([]);

  // Checkout
  const [checkoutProduct, setCheckoutProduct] = useState<CoachProduct | null>(null);
  const [checkoutSecret, setCheckoutSecret] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchCoach();
  }, [resolvedSlug, fallbackId]);

  useEffect(() => {
    if (coach?.id) fetchProducts(coach.id);
  }, [coach?.id]);

  const fetchProducts = async (coachId: string) => {
    const { data } = await supabase
      .from("coach_products")
      .select("id, product_type, title, summary, what_you_get, who_its_for, duration_label, format, pricing_band, price_display, price_cents, cta_label, cta_url, sort_order")
      .eq("coach_id", coachId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    setProducts((data as CoachProduct[]) || []);
  };

  const handleProductCta = async (product: CoachProduct) => {
    // Has a fixed price and a logged-in user → Stripe checkout
    if (product.price_cents && isLoggedIn) {
      setCheckoutLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await supabase.functions.invoke("create-payment-intent", {
        body: {
          productId: product.id,
          coachId: coach!.id,
          amountCents: product.price_cents,
          currency: "cad",
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCheckoutLoading(false);
      if (res.data?.clientSecret) {
        setCheckoutProduct(product);
        setCheckoutSecret(res.data.clientSecret);
      }
      return;
    }
    // Has a fixed price but not logged in → prompt sign-in
    if (product.price_cents && !isLoggedIn) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    // Enquiry / external URL → ProductCard handles it natively via its own onClick
  };

  const fetchCoach = async () => {
    setLoading(true);
    setDebugError("");
    try {
      let query = supabase
        .from("coaches")
        .select(
          "id, slug, display_name, headline, positioning_statement, methodology, proof_points, audience, tier, lifecycle_status, booking_url, avatar_url"
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

                  {/* ── Products / Sessions ── */}
                  {products.length > 0 && (
                    <section className="rounded-2xl border border-border bg-card p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <Package className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-semibold">Sessions & Engagements</h2>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {products.map((product) =>
                          product.price_cents ? (
                            // Fixed-price → intercept CTA and open Stripe checkout
                            <div key={product.id} onClick={() => handleProductCta(product)} className="cursor-pointer">
                              <ProductCard product={product} coachName={coach.display_name || ""} />
                            </div>
                          ) : (
                            // Enquiry / external URL → ProductCard handles its own CTA
                            <ProductCard key={product.id} product={product} coachName={coach.display_name || ""} />
                          )
                        )}
                      </div>
                      {checkoutLoading && (
                        <p className="text-sm text-muted-foreground text-center mt-4">
                          Preparing checkout…
                        </p>
                      )}
                    </section>
                  )}

                  <section className="rounded-2xl border border-border bg-card p-8">
                    <h2 className="text-2xl font-semibold mb-4">Methodology</h2>
                    <p className="text-muted-foreground leading-7 whitespace-pre-wrap">
                      {coach.methodology || "Methodology not available."}
                    </p>
                  </section>

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
                    amountCents={checkoutProduct.price_cents!}
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
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
