import { Bell, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PortalTopBarProps {
  displayName: string;
  tier: string | null;
  fitScore: number;
  avatarUrl: string | null;
}

function getTierLabel(tier: string | null): string {
  if (!tier) return 'Pro';
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function PortalTopBar({ displayName, tier, fitScore, avatarUrl }: PortalTopBarProps) {
  const tierLabel = getTierLabel(tier);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-white hover:bg-white/5">
          <Plus className="h-4 w-4 mr-1.5" />
          New Feed
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Work</span>
          <span className="text-primary font-medium">| 3 RE</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Tier badge */}
        <Badge className="bg-accent/15 text-accent border border-accent/30 font-display font-semibold text-xs px-3 py-1">
          {tierLabel}
        </Badge>

        {/* Fit score */}
        <div className="flex items-center gap-1.5">
          <span className="text-accent font-display font-bold text-lg">{fitScore}</span>
          <span className="text-muted-foreground text-xs">/100</span>
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>

        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-medium text-primary">
              {displayName?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
