import { useState } from "react";

export function useStripePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (_priceId: string) => {
    setIsLoading(true);
    setError("Stripe integration not yet configured.");
    setIsLoading(false);
  };

  return { isLoading, error, createCheckoutSession };
}
