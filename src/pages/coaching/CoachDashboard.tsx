import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, isToday, isPast } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Mail,
  FileText,
  Package,
} from 'lucide-react';
import { CoachProductsTab } from '@/components/coaching/CoachProductsTab';
import { useNavigate } from 'react-router-dom';
import { PortalSidebar } from '@/components/coaching/portal/PortalSidebar';
import { PortalTopBar } from '@/components/coaching/portal/PortalTopBar';
import { OverviewTab } from '@/components/coaching/portal/OverviewTab';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function CoachDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // --- Data fetching (preserved from original) ---

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: coachProfile, isLoading: coachLoading } = useQuery({
    queryKey: ['my-coach-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['coach-session-bookings', coachProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_bookings')
        .select('*')
        .eq('coach_id', coachProfile!.id)
        .order('scheduled_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!coachProfile,
  });

  const { data: availability } = useQuery({
    queryKey: ['my-availability', coachProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_availability')
        .select('*')
        .eq('coach_id', coachProfile!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!coachProfile,
  });

  // --- Mutations (preserved from original) ---

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, booking }: { id: string; status: string; booking?: typeof bookings extends (infer T)[] | undefined ? T : never }) => {
      const { error } = await supabase
        .from('session_bookings')
        .update({ status })
        .eq('id', id)
        .eq('coach_id', coachProfile!.id);
      if (error) throw error;

      if (booking && (status === 'confirmed' || status === 'cancelled')) {
        try {
          await supabase.functions.invoke('send-booking-notification', {
            body: {
              type: status === 'confirmed' ? 'booking_confirmed' : 'booking_cancelled',
              coachId: coachProfile?.id,
              coachName: coachProfile?.display_name || 'Your Coach',
              coachEmail: user?.email,
              clientEmail: booking.client_email,
              clientName: booking.client_name,
              scheduledDate: format(parseISO(booking.scheduled_date), 'MMMM d, yyyy'),
              scheduledTime: booking.scheduled_time,
              duration: booking.duration_minutes,
              notes: booking.notes,
            },
          });
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
        }
      }
    },
    onSuccess: (_, { status }) => {
      const message = status === 'confirmed'
        ? 'Session confirmed and client notified.'
        : status === 'cancelled'
        ? 'Session declined and client notified.'
        : 'Booking status has been updated.';
      toast({ title: 'Status Updated', description: message });
      queryClient.invalidateQueries({ queryKey: ['coach-session-bookings'] });
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ dayOfWeek, isAvailable }: { dayOfWeek: number; isAvailable: boolean }) => {
      const existing = availability?.find(a => a.day_of_week === dayOfWeek);
      if (existing) {
        const { error } = await supabase
          .from('coach_availability')
          .update({ is_available: isAvailable })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('coach_availability')
          .insert({
            coach_id: coachProfile!.id,
            day_of_week: dayOfWeek,
            start_time: '09:00',
            end_time: '17:00',
            is_available: isAvailable,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-availability'] });
      toast({ title: 'Availability Updated' });
    },
  });

  // --- Sidebar navigation handler ---

  function handleNavigate(tab: string) {
    if (tab === 'profile') {
      navigate('/coach-dashboard/edit');
      return;
    }
    if (tab === 'visibility') { setActiveTab('overview'); return; }
    if (tab === 'engagement') { setActiveTab('bookings'); return; }
    if (tab === 'labs' || tab === 'messages' || tab === 'settings') {
      toast({ title: 'Coming Soon', description: `${tab.charAt(0).toUpperCase() + tab.slice(1)} is under development.` });
      return;
    }
    setActiveTab(tab);
  }

  // --- Early returns for auth / loading / no profile ---

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-white mb-4">Please Sign In</h1>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (coachLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-60 bg-card border-r border-border p-6">
          <Skeleton className="h-6 w-28 mb-8" />
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-9 w-full mb-2" />)}
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!coachProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-white mb-4">Coach Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">You need to be an approved coach to access this dashboard.</p>
          <Button onClick={() => navigate('/apply')}>Apply as Coach</Button>
        </div>
      </div>
    );
  }

  // --- Derived data ---

  const todayBookings = bookings?.filter(b => isToday(parseISO(b.scheduled_date)) && b.status !== 'cancelled') || [];
  const upcomingBookings = bookings?.filter(b => !isPast(parseISO(b.scheduled_date)) && b.status !== 'cancelled') || [];
  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed') || [];

  const fitScore = coachProfile.readiness_score ?? 89;

  // --- Render ---

  return (
    <div className="min-h-screen bg-background flex">
      <PortalSidebar activeTab={activeTab} onNavigate={handleNavigate} />

      <div className="flex-1 flex flex-col min-w-0">
        <PortalTopBar
          displayName={coachProfile.display_name || 'Coach'}
          tier={coachProfile.tier}
          fitScore={fitScore}
          avatarUrl={coachProfile.avatar_url}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Overview tab */}
          {activeTab === 'overview' && (
            <OverviewTab
              coachProfile={coachProfile}
              pendingCount={pendingBookings.length}
              confirmedCount={confirmedBookings.length}
            />
          )}

          {/* Bookings tab */}
          {activeTab === 'bookings' && (
            <BookingsContent
              todayBookings={todayBookings}
              pendingBookings={pendingBookings}
              upcomingBookings={upcomingBookings}
              bookingsLoading={bookingsLoading}
              updateStatus={updateStatus}
            />
          )}

          {/* Availability tab */}
          {activeTab === 'availability' && (
            <AvailabilityContent
              availability={availability}
              toggleAvailability={toggleAvailability}
            />
          )}

          {/* Products tab */}
          {activeTab === 'products' && (
            <CoachProductsTab coachProfile={coachProfile} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ================================================================
   Bookings Content (extracted inline to keep main component lean)
   ================================================================ */

function BookingsContent({
  todayBookings,
  pendingBookings,
  upcomingBookings,
  bookingsLoading,
  updateStatus,
}: {
  todayBookings: any[];
  pendingBookings: any[];
  upcomingBookings: any[];
  bookingsLoading: boolean;
  updateStatus: any;
}) {
  return (
    <div className="space-y-8">
      {/* Sub-tabs for engagement */}
      <div className="flex items-center gap-2 mb-2">
        <SubTab href="bookings" label="Bookings" active />
        <SubTab href="availability" label="Availability" />
        <SubTab href="products" label="Products & Programs" icon={<Package className="h-3.5 w-3.5" />} />
      </div>

      {/* Today's Sessions */}
      {todayBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-display font-semibold text-white mb-4">Today's Sessions</h2>
          <div className="space-y-3">
            {todayBookings.map((booking) => (
              <Card key={booking.id} className="bg-card border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{booking.client_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.scheduled_time.slice(0, 5)} &middot; {booking.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20">{booking.status}</Badge>
                      {booking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus.mutate({ id: booking.id, status: 'completed' })}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="mt-4 p-3 bg-background rounded-lg text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 inline mr-2" />
                      {booking.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Requests */}
      {pendingBookings.length > 0 && (
        <div>
          <h2 className="text-lg font-display font-semibold text-white mb-4">Pending Requests</h2>
          <div className="space-y-3">
            {pendingBookings.map((booking) => (
              <Card key={booking.id} className="bg-card border-border">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{booking.client_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(booking.scheduled_date), 'MMM d, yyyy')} at {booking.scheduled_time.slice(0, 5)}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" /> {booking.client_email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-muted-foreground hover:text-white"
                        onClick={() => updateStatus.mutate({ id: booking.id, status: 'cancelled', booking })}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: booking.id, status: 'confirmed', booking })}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Upcoming */}
      <div>
        <h2 className="text-lg font-display font-semibold text-white mb-4">All Upcoming Sessions</h2>
        {bookingsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[50px]">
                        <p className="text-lg font-bold text-white">
                          {format(parseISO(booking.scheduled_date), 'd')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(booking.scheduled_date), 'MMM')}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-white">{booking.client_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.scheduled_time.slice(0, 5)} &middot; {booking.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        booking.status === 'confirmed'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-muted/20 text-muted-foreground border-border'
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No upcoming sessions</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Availability Content
   ================================================================ */

function AvailabilityContent({
  availability,
  toggleAvailability,
}: {
  availability: any[] | undefined;
  toggleAvailability: any;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <SubTab href="bookings" label="Bookings" />
        <SubTab href="availability" label="Availability" active />
        <SubTab href="products" label="Products & Programs" icon={<Package className="h-3.5 w-3.5" />} />
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white font-display">Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayAvail = availability?.find(a => a.day_of_week === day.value);
              const isAvailable = dayAvail?.is_available ?? false;

              return (
                <div key={day.value} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-white">{day.label}</p>
                    {isAvailable && dayAvail && (
                      <p className="text-sm text-muted-foreground">
                        {dayAvail.start_time.slice(0, 5)} - {dayAvail.end_time.slice(0, 5)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`day-${day.value}`} className="text-sm text-muted-foreground">
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </Label>
                    <Switch
                      id={`day-${day.value}`}
                      checked={isAvailable}
                      onCheckedChange={(checked) =>
                        toggleAvailability.mutate({ dayOfWeek: day.value, isAvailable: checked })
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ================================================================
   Sub-tab pill (for engagement section navigation)
   ================================================================ */

function SubTab({ href, label, active, icon }: { href: string; label: string; active?: boolean; icon?: React.ReactNode }) {
  // These are display-only; parent handles actual tab switching via sidebar
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-default ${
        active
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-muted-foreground bg-card border border-border'
      }`}
    >
      {icon}
      {label}
    </span>
  );
}
