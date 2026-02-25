import { Link } from "react-router-dom";
import { Award, MapPin, ArrowRight } from "lucide-react";

interface CoachCardProps {
  id: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  headline?: string | null;
  specialties?: string[] | null;
  isFeatured?: boolean | null;
  isEnterpriseReady?: boolean | null;
  bio?: string | null;
  location?: string | null;
  currentRole?: string | null;
}

export function CoachCard({
  id,
  displayName,
  avatarUrl,
  headline,
  specialties,
  bio,
  location,
  currentRole,
}: CoachCardProps) {
  const name = displayName || "Coach";
  const subtitle = currentRole || specialties?.[0] || null;

  return (
    <Link to={`/coaching/${id}`} className="group block">
      <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg">
        {/* Hero Image */}
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

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Verified Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
            Verified Galoras Coach
          </div>

          {/* Portrait + Name + Role */}
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

        {/* Content Area */}
        <div className="p-6 space-y-4">
          {headline && (
            <h3 className="text-primary font-semibold text-lg">{headline}</h3>
          )}

          {bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
          )}

          {/* Credentials */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {specialties?.[0] && (
              <div className="flex items-center gap-2">
                <Award size={16} />
                {specialties[0]}
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                {location}
              </div>
            )}
          </div>

          {/* View Profile (styled span, not a link) */}
          <div className="flex items-center gap-2 text-primary font-medium">
            <span>View Profile</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
