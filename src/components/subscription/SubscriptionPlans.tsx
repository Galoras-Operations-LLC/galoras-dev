import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, Sparkles, Minus } from "lucide-react";
import { useStripePayment } from "@/hooks/useStripePayment";

type Plan = "pro" | "elite" | "master";

const PLANS = [
  {
    key: "pro" as Plan,
    name: "Pro",
    tagline: "Get seen. Get started.",
    price: "$49",
    period: "/month",
    trial: "Start free for 3 months",
    description: "Entry-level visibility for coaches ready to build their practice on the Galoras platform.",
    features: [
      "Verified profile listing",
      "Session booking via platform",
      "Stripe payment integration",
      "In-platform Zoom meetings",
      "AI session summaries",
      "Shared action boards",
      "Community access",
    ],
  },
  {
    key: "elite" as Plan,
    name: "Elite",
    tagline: "Train like a pro. Show up like one.",
    price: "$99",
    period: "/month",
    badge: "Most Popular",
    description: "For active coaches seeking structure, credibility, and a validated framework to deliver real results.",
    features: [
      "Everything in Pro",
      "Enhanced profile & priority exposure",
      "Leadership Labs access",
      "Exclusive content & resources",
      "Webinar & teaching roles",
      "Priority community access",
      "Sport of Business™ Foundations",
    ],
    highlighted: true,
  },
  {
    key: "master" as Plan,
    name: "Master",
    tagline: "We don't list you. We back you.",
    price: "$197",
    period: "/month",
    cta: "Apply for Master",
    description: "For established coaches and ex-executives ready for enterprise delivery and featured placement.",
    features: [
      "Everything in Elite",
      "Featured placement & promotion",
      "Advanced Sport of Business™ cert.",
      "Eligible for B2B enterprise delivery",
      "Direct leadership access",
      "Published thought leadership",
      "Enterprise coaching opportunities",
    ],
  },
];

const COMPARISON_ROWS = [
  { label: "Profile & Visibility",    pro: "Verified listing",          elite: "Enhanced + priority",         master: "Featured & promoted" },
  { label: "Booking & Payments",      pro: "Full Stripe flow",           elite: "Full Stripe flow",            master: "Full Stripe flow" },
  { label: "Platform Tools",          pro: "Zoom + AI + action boards",  elite: "Zoom + AI + action boards",   master: "Zoom + AI + action boards" },
  { label: "Community",               pro: "Standard access",            elite: "Priority + exclusive",        master: "Direct leadership access" },
  { label: "Training",                pro: null,                         elite: "Sport of Business™ Foundations", master: "Advanced certification" },
  { label: "Teaching Roles",          pro: null,                         elite: "Webinars & Leadership Labs",  master: "Thought leadership & publishing" },
  { label: "Enterprise Delivery",     pro: null,                         elite: null,                          master: "Deliver Sport of Business™" },
];

interface SubscribeFormProps {
  plan: Plan;
  onSuccess: () => void;
  onCancel: () => void;
}

function SubscribeForm({ plan, onSuccess, onCancel }: SubscribeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setPayError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription-success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setPayError(error.message ?? "Payment failed. Please try again.");
      setPaying(false);
    } else {
      setSucceeded(true);
      setPaying(false);
      setTimeout(() => onSuccess(), 1500);
    }
  };

  if (succeeded) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <p className="text-xl font-semibold">Welcome to Galoras!</p>
        <p className="text-muted-foreground text-center max-w-xs">
          Your subscription is active. Start exploring coaches now.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {payError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          {payError}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={paying}
        >
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={!stripe || paying}>
          {paying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>
    </form>
  );
}

interface SubscriptionPlansProps {
  onSuccess?: () => void;
}

export function SubscriptionPlans({ onSuccess }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const {
    stripePromise,
    clientSecret,
    status,
    error,
    initiateSubscription,
    reset,
  } = useStripePayment();

  const handleSelectPlan = async (plan: Plan) => {
    if (plan === "master") {
      window.location.href = "/apply";
      return;
    }
    setSelectedPlan(plan);
    await initiateSubscription(plan);
  };

  const handleSuccess = () => {
    reset();
    setSelectedPlan(null);
    onSuccess?.();
  };

  const handleBack = () => {
    reset();
    setSelectedPlan(null);
  };

  // Show payment form once clientSecret is ready
  if (status === "ready" && clientSecret && selectedPlan) {
    const plan = PLANS.find((p) => p.key === selectedPlan)!;
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to plans
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {plan.name}
            </span>
          </div>
          <p className="text-2xl font-bold">
            {plan.price}
            <span className="text-base font-normal text-muted-foreground">
              {plan.period}
            </span>
          </p>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#f97316",
                borderRadius: "8px",
              },
            },
          }}
        >
          <SubscribeForm
            plan={selectedPlan}
            onSuccess={handleSuccess}
            onCancel={handleBack}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Tier cards */}
      <div className="grid gap-6 md:grid-cols-3 items-start">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`relative rounded-2xl border flex flex-col overflow-hidden ${
              plan.highlighted
                ? "border-primary shadow-lg shadow-primary/10"
                : "border-border bg-card"
            }`}
          >
            {plan.badge && (
              <div className="bg-primary text-primary-foreground text-xs font-bold text-center py-1.5 tracking-wider uppercase">
                {plan.badge}
              </div>
            )}

            <div className={`p-6 border-b border-border ${plan.highlighted ? "bg-primary/5" : ""}`}>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{plan.name}</p>
              <p className="text-sm text-muted-foreground italic mb-3">"{plan.tagline}"</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-muted-foreground text-sm mb-1.5">{plan.period}</span>
              </div>
              {plan.trial && (
                <p className="text-xs text-primary font-medium">{plan.trial}</p>
              )}
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{plan.description}</p>
            </div>

            <div className="p-6 flex flex-col flex-1 gap-5">
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.highlighted ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                variant={plan.highlighted ? "default" : "outline"}
                disabled={status === "loading" && selectedPlan === plan.key}
                onClick={() => handleSelectPlan(plan.key)}
              >
                {status === "loading" && selectedPlan === plan.key ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</>
                ) : plan.key === "master" ? (
                  "Apply for Master →"
                ) : plan.key === "pro" ? (
                  "Start free for 3 months →"
                ) : (
                  "Upgrade to Elite →"
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="bg-muted/40 px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">What each tier unlocks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-muted-foreground font-medium w-1/4">Feature</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Pro<span className="block text-xs text-muted-foreground font-normal">$49/mo</span></th>
                <th className="px-4 py-3 text-center font-semibold text-primary">Elite<span className="block text-xs text-primary/70 font-normal">$99/mo</span></th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Master<span className="block text-xs text-muted-foreground font-normal">$197/mo</span></th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={row.label} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                  <td className="px-6 py-3 text-muted-foreground font-medium">{row.label}</td>
                  <td className="px-4 py-3 text-center">
                    {row.pro ? <span className="text-foreground">{row.pro}</span> : <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center bg-primary/5">
                    {row.elite ? <span className="text-foreground">{row.elite}</span> : <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.master ? <span className="text-foreground">{row.master}</span> : <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-muted/20 px-6 py-3 text-xs text-muted-foreground border-t border-border">
          All plans include the Galoras platform, Zoom integration, AI session tools, and community access.
        </div>
      </div>
    </div>
  );
}
