import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
  isSameMonth,
} from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Mail,
  CheckCircle,
  XCircle,
  DollarSign,
} from 'lucide-react';

/* ---------- types ---------- */

interface Booking {
  id: string;
  coach_id: string;
  client_name: string;
  client_email: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  notes?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
}

interface CoachPipelineCalendarProps {
  coachProfile: { id: string; display_name: string | null };
}

/* ---------- status config ---------- */

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  confirmed: { label: 'Confirmed', className: 'bg-primary/10 text-primary border-primary/20' },
  completed: { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ---------- component ---------- */

export function CoachPipelineCalendar({ coachProfile }: CoachPipelineCalendarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  /* --- data --- */

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
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

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('session_bookings')
        .update({ status })
        .eq('id', id)
        .eq('coach_id', coachProfile.id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      const msg = status === 'confirmed' ? 'Session confirmed' : 'Session declined';
      toast({ title: msg });
      queryClient.invalidateQueries({ queryKey: ['coach-session-bookings'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    },
  });

  /* --- derived data --- */

  const monthBookings = useMemo(
    () => bookings.filter((b) => isSameMonth(parseISO(b.scheduled_date), currentMonth)),
    [bookings, currentMonth],
  );

  const pending = monthBookings.filter((b) => b.status === 'pending');
  const confirmed = monthBookings.filter((b) => b.status === 'confirmed');
  const completed = monthBookings.filter((b) => b.status === 'completed');
  const cancelled = monthBookings.filter((b) => b.status === 'cancelled');

  const selectedDayBookings = useMemo(() => {
    if (!selectedDate) return [];
    return bookings.filter((b) => isSameDay(parseISO(b.scheduled_date), selectedDate));
  }, [bookings, selectedDate]);

  const bookingDates = useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach((b) => {
      if (b.status !== 'cancelled') dates.add(b.scheduled_date);
    });
    return dates;
  }, [bookings]);

  /* --- calendar grid --- */

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  /* --- render --- */

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-white">Pipeline & Calendar</h2>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill label="Pending" count={pending.length} className="text-orange-400" />
        <StatPill label="Confirmed" count={confirmed.length} className="text-primary" />
        <StatPill label="Completed" count={completed.length} className="text-emerald-400" />
        <StatPill label="Cancelled" count={cancelled.length} className="text-red-400" />
      </div>

      {/* Calendar */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-display text-base">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
                className="text-xs"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before month start */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}

            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasBooking = bookingDates.has(dateStr);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(day)}
                  className={`h-10 rounded-lg text-sm font-medium relative transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : today
                        ? 'ring-2 ring-accent text-accent'
                        : 'text-white hover:bg-white/5'
                  }`}
                >
                  {format(day, 'd')}
                  {hasBooking && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day bookings */}
      {selectedDate && (
        <div>
          <h3 className="text-sm font-display font-semibold text-white mb-3">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          {selectedDayBookings.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No sessions on this day</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {selectedDayBookings.map((b) => (
                <BookingCard key={b.id} booking={b} onUpdateStatus={updateStatus} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pipeline by status */}
      <div className="space-y-6">
        <PipelineSection title="Pending" bookings={pending} onUpdateStatus={updateStatus} showActions />
        <PipelineSection title="Confirmed" bookings={confirmed} onUpdateStatus={updateStatus} />
        <PipelineSection title="Completed" bookings={completed} onUpdateStatus={updateStatus} />
        {cancelled.length > 0 && (
          <PipelineSection title="Cancelled" bookings={cancelled} onUpdateStatus={updateStatus} muted />
        )}
      </div>
    </div>
  );
}

/* ---------- sub-components ---------- */

function StatPill({ label, count, className }: { label: string; count: number; className: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-lg font-display font-bold ${className}`}>{count}</span>
      </CardContent>
    </Card>
  );
}

function PipelineSection({
  title,
  bookings,
  onUpdateStatus,
  showActions,
  muted,
}: {
  title: string;
  bookings: Booking[];
  onUpdateStatus: any;
  showActions?: boolean;
  muted?: boolean;
}) {
  if (bookings.length === 0) return null;

  const cfg = STATUS_CONFIG[title.toLowerCase()] ?? STATUS_CONFIG.pending;

  return (
    <div className={muted ? 'opacity-60' : ''}>
      <div className="flex items-center gap-2 mb-3">
        <Badge className={cfg.className}>{title}</Badge>
        <span className="text-xs text-muted-foreground">{bookings.length} session{bookings.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-2">
        {bookings.map((b) => (
          <BookingCard key={b.id} booking={b} onUpdateStatus={onUpdateStatus} showActions={showActions} />
        ))}
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onUpdateStatus,
  showActions,
}: {
  booking: Booking;
  onUpdateStatus: any;
  showActions?: boolean;
}) {
  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const isPending = booking.status === 'pending';

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm font-semibold text-white truncate">{booking.client_name}</span>
              <Badge className={`${cfg.className} text-[10px] shrink-0`}>{cfg.label}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {booking.client_email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(parseISO(booking.scheduled_date), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {booking.scheduled_time?.slice(0, 5)} ({booking.duration_minutes} min)
              </span>
              {booking.amount_cents != null && booking.amount_cents > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ${(booking.amount_cents / 100).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {(showActions || isPending) && isPending && (
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:text-white h-8 gap-1"
                onClick={() => onUpdateStatus.mutate({ id: booking.id, status: 'cancelled' })}
                disabled={onUpdateStatus.isPending}
              >
                <XCircle className="h-3.5 w-3.5" />
                Decline
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1"
                onClick={() => onUpdateStatus.mutate({ id: booking.id, status: 'confirmed' })}
                disabled={onUpdateStatus.isPending}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Confirm
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
