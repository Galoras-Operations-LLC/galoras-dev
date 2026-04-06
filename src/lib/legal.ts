import { supabase } from "@/integrations/supabase/client";

export const DOCUMENT_VERSION = "2026-01-v1";

export type AgreementType =
  | "terms_of_service"
  | "privacy_policy"
  | "payments_refunds"
  | "coach_agreement"
  | "cookie_policy"
  | "marketing_opt_in"
  | "cooling_off_waiver"
  | "coach_standards";

export type AgreementContext =
  | "user_signup"
  | "coach_signup"
  | "onboarding"
  | "coach_tier_payment"
  | "session_checkout"
  | "cookie_banner";

/**
 * Records one or more legal agreement acceptances for the current user.
 * Silently no-ops if not authenticated (call only when session exists).
 */
export async function recordAgreements({
  context,
  agreementTypes,
  marketingOptIn,
  email,
}: {
  context: AgreementContext;
  agreementTypes: AgreementType[];
  marketingOptIn?: boolean;
  email?: string;
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? null;
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : null;

  const rows = agreementTypes.map((type) => ({
    user_id: userId,
    email: email ?? user?.email ?? null,
    agreement_type: type,
    document_version: DOCUMENT_VERSION,
    context,
    user_agent: userAgent,
    accepted: true,
    marketing_opt_in:
      type === "marketing_opt_in" ? (marketingOptIn ?? true) : null,
  }));

  await supabase.from("legal_agreements").insert(rows);
}
