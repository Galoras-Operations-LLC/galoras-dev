import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, Calendar, Mail } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CoachProduct {
  id:               string;
  product_type:     string;
  title:            string;
  summary?:         string | null;
  what_you_get?:    string[] | null;
  who_its_for?:     string | null;
  duration_label?:  string | null;
  format?:          "online" | "in_person" | "hybrid" | null;
  pricing_band?:    string | null;
  price_display?:   string | null;
  price_cents?:     number | null;
  cta_label:        string;
  cta_url?:         string | null;
  sort_order:       number;
}

// ── Config ────────────────────────────────────────────────────────────────────

// Static fallback — used when no getTypeConfig prop is provided
const STATIC_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  // Legacy types
  diagnostic:       { label: "Diagnostic",          className: "bg-violet-500/10 border-violet-500/30 text-violet-400" },
  block:            { label: "Coaching Block",       className: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  program:          { label: "Programme",            className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  enterprise:       { label: "Enterprise",           className: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  // Spec types
  single_session:   { label: "Single Session",       className: "bg-sky-500/10 border-sky-500/30 text-sky-400" },
  coaching_package: { label: "Coaching Package",     className: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  intensive:        { label: "Intensive",            className: "bg-violet-500/10 border-violet-500/30 text-violet-400" },
  group_program:    { label: "Group Program",        className: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  workshop_event:   { label: "Workshop / Event",     className: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  corporate:        { label: "Corporate Engagement", className: "bg-orange-500/10 border-orange-500/30 text-orange-400" },
};
const DEFAULT_TYPE_CONFIG = { label: "Other", className: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400" };

const FORMAT_LABELS: Record<string, string> = {
  online:    "Remote",
  in_person: "In-Person",
  hybrid:    "Hybrid",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product:        CoachProduct;
  coachName?:     string;
  getTypeConfig?: (slug: string) => { label: string; className: string };
  /** When provided, overrides the default CTA behaviour (used for Stripe checkout). */
  onCtaClick?:    () => void;
}

export function ProductCard({ product, coachName, getTypeConfig, onCtaClick }: ProductCardProps) {
  const typeCfg = getTypeConfig
    ? getTypeConfig(product.product_type)
    : (STATIC_TYPE_CONFIG[product.product_type] ?? { ...DEFAULT_TYPE_CONFIG, label: product.product_type });

  // If a Stripe handler is wired and the product has a fixed price → "Book Now"
  const isStripe  = !!onCtaClick && !!product.price_cents;
  const hasCta    = !!product.cta_url || isStripe;
  const ctaLabel  = product.cta_label || "Book Now";
  const enquiry   = !hasCta;

  const handleCta = () => {
    if (onCtaClick) { onCtaClick(); return; }
    if (product.cta_url) {
      window.open(product.cta_url, "_blank", "noopener,noreferrer");
    } else {
      const subject = encodeURIComponent(`Enquiry: ${product.title}${coachName ? ` — ${coachName}` : ""}`);
      window.location.href = `mailto:hello@galoras.com?subject=${subject}`;
    }
  };

  return (
    <Card className="group flex flex-col border border-border hover:border-primary/30 transition-colors duration-200">
      <CardContent className="p-6 flex flex-col h-full">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${typeCfg.className}`}>
                {typeCfg.label}
              </span>
              {product.format && FORMAT_LABELS[product.format] && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground border border-border">
                  {FORMAT_LABELS[product.format]}
                </span>
              )}
            </div>
            <h3 className="text-base font-display font-semibold leading-snug">
              {product.title}
            </h3>
          </div>

          {/* Price */}
          {product.price_display && (
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-foreground">{product.price_display}</p>
            </div>
          )}
        </div>

        {/* Summary */}
        {product.summary && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {product.summary}
          </p>
        )}

        {/* Who it's for */}
        {product.who_its_for && (
          <p className="text-xs text-muted-foreground italic mb-4">
            <span className="font-medium not-italic text-foreground/70">For: </span>
            {product.who_its_for}
          </p>
        )}

        {/* What you get */}
        {product.what_you_get && product.what_you_get.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {product.what_you_get.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Spacer — pushes footer to bottom */}
        <div className="flex-1" />

        {/* Footer: duration + CTA */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border mt-4">
          {product.duration_label ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {product.duration_label}
            </span>
          ) : (
            <span />
          )}

          <Button
            size="sm"
            variant={enquiry ? "outline" : "default"}
            className="shrink-0"
            onClick={handleCta}
          >
            {enquiry ? (
              <>
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                {ctaLabel === "Book Now" ? "Enquire" : ctaLabel}
              </>
            ) : (
              <>
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                {ctaLabel}
              </>
            )}
          </Button>
        </div>

      </CardContent>
    </Card>
  );
}
