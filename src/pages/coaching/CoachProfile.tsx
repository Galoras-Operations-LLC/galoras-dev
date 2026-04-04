import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { CheckoutModal } from "@/components/coaching/CheckoutModal";
import { useStripePayment } from "@/hooks/useStripePayment";
import { useToast } from "@/hooks/use-toast";

type CoachProfileData = {
  id: string;
  slug: string | null;
  display_name: string | null;
  headline: string | null;
  positioning_statement: string | null;
  methodology: string | null;
  proof_points: unknown;
  audience: string | null;
  tier: string | null;
  lifecycle_status: string | null;
};

type CoachProduct = {
  id: string;
  coach_id: string;
  product_type: string | null;
  title: string | null;
  summary: string | null;
  duration_minutes: number | null;
  format: string | null;
  pricing_band: string | null;
  is_active: boolean | null;
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
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

export default function CoachProfile() {
  const { slug, id, coachId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const resolvedSlug = slug;
  const fallbackId = !slug ? id || coachId : null;

  const [coach, setCoach] = useState<CoachProfileData | null>(null);
  const [products, setProducts] = useState<CoachProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState("");

  // Stripe state
  const { isLoading: paymentLoading, error: paymentError, createCheckoutSession } = useStripePayment();
  const stripePromise = null;
  const clientSecret = null;
  const paymentStatus = "idle";
  const initiateCoachingPurchase = createCheckoutSession;
  const resetPayment = () => {};

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CoachProduct | null>(null);
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoach();
  }, [resolvedSlug, fallbackId]);

  const fetchCoach = async () => {
    setLoading(true);
    setDebugError("");

    try {
      let query = (supabase
        .from("coaches")
        .select(
          "id, display_name, headline, bio, specialties, avatar_url, booking_url, status, current_role, location"
        ) as any)
        .eq("status", "approved");

      if (resolvedSlug) {
        query = query.eq("slug", resolvedSlug);
      } else if (fallbackId) {
        query = query.eq("id", fallbackId);
      } else {
        setDebugError("Missing slug or coach id");
        setCoach(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error(error);
        setDebugError(JSON.stringify(error));
        setCoach(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      if (!data) {
        setCoach(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      setCoach(data as unknown as CoachProfileData);

      // coach_products table doesn't exist yet — skip product fetch
      setProducts([]);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setDebugError("Unexpected profile load error");
      setCoach(null);
      setProducts([]);
      setLoading(false);
    }
  };

  const proofPoints = useMemo(
    () => normalizeProofPoints(coach?.proof_points),
    [coach?.proof_points]
  );

  const handleSelectProgram = async (product: CoachProduct) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase a coaching session.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Use price_cents if set, else fall back to a default (admins should set this)
    const amountCents = (product as any).price_cents ?? 0;
    if (!amountCents) {
      toast({
        title: "Pricing unavailable",
        description: "This program doesn't have a price set yet. Please contact the coach directly.",
        variant: "destructive",
      });
      return;
    }

    setSelectedProduct(product);
    setBuyingProductId(product.id);

    await initiateCoachingPurchase(product.id);

    setCheckoutOpen(true);
    setBuyingProductId(null);
  };

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    resetPayment();
    toast({
      title: "Booking confirmed!",
      description: "Check your email for session details.",
    });
  };

  const handleCheckoutClose = () => {
    setCheckoutOpen(false);
    resetPayment();
    setSelectedProduct(null);
  };

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
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                        <Sparkles className="h-3.5 w-3.5" />
                        Galoras Coaching Exchange
                      </div>

                      {coach.tier && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-border text-xs font-medium">
                          {coach.tier}
                        </div>
                      )}

                      {coach.audience && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
                          Audience: {coach.audience}
                        </div>
                      )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
                      {coach.display_name || "Unnamed Coach"}
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl">
                      {coach.positioning_statement || "Positioning statement not available."}
                    </p>

                    {coach.headline && (
                      <p className="text-sm text-muted-foreground">
                        {coach.headline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6">
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
                            <p className="text-muted-foreground leading-7">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Proof points not available.
                      </p>
                    )}
                  </section>

                  <section className="rounded-2xl border border-border bg-card p-8">
                    <h2 className="text-2xl font-semibold mb-4">Programs & Packages</h2>

                    {products.length > 0 ? (
                      <div className="space-y-4">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="rounded-xl border border-primary/20 bg-primary/5 p-6"
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div className="max-w-2xl">
                                <h3 className="text-lg font-semibold mb-2">
                                  {product.title || "Untitled Product"}
                                </h3>

                                <p className="text-sm text-muted-foreground mb-4">
                                  {product.summary || "No summary available."}
                                </p>

                                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                  {product.product_type && (
                                    <span className="rounded-full border border-border px-3 py-1">
                                      {product.product_type}
                                    </span>
                                  )}
                                  {product.duration_minutes && (
                                    <span className="rounded-full border border-border px-3 py-1">
                                      {product.duration_minutes} min
                                    </span>
                                  )}
                                  {product.format && (
                                    <span className="rounded-full border border-border px-3 py-1">
                                      {product.format}
                                    </span>
                                  )}
                                  {product.pricing_band && (
                                    <span className="rounded-full border border-border px-3 py-1">
                                      {product.pricing_band}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="shrink-0">
                                <Button
                                  onClick={() => handleSelectProgram(product)}
                                  disabled={buyingProductId === product.id}
                                >
                                  {buyingProductId === product.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Loading...
                                    </>
                                  ) : (
                                    "Select Program"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No active products available.</p>
                    )}
                  </section>
                </div>

                <div className="mt-10 text-center">
                  <Link to="/coaching">
                    <Button variant="outline">Back to Coaching Exchange</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      {checkoutOpen && selectedProduct && (
        <CheckoutModal
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
        />
      )}

      {paymentError && !checkoutOpen && (
        <div className="fixed bottom-4 right-4 max-w-sm rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive shadow-md">
          {paymentError}
        </div>
      )}
    </Layout>
  );
}