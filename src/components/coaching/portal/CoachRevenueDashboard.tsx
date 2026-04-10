import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  format,
  parseISO,
  subMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  BarChart3,
  AlertCircle,
  Clock,
  Package,
  ArrowRight,
} from 'lucide-react';

/* ---------- types ---------- */

interface Booking {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  client_name: string;
  client_email: string;
  status: string;
  amount_cents?: number | null;
  duration_minutes: number;
}

interface CoachRevenueDashboardProps {
  coachProfile: { id: string; display_name: string | null };
}

/* ---------- component ---------- */

export function CoachRevenueDashboard({ coachProfile }: CoachRevenueDashboardProps) {
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['coach-session-bookings', coachProfile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_bookings')
        .select('*')
        .eq('coach_id', coachProfile.id)
        .order('scheduled_date', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: products = [] } = useQuery<{ id: string; is_active: boolean }[]>({
    queryKey: ['coach-products-status', coachProfile.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('coach_products')
        .select('id, is_active')
        .eq('coach_id', coachProfile.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  /* --- derived stats --- */

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const thisWeekStart = startOfWeek(now);
  const thisWeekEnd = endOfWeek(now);

  const stats = useMemo(() => {
    const completedBookings = bookings.filter((b) => b.status === 'completed');
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
    const pendingBookings = bookings.filter((b) => b.status === 'pending');

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.amount_cents ?? 0), 0);
    const pendingRevenue = confirmedBookings.reduce((sum, b) => sum + (b.amount_cents ?? 0), 0);

    const thisMonthCompleted = completedBookings.filter((b) => {
      const d = parseISO(b.scheduled_date);
      return isWithinInterval(d, { start: thisMonthStart, end: thisMonthEnd });
    });
    const thisMonthRevenue = thisMonthCompleted.reduce((sum, b) => sum + (b.amount_cents ?? 0), 0);

    const avgSessionValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

    const sessionsThisWeek = bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      const d = parseISO(b.scheduled_date);
      return isWithinInterval(d, { start: thisWeekStart, end: thisWeekEnd });
    });

    const inactiveProducts = products.filter((p) => !p.is_active);

    // Revenue by month (last 6 months)
    const monthlyRevenue: { month: string; label: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const mStart = startOfMonth(monthDate);
      const mEnd = endOfMonth(monthDate);
      const amount = completedBookings
        .filter((b) => {
          const d = parseISO(b.scheduled_date);
          return isWithinInterval(d, { start: mStart, end: mEnd });
        })
        .reduce((sum, b) => sum + (b.amount_cents ?? 0), 0);
      monthlyRevenue.push({
        month: format(monthDate, 'yyyy-MM'),
        label: format(monthDate, 'MMM'),
        amount,
      });
    }

    // Opportunity pipeline
    const opportunities = [...pendingBookings, ...confirmedBookings]
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
    const totalOpportunityValue = opportunities.reduce((sum, b) => sum + (b.amount_cents ?? 0), 0);

    return {
      totalRevenue,
      pendingRevenue,
      thisMonthRevenue,
      avgSessionValue,
      pendingCount: pendingBookings.length,
      sessionsThisWeekCount: sessionsThisWeek.length,
      inactiveProductsCount: inactiveProducts.length,
      monthlyRevenue,
      opportunities,
      totalOpportunityValue,
    };
  }, [bookings, products, thisMonthStart, thisMonthEnd, thisWeekStart, thisWeekEnd, now]);

  const maxMonthlyAmount = Math.max(...stats.monthlyRevenue.map((m) => m.amount), 1);

  /* --- loading --- */

  if (bookingsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  /* --- render --- */

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-white">Revenue & Opportunities</h2>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RevenueStatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
        />
        <RevenueStatCard
          icon={TrendingUp}
          label="Pending Revenue"
          value={formatCurrency(stats.pendingRevenue)}
        />
        <RevenueStatCard
          icon={CalendarCheck}
          label="This Month"
          value={formatCurrency(stats.thisMonthRevenue)}
        />
        <RevenueStatCard
          icon={BarChart3}
          label="Avg Session Value"
          value={formatCurrency(stats.avgSessionValue)}
        />
      </div>

      {/* Revenue Trend */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white font-display text-base">Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.monthlyRevenue.every((m) => m.amount === 0) ? (
            <div className="py-8 text-center">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No revenue data yet</p>
            </div>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {stats.monthlyRevenue.map((m) => {
                const heightPct = maxMonthlyAmount > 0 ? (m.amount / maxMonthlyAmount) * 100 : 0;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">
                      {m.amount > 0 ? formatCurrency(m.amount) : ''}
                    </span>
                    <div className="w-full flex items-end" style={{ height: '120px' }}>
                      <div
                        className="w-full bg-primary rounded-t-md transition-all duration-500 min-h-[2px]"
                        style={{ height: `${Math.max(heightPct, 1.5)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opportunity Pipeline + Priority Actions side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opportunity Pipeline */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-display text-base">Opportunity Pipeline</CardTitle>
                <Badge className="bg-accent/10 text-accent border-accent/20">
                  {formatCurrency(stats.totalOpportunityValue)} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {stats.opportunities.length === 0 ? (
                <div className="py-8 text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No pending opportunities</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {stats.opportunities.map((b) => {
                    const isPending = b.status === 'pending';
                    return (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{b.client_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(b.scheduled_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Badge
                            className={
                              isPending
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                : 'bg-primary/10 text-primary border-primary/20'
                            }
                          >
                            {b.status}
                          </Badge>
                          <span className="text-sm font-semibold text-white">
                            {b.amount_cents ? formatCurrency(b.amount_cents) : '--'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Priority Actions */}
        <div>
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-white font-display text-base">Priority Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.pendingCount > 0 && (
                <ActionItem
                  icon={AlertCircle}
                  iconClassName="text-orange-400"
                  text={`${stats.pendingCount} session${stats.pendingCount !== 1 ? 's' : ''} need confirmation`}
                />
              )}

              {stats.sessionsThisWeekCount > 0 && (
                <ActionItem
                  icon={Clock}
                  iconClassName="text-primary"
                  text={`${stats.sessionsThisWeekCount} session${stats.sessionsThisWeekCount !== 1 ? 's' : ''} this week`}
                />
              )}

              {stats.inactiveProductsCount > 0 && (
                <ActionItem
                  icon={Package}
                  iconClassName="text-accent"
                  text={`${stats.inactiveProductsCount} product${stats.inactiveProductsCount !== 1 ? 's' : ''} inactive`}
                />
              )}

              {stats.pendingCount === 0 && stats.sessionsThisWeekCount === 0 && stats.inactiveProductsCount === 0 && (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">All clear -- no actions needed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- sub-components ---------- */

function RevenueStatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function ActionItem({
  icon: Icon,
  iconClassName,
  text,
}: {
  icon: React.ElementType;
  iconClassName: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
      <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        <Icon className={`h-4 w-4 ${iconClassName}`} />
      </div>
      <p className="text-sm text-white flex-1">{text}</p>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
    </div>
  );
}

/* ---------- helpers ---------- */

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
