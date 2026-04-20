import { useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "");

export type PaymentStatus = "idle" | "loading" | "ready" | "success" | "error";

export interface UseStripePaymentReturn {
  stripePromise: Promise<Stripe | null>;
  clientSecret: string | null;
  bookingId: string | null;
  subscriptionId: string | null;
  status: PaymentStatus;
  error: string | null;
  initiateCoachingPurchase: (params: {
    productId: string;
    coachId: string;
    amountCents: number;
    currency?: string;
  }) => Promise<void>;
  initiateSubscription: (plan: "b2c_monthly" | "b2c_annual" | "enterprise") => Promise<void>;
  reset: () => void;
}

export function useStripePayment(): UseStripePaymentReturn {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const getAuthHeader = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? `Bearer ${session.access_token}` : null;
  };

  const initiateCoachingPurchase = async ({
    productId,
    coachId,
    amountCents,
    currency = "usd",
  }: {
    productId: string;
    coachId: string;
    amountCents: number;
    currency?: string;
  }) => {
    setStatus("loading");
    setError(null);

    try {
      const authHeader = await getAuthHeader();
      if (!authHeader) {
        setError("Please sign in to purchase a session.");
        setStatus("error");
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: { productId, coachId, amountCents, currency },
          headers: { Authorization: authHeader },
        }
      );

      if (fnError || !data?.clientSecret) {
        setError(data?.error ?? fnError?.message ?? "Failed to initiate payment.");
        setStatus("error");
        return;
      }

      setClientSecret(data.clientSecret);
      setBookingId(data.bookingId);
      setStatus("ready");
    } catch (err: any) {
      setError(err.message ?? "Unexpected error.");
      setStatus("error");
    }
  };

  const initiateSubscription = async (
    plan: "b2c_monthly" | "b2c_annual" | "enterprise"
  ) => {
    setStatus("loading");
    setError(null);

    try {
      const authHeader = await getAuthHeader();
      if (!authHeader) {
        setError("Please sign in to subscribe.");
        setStatus("error");
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        "create-subscription",
        {
          body: { plan },
          headers: { Authorization: authHeader },
        }
      );

      if (fnError || !data?.clientSecret) {
        setError(data?.error ?? fnError?.message ?? "Failed to initiate subscription.");
        setStatus("error");
        return;
      }

      setClientSecret(data.clientSecret);
      setSubscriptionId(data.subscriptionId);
      setStatus("ready");
    } catch (err: any) {
      setError(err.message ?? "Unexpected error.");
      setStatus("error");
    }
  };

  const reset = () => {
    setClientSecret(null);
    setBookingId(null);
    setSubscriptionId(null);
    setStatus("idle");
    setError(null);
  };

  return {
    stripePromise,
    clientSecret,
    bookingId,
    subscriptionId,
    status,
    error,
    initiateCoachingPurchase,
    initiateSubscription,
    reset,
  };
}
