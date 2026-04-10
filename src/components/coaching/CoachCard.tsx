import { Link } from "react-router-dom";
import { Award, MapPin, ArrowRight } from "lucide-react";

// ── Tier config ────────────────────────────────────────────────
const TIER_CONFIG: Record<string, { label: string; className: string }> = {
  elite:    { label: "Elite",       className: "bg-amber-500/20 border border-amber-500/40 text-amber-300" },
  premium:  { label: "Premium",    className: "bg-blue-500/20 border border-blue-500/40 text-blue-300" },
  standard: { label: "Standard",   className: "bg-white/10 border border-white/20 text-white/70" },
};

const AUDIENCE_LABELS: Record<string, string> = {
  individual: "Individuals",
  sme:        "SME",
  enterprise: "Enterprise",
  startup:    "Startups",
  nonprofit:  "Non-Profit",
  government: "Government",
};

const FORMAT_LABELS: Record<string, string> = {
  online:    "Remote",
  in_person: "In-Person",
  hybrid:    "Hybrid",
};

// ── Props ──────────────────────────────────────────────────────
interface CoachCardProps {
  id: string;

  // Routing — prefer slug, fall back to id for existing coaches
  slug?: string | null;

  // Identity
  displayName?: string | null;
  avatarUrl?: string | null;
  cutoutUrl?: string | null;
  location?: string | null;
  currentRole?: string | null;

  // Legacy free-text fields (kept for backward compat — used as fallback)
  headline?: string | null;
  bio?: string | null;
  specialties?: string[] | null;

  // SOW #1 structured fields
  positioningStatement?: string | null;  // replaces bio
  tier?: "standard" | "premium" | "elite" | null;
  audience?: string[] | null;
  engagementFormat?: string | null;

  // Categories from coach_categories join
  categories?: { id: string; name: string; icon?: string | null }[] | null;

  // Legacy flags
  isFeatured?: boolean | null;
  isEnterpriseReady?: boolean | null;

  variant?: "default" | "static";
}

export function CoachCard({
  id,
  slug,
  displayName,
  avatarUrl,
  headline,
  bio,
  specialties,
  location,
  currentRole,
  positioningStatement,
  tier,
  audience,
  engagementFormat,
  categories,
  variant = "default",
}: CoachCardProps) {
  const name     = displayName || "Coach";
  const subtitle = currentRole || specialties?.[0] || null;

  // Prefer structured field, fall back to legacy for coaches not yet migrated
  const description = positioningStatement || bio || null;

  // Prefer slug for clean URLs, fall back to id for existing records
  const profilePath = slug ? `/coach/${slug}` : `/coaching/${id}`;

  // Tier badge
  const tierCfg = tier ? TIER_CONFIG[tier] : null;

  // First category for credential row
  const primaryCategory = categories?.[0] || null;
  const credentialLabel = primaryCategory?.name || specialties?.[0] || null;
  const credentialIcon  = primaryCategory?.icon || null;

  // Audience labels — first two only
  const audienceLabels = (audience ?? [])
    .map(a => AUDIENCE_LABELS[a] ?? a)
    .slice(0, 2);

  const cardContent = (
    <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg">

      {/* Hero image */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-5xl font-bold text-muted-foreground/40">
              {name.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top badges row */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
            Verified Galoras Coach
          </div>
          {tierCfg && (
            <div className={`px-2.5 py-1 text-xs font-bold rounded-full ${tierCfg.className}`}>
              {tierCfg.label}
            </div>
          )}
        </div>

        {/* Portrait + name + role */}
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-14 h-14 rounded-full border-2 border-white object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full border-2 border-white bg-muted flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground">
                {name.charAt(0)}
              </span>
            </div>
          )}
          <div className="text-white">
            <div className="font-semibold">{name}</div>
            {subtitle && (
              <div className="text-sm opacity-90">{subtitle}</div>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="p-6 space-y-4">

        {/* Headline (kept from legacy) */}
        {headline && (
          <h3 className="text-primary font-semibold text-lg">{headline}</h3>
        )}

        {/* Positioning statement (structured) or bio fallback */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}

        {/* Credentials row */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {credentialLabel && (
            <div className="flex items-center gap-2">
              {credentialIcon ? (
                <span style={{ fontSize: 14 }}>{credentialIcon}</span>
              ) : (
                <Award size={16} />
              )}
              {credentialLabel}
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {location}
            </div>
          )}
          {engagementFormat && FORMAT_LABELS[engagementFormat] && (
            <div className="flex items-center gap-2 text-xs">
              {FORMAT_LABELS[engagementFormat]}
            </div>
          )}
        </div>

        {/* Audience tags — only shown if structured data exists */}
        {audienceLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {audienceLabels.map(a => (
              <span
                key={a}
                className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {/* View Profile */}
        <div className="flex items-center gap-2 text-primary font-medium">
          <span>View Profile</span>
          <ArrowRight size={16} />
        </div>

      </div>
    </div>
  );

  if (variant === "static") {
    return <div className="group block">{cardContent}</div>;
  }

  return (
    <Link to={profilePath} className="group block">
      {cardContent}
    </Link>
  );
}
