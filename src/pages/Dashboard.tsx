import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AddToCalendarDropdown } from '@/components/coaching/AddToCalendarDropdown';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  FileText,
  XCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  coach_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  coaches: {
    display_name: string | null;
    avatar_url: string | null;
    headline: string | null;
  } | null;
}

const statusConfig: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: AlertCircle },
  confirmed: { label: 'Confirmed', variant: 'default', icon: CheckCircle },
  completed: { label: 'Completed', variant: 'outline', icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: XCircle },
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check auth
  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_bookings')
        .select(`
          *,
          coaches (
            display_name,
            avatar_url,
            headline
          )
        `)
        .eq('client_id', user!.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });

  // Cancel booking mutation
  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('session_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Booking Cancelled',
        description: 'Your session has been cancelled successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view your bookings.
          </p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  const upcomingBookings = bookings?.filter(b => {
    const bookingDate = parseISO(b.scheduled_date);
    return !isPast(bookingDate) || isToday(bookingDate);
  }).filter(b => b.status !== 'cancelled' && b.status !== 'completed') || [];

  const pastBookings = bookings?.filter(b => {
    const bookingDate = parseISO(b.scheduled_date);
    return isPast(bookingDate) && !isToday(bookingDate);
  }) || [];

  const cancelledBookings = bookings?.filter(b => b.status === 'cancelled') || [];

  const renderBookingCard = (booking: Booking) => {
    const status = statusConfig[booking.status];
    const StatusIcon = status.icon;
    const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
    const bookingDate = parseISO(booking.scheduled_date);
    const isUpcoming = !isPast(bookingDate) || isToday(bookingDate);

    return (
      <Card key={booking.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {booking.coaches?.display_name || 'Coach'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.coaches?.headline || 'Coaching Session'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(bookingDate, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.scheduled_time.slice(0, 5)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.duration_minutes} min</span>
                </div>
                <Badge variant={status.variant} className="w-fit">
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>

              {booking.notes && (
                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mt-0.5" />
                  <span className="line-clamp-2">{booking.notes}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              {isUpcoming && booking.status !== 'cancelled' && (
                <AddToCalendarDropdown
                  booking={{
                    scheduled_date: booking.scheduled_date,
                    scheduled_time: booking.scheduled_time,
                    duration_minutes: booking.duration_minutes,
                    coach_name: booking.coaches?.display_name || 'Coach',
                    notes: booking.notes || undefined,
                  }}
                />
              )}
              {canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cancelBooking.mutate(booking.id)}
                  disabled={cancelBooking.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your coaching sessions and view your history
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map(renderBookingCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Upcoming Sessions</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any upcoming coaching sessions scheduled.
                  </p>
                  <Button onClick={() => navigate('/coaching')}>
                    Find a Coach
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastBookings.length > 0 ? (
              <div className="space-y-4">
                {pastBookings.map(renderBookingCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Past Sessions</h3>
                  <p className="text-muted-foreground">
                    Your completed sessions will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled">
            {cancelledBookings.length > 0 ? (
              <div className="space-y-4">
                {cancelledBookings.map(renderBookingCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Cancelled Sessions</h3>
                  <p className="text-muted-foreground">
                    Your cancelled sessions will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
