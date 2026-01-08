import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface CoachCardProps {
  id: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  headline?: string | null;
  specialties?: string[] | null;
  isFeatured?: boolean | null;
  isEnterpriseReady?: boolean | null;
}

export function CoachCard({
  id,
  displayName,
  avatarUrl,
  headline,
  specialties,
  isFeatured,
  isEnterpriseReady,
}: CoachCardProps) {
  const name = displayName || "Coach";
  const firstName = name.split(" ")[0];
  const lastName = name.split(" ").slice(1).join(" ");
  const primarySpecialty = specialties?.[0] || "Business";

  return (
    <div className="group bg-card rounded-2xl border border-border hover:border-primary/50 p-6 transition-all card-hover text-center relative">
      {/* Top Rate Badge */}
      {isFeatured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-xs font-bold rounded-full shadow-lg">
            <Award className="h-3 w-3" />
            100% Guaranteed
          </div>
        </div>
      )}

      {/* Circular Avatar with Light Blue Background */}
      <div className="relative mx-auto w-32 h-32 mb-4">
        <div className="absolute inset-0 rounded-full bg-sky-100 dark:bg-sky-900/30" />
        <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-primary">
              {name.charAt(0)}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <h3 className="font-display text-xl mb-2">
        <span className="font-medium text-primary">Coach</span>{" "}
        <span className="font-bold">{firstName}</span>
        {lastName && <span className="font-bold"> {lastName}</span>}
      </h3>

      {/* Top Rate Tag */}
      <Badge 
        variant="outline" 
        className="mb-3 border-primary/50 text-foreground font-medium"
      >
        Top Rate
      </Badge>

      {/* Specialty */}
      <p className="text-muted-foreground mb-4">{primarySpecialty}</p>

      {/* View Profile Button */}
      <Link to={`/coaching/${id}`}>
        <Button 
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
        >
          View Profile
        </Button>
      </Link>
    </div>
  );
}