import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export type ConsentContext =
  | "user_signup"
  | "coach_signup"
  | "onboarding"
  | "coach_tier_payment"
  | "session_checkout";

interface ConsentState {
  termsAndPrivacy: boolean;
  paymentsRefunds: boolean;
  coolingOff: boolean;
  coachAgreement: boolean;
  coachStandards: boolean;
  marketing: boolean;
}

interface LegalConsentCheckboxesProps {
  context: ConsentContext;
  /** Called whenever required checkboxes change; passes validity + marketing opt-in */
  onChange: (isValid: boolean, marketingOptIn: boolean) => void;
  /** Light or dark text (default dark) */
  variant?: "light" | "dark";
}

const LinkStyle = "underline underline-offset-2 hover:text-primary transition-colors";

export function LegalConsentCheckboxes({
  context,
  onChange,
  variant = "dark",
}: LegalConsentCheckboxesProps) {
  const textColor = variant === "dark" ? "text-zinc-400" : "text-muted-foreground";
  const labelColor = variant === "dark" ? "text-zinc-200" : "text-foreground";

  const [state, setState] = useState<ConsentState>({
    termsAndPrivacy: false,
    paymentsRefunds: false,
    coolingOff: false,
    coachAgreement: false,
    coachStandards: false,
    marketing: false,
  });

  const update = (key: keyof ConsentState, value: boolean) =>
    setState((prev) => ({ ...prev, [key]: value }));

  // Derive validity per context
  useEffect(() => {
    let valid = false;
    if (context === "user_signup" || context === "coach_signup" || context === "onboarding") {
      valid = state.termsAndPrivacy;
    } else if (context === "coach_tier_payment") {
      valid = state.termsAndPrivacy && state.paymentsRefunds && state.coolingOff && state.coachAgreement;
    } else if (context === "session_checkout") {
      valid = state.termsAndPrivacy && state.paymentsRefunds && state.coolingOff;
    }
    onChange(valid, state.marketing);
  }, [state, context, onChange]);

  const Row = ({
    id,
    checked,
    onChecked,
    required = true,
    children,
  }: {
    id: string;
    checked: boolean;
    onChecked: (v: boolean) => void;
    required?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onChecked(!!v)}
        className="mt-0.5 shrink-0"
      />
      <Label htmlFor={id} className={`text-sm leading-relaxed cursor-pointer ${textColor}`}>
        {children}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* ── All contexts: Terms + Privacy ── */}
      <Row id="consent-terms" checked={state.termsAndPrivacy} onChecked={(v) => update("termsAndPrivacy", v)}>
        I agree to the{" "}
        <Link to="/terms" target="_blank" className={LinkStyle}>Terms of Service</Link>
        {" "}and{" "}
        <Link to="/privacy" target="_blank" className={LinkStyle}>Privacy Policy</Link>.
      </Row>

      {/* ── Subscription & checkout: Payments + Refunds ── */}
      {(context === "coach_tier_payment" || context === "session_checkout") && (
        <Row id="consent-payments" checked={state.paymentsRefunds} onChecked={(v) => update("paymentsRefunds", v)}>
          I agree to the{" "}
          <Link to="/legal/payments" target="_blank" className={LinkStyle}>Payments &amp; Refunds Policy</Link>
          {" "}and understand that my subscription will renew automatically unless cancelled.
        </Row>
      )}

      {/* ── Subscription & checkout: Cooling-off waiver ── */}
      {(context === "coach_tier_payment" || context === "session_checkout") && (
        <Row id="consent-cooling" checked={state.coolingOff} onChecked={(v) => update("coolingOff", v)}>
          I agree to immediate access to the Galoras platform and understand that by doing so,
          I waive my 14-day statutory cooling-off period where applicable.
        </Row>
      )}

      {/* ── Coach tier payment: Coach Agreement ── */}
      {context === "coach_tier_payment" && (
        <Row id="consent-coach" checked={state.coachAgreement} onChecked={(v) => update("coachAgreement", v)}>
          I confirm that I am an independent professional and agree to the{" "}
          <Link to="/legal/coach-agreement" target="_blank" className={LinkStyle}>Coach Agreement</Link>.
        </Row>
      )}

      {/* ── Coach tier payment: Standards (optional) ── */}
      {context === "coach_tier_payment" && (
        <Row id="consent-standards" checked={state.coachStandards} onChecked={(v) => update("coachStandards", v)} required={false}>
          I agree to uphold Galoras' professional standards and understand that coach status
          and badges may be revoked at Galoras' discretion.
        </Row>
      )}

      {/* ── All contexts: Marketing opt-in (optional, unchecked by default) ── */}
      <Row id="consent-marketing" checked={state.marketing} onChecked={(v) => update("marketing", v)} required={false}>
        I'd like to receive updates, insights, and announcements from Galoras.
        I can unsubscribe at any time.
      </Row>

      <p className={`text-xs ${textColor} opacity-70`}>
        Fields marked <span className="text-red-400">*</span> are required to proceed.
      </p>
    </div>
  );
}
