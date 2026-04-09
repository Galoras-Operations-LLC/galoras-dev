import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle, CalendarCheck, GitCompareArrows, Building2 } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";

// ── Types ─────────────────────────────────────────────────────────────────────

type CoachProduct = {
  product_type: string;
  title: string;
  price_type: string;
  price_amount: number | null;
  enterprise_ready: boolean;
};

export type DirectoryCoach = {
  id: string;
  slug: string | null;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  specialties: string[] | null;
  audience: string[] | null;
  avatar_url: string | null;
  booking_url: string | null;
  tier: string | null;
  primary_pillar: string | null;
  engagement_format: string | null;
  coaching_style: string | null;
  coach_products?: CoachProduct[] | null;
};

type TagEntry = { tag_key: string; tag_label: string; tag_family: string };

interface DirectoryCoachCardProps {
  coach: DirectoryCoach;
  profilePath: string;
  matchScore: number;
  hasMatches: boolean;
  isLoggedIn: boolean;
  coachTags: TagEntry[];
  compareList: string[];
  getConfig: (slug: string) => { label: string; className: string };
  onToggleCompare: (id: string) => void;
  onContact: (id: string, name: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function priceAnchor(products: CoachProduct[] | null | undefined): string | null {
  if (!products || products.length === 0) return null;
  const fixed = products
    .filter(p => p.price_type === "fixed" && p.price_amount)
    .map(p => p.price_amount!);
  if (fixed.length === 0) return null;
  const min = Math.min(...fixed);
  return `From $${(min / 100).toLocaleString()}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DirectoryCoachCard({
  coach,
  profilePath,
  matchScore: score,
  hasMatches,
  isLoggedIn,
  coachTags,
  compareList,
  getConfig,
  onToggleCompare,
  onContact,
}: DirectoryCoachCardProps) {
  const price = priceAnchor(coach.coach_products);
  const featuredProduct = coach.coach_products?.[0];
  const hasEnterprise = (coach.coach_products || []).some(p => p.enterprise_ready);
  const audienceLabels = coachTags.filter(t => t.tag_family === "audience").slice(0, 2);
  const outcomeLabels = coachTags.filter(t => t.tag_family === "outcome").slice(0, 2);

  return (
    <div className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-primary/40 transition-all duration-200 flex flex-col">
      {/* Photo */}
      <Link to={profilePath} className="relative bg-zinc-800 block" style={{ height: "260px" }}>
        {coach.avatar_url ? (
          <img
            src={coach.avatar_url}
            alt={coach.display_name || "Coach"}
            className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-zinc-600">
              {(coach.display_name || "C").charAt(0)}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />

        {/* Badges: top-right */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {hasMatches && score > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Matched
            </span>
          )}
          {hasEnterprise && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 backdrop-blur-sm">
              <Building2 className="h-3 w-3" />
              Enterprise
            </span>
          )}
        </div>

        {/* Price anchor: bottom-left */}
        {price && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-950/80 text-white backdrop-blur-sm border border-zinc-700/50">
              {price}
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={profilePath}>
          <h3 className="text-base font-bold text-white leading-tight mb-1 hover:text-primary transition-colors">
            {coach.display_name || "Coach"}
          </h3>
        </Link>

        {coach.headline && (
          <p className="text-zinc-400 text-xs mb-3 line-clamp-2 leading-relaxed">
            {coach.headline}
          </p>
        )}

        {/* Professional signals: tier, pillar, format */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {coach.tier && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 capitalize">
              {coach.tier}
            </span>
          )}
          {coach.primary_pillar && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary/10 border border-primary/30 text-primary">
              {coach.primary_pillar}
            </span>
          )}
          {coach.engagement_format && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 capitalize">
              {coach.engagement_format === "in_person" ? "In-Person" : coach.engagement_format}
            </span>
          )}
        </div>

        {/* Featured product */}
        {featuredProduct && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
            <div className="flex items-center gap-2 mb-0.5">
              {(() => {
                const { label, className } = getConfig(featuredProduct.product_type);
                return (
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${className}`}>
                    {label}
                  </span>
                );
              })()}
            </div>
            <p className="text-xs text-zinc-300 font-medium line-clamp-1">{featuredProduct.title}</p>
          </div>
        )}

        {/* Tags: audience + outcome */}
        {(audienceLabels.length > 0 || outcomeLabels.length > 0) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {audienceLabels.map(t => (
              <span key={t.tag_key}
                className="px-2 py-0.5 text-[10px] rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                {t.tag_label}
              </span>
            ))}
            {outcomeLabels.map(t => (
              <span key={t.tag_key}
                className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                {t.tag_label}
              </span>
            ))}
          </div>
        )}

        {/* Specialty tags (legacy) */}
        {coach.specialties && coach.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {coach.specialties.slice(0, 2).map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-500 text-xs capitalize"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="flex gap-2 mt-auto pt-3 border-t border-zinc-800">
          <Link to={profilePath} className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90 text-zinc-950 text-xs font-bold h-9 rounded-lg gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5" />
              View & Book
            </Button>
          </Link>

          <button
            onClick={() => onToggleCompare(coach.id)}
            title={compareList.includes(coach.id) ? "Remove from compare" : "Add to compare"}
            className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
              compareList.includes(coach.id)
                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                : "border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400"
            }`}
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
          </button>

          <AuthGate isLoggedIn={isLoggedIn} message="Sign in to message coaches">
            <button
              onClick={() => onContact(coach.id, coach.display_name || "Coach")}
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-700 text-zinc-400 hover:border-primary/50 hover:text-primary transition-colors"
              title="Send a message"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </button>
          </AuthGate>
        </div>
      </div>
    </div>
  );
}
