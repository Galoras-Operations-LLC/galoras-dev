import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarIcon, Clock, DollarSign } from 'lucide-react';

interface BookSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: {
    id: string;
    display_name: string;
    hourly_rate: number | null;
    user_id: string;
  };
}

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '60 minutes' },
  { value: 90, label: '90 minutes' },
];

export function BookSessionModal({ isOpen, onClose, coach }: BookSessionModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch coach availability
  const { data: availability } = useQuery({
    queryKey: ['coach-availability', coach.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coach_availability')
        .select('*')
        .eq('coach_id', coach.id)
        .eq('is_available', true);

      if (error) throw error;
      return data;
    },
  });

  // Fetch existing bookings for the coach
  const { data: existingBookings } = useQuery({
    queryKey: ['coach-bookings', coach.id, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      const { data, error } = await supabase
        .from('session_bookings')
        .select('scheduled_time, duration_minutes')
        .eq('coach_id', coach.id)
        .eq('scheduled_date', format(selectedDate, 'yyyy-MM-dd'))
        .neq('status', 'cancelled');

      if (error) throw error;
      return data;
    },
    enabled: !!selectedDate,
  });

  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to book a session');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase.from('session_bookings').insert({
        coach_id: coach.id,
        client_id: user.id,
        client_email: profile?.email || user.email || '',
        client_name: profile?.full_name || 'Client',
        scheduled_date: format(selectedDate!, 'yyyy-MM-dd'),
        scheduled_time: selectedTime,
        duration_minutes: duration,
        notes,
        status: 'pending',
      });

      if (error) throw error;

      // Trigger email notification
      try {
        await supabase.functions.invoke('send-booking-notification', {
          body: {
            type: 'new_booking',
            coachId: coach.id,
            coachName: coach.display_name,
            clientEmail: profile?.email || user.email,
            clientName: profile?.full_name || 'Client',
            scheduledDate: format(selectedDate!, 'MMMM d, yyyy'),
            scheduledTime: selectedTime,
            duration,
            notes,
          },
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Session Booked!',
        description: `Your session with ${coach.display_name} has been requested. You'll receive a confirmation email shortly.`,
      });
      queryClient.invalidateQueries({ queryKey: ['session-bookings'] });
      onClose();
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Booking Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
    setDuration(60);
    setNotes('');
  };

  // Get available days based on coach availability
  const getAvailableDayNumbers = (): number[] => {
    return availability?.map(a => a.day_of_week) || [];
  };

  // Check if a date is available
  const isDateAvailable = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    const availableDays = getAvailableDayNumbers();
    return availableDays.includes(dayOfWeek) && !isBefore(date, startOfDay(new Date()));
  };

  // Generate time slots for selected date
  const getTimeSlots = (): string[] => {
    if (!selectedDate || !availability) return [];

    const dayOfWeek = selectedDate.getDay();
    const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek);
    if (!dayAvailability) return [];

    const slots: string[] = [];
    const [startHour, startMin] = dayAvailability.start_time.split(':').map(Number);
    const [endHour, endMin] = dayAvailability.end_time.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      
      // Check if slot is already booked
      const isBooked = existingBookings?.some(booking => {
        const bookingStart = booking.scheduled_time;
        return bookingStart === timeString + ':00';
      });

      if (!isBooked) {
        slots.push(timeString);
      }

      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }

    return slots;
  };

  const totalCost = coach.hourly_rate ? (coach.hourly_rate * duration) / 60 : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Session with {coach.display_name}</DialogTitle>
          <DialogDescription>
            Select a date and time for your coaching session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Select Date
            </Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedTime('');
              }}
              disabled={(date) => !isDateAvailable(date)}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Select Time
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {getTimeSlots().map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Duration Selection */}
          <div className="space-y-2">
            <Label>Session Duration</Label>
            <Select 
              value={duration.toString()} 
              onValueChange={(v) => setDuration(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Session Goals / Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What would you like to focus on in this session?"
              rows={3}
            />
          </div>

          {/* Cost Summary */}
          {totalCost !== null && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Session Cost
                </span>
                <span className="text-lg font-semibold">${totalCost}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {duration} minutes at ${coach.hourly_rate}/hour
              </p>
            </div>
          )}

          {/* Book Button */}
          <Button
            onClick={() => createBooking.mutate()}
            disabled={!selectedDate || !selectedTime || createBooking.isPending}
            className="w-full"
          >
            {createBooking.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
