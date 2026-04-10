import {
  Eye,
  MessageSquare,
  Tag,
  Zap,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Bookmark,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/* ---------- types ---------- */

interface CoachProfile {
  primary_pillar?: string | null;
  tier?: string | null;
  coaching_style?: string | null;
  engagement_model?: string | null;
  readiness_score?: number | null;
  display_name?: string | null;
}

interface OverviewTabProps {
  coachProfile: CoachProfile;
  pendingCount: number;
  confirmedCount: number;
}

/* ---------- static data ---------- */

const activityItems = [
  { icon: Eye, text: 'Your profile was viewed by a CEO (Tech sector)', time: 'just now' },
  { icon: MessageSquare, text: 'You received a new inquiry: "Interested in a one-on-one coaching session."', time: '2 hours ago' },
  { icon: Tag, text: 'Admin updated your ecosystem tags.', time: '1 day ago' },
  { icon: Zap, text: 'New match signal: 2 Founders \u2013 Series A.', time: '1 day ago' },
];

/* ---------- sub-components ---------- */

function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
}: {
  label: string;
  value: number;
  delta?: number;
  deltaLabel?: string;
  icon: React.ElementType;
}) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          {delta !== undefined && (
            <span className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? '+' : ''}{delta}%
            </span>
          )}
        </div>
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {label}
          {deltaLabel && <span className="ml-1 text-muted-foreground/60">{deltaLabel}</span>}
        </p>
      </CardContent>
    </Card>
  );
}

function FitScoreBadge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-display font-bold text-accent">{score}</span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export function OverviewTab({ coachProfile, pendingCount, confirmedCount }: OverviewTabProps) {
  const fitScore = coachProfile.readiness_score ?? 89;
  const pillar = coachProfile.primary_pillar ?? 'Leadership';
  const tier = coachProfile.tier ?? 'Pro';
  const style = coachProfile.coaching_style ?? 'Strategic';
  const engagementModel = coachProfile.engagement_model ?? 'Hybrid';

  return (
    <div className="flex gap-6">
      {/* Left: main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Performance Snapshot */}
        <div>
          <h2 className="text-lg font-display font-bold text-white mb-4">Performance Snapshot</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Profile Views"
              value={142}
              delta={12}
              deltaLabel="vs. last 30d"
              icon={Eye}
            />
            <StatCard
              label="Inquiries"
              value={pendingCount}
              delta={pendingCount > 0 ? 8 : -5}
              deltaLabel="vs. last 30d"
              icon={Users}
            />
            <StatCard
              label="Intro Sessions"
              value={confirmedCount}
              delta={confirmedCount > 0 ? 15 : 0}
              deltaLabel="vs. last 30d"
              icon={Calendar}
            />
            <StatCard
              label="Saves / Shortlists"
              value={23}
              delta={4}
              deltaLabel="vs. last 30d"
              icon={Bookmark}
            />
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-white">Activity Feed</h2>
            <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              View all
            </button>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-0 divide-y divide-border">
              {activityItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 px-5 py-4">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 leading-snug">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right: Ecosystem Positioning */}
      <div className="hidden xl:block w-72 shrink-0">
        <h2 className="text-lg font-display font-bold text-white mb-4">Ecosystem Positioning</h2>
        <Card className="bg-card border-border">
          <CardContent className="p-5 space-y-5">
            {/* Primary Pillar */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Primary Pillar</p>
              <p className="text-sm font-semibold text-white">{pillar}</p>
            </div>

            {/* Enterprise Fit Score */}
            <div className="flex flex-col items-center py-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Enterprise Fit</p>
              <FitScoreBadge score={fitScore} />
            </div>

            {/* Coaching Style */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Coaching Style</p>
              <p className="text-sm font-semibold text-white">{style}</p>
            </div>

            {/* Engagement Model */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Engagement Model</p>
              <p className="text-sm font-semibold text-white">{engagementModel}</p>
            </div>

            {/* Tier */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tier</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-accent/15 text-accent text-xs font-display font-semibold border border-accent/20 capitalize">
                {tier}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
