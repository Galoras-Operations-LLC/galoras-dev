import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  TrendingUp,
  Users,
  ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [activeTab, setActiveTab] = useState('bookings');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch coach profile
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

  // Fetch bookings for coach
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

  // Fetch availability
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

  // Update booking status with email notification
  const updateStatus = useMutation({
    mutationFn: async ({ id, status, booking }: { id: string; status: string; booking?: typeof bookings extends (infer T)[] | undefined ? T : never }) => {
      const { error } = await supabase
        .from('session_bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Send email notification for confirm/cancel actions
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
          // Don't fail the mutation if email fails
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

  // Toggle availability
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

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  if (coachLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!coachProfile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Coach Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            You need to be an approved coach to access this dashboard.
          </p>
          <Button onClick={() => navigate('/apply')}>Apply as Coach</Button>
        </div>
      </Layout>
    );
  }

  const todayBookings = bookings?.filter(b => isToday(parseISO(b.scheduled_date)) && b.status !== 'cancelled') || [];
  const upcomingBookings = bookings?.filter(b => !isPast(parseISO(b.scheduled_date)) && b.status !== 'cancelled') || [];
  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];

  const stats = {
    totalSessions: bookings?.filter(b => b.status === 'completed').length || 0,
    upcomingSessions: upcomingBookings.length,
    pendingRequests: pendingBookings.length,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Coach Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your bookings and availability
            </p>
          </div>
          <Button onClick={() => navigate('/coach-dashboard/edit')} variant="outline">
            <ImageIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">Completed Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.upcomingSessions}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            {/* Today's Sessions */}
            {todayBookings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Today's Sessions</h2>
                <div className="space-y-4">
                  {todayBookings.map((booking) => (
                    <Card key={booking.id} className="border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{booking.client_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {booking.scheduled_time.slice(0, 5)} • {booking.duration_minutes} min
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>{booking.status}</Badge>
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
                          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
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
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{booking.client_name}</p>
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
              <h2 className="text-xl font-semibold mb-4">All Upcoming Sessions</h2>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-center min-w-[50px]">
                              <p className="text-lg font-bold">
                                {format(parseISO(booking.scheduled_date), 'd')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(booking.scheduled_date), 'MMM')}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">{booking.client_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {booking.scheduled_time.slice(0, 5)} • {booking.duration_minutes} min
                              </p>
                            </div>
                          </div>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No upcoming sessions</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const dayAvail = availability?.find(a => a.day_of_week === day.value);
                    const isAvailable = dayAvail?.is_available ?? false;

                    return (
                      <div key={day.value} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">{day.label}</p>
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
