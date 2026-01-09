import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Download } from 'lucide-react';
import {
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  downloadICSFile,
  createCalendarEventFromBooking,
} from '@/lib/calendar-utils';

interface AddToCalendarDropdownProps {
  booking: {
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes: number;
    coach_name: string;
    notes?: string;
  };
}

export function AddToCalendarDropdown({ booking }: AddToCalendarDropdownProps) {
  const event = createCalendarEventFromBooking(booking);

  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(event), '_blank');
  };

  const handleOutlookCalendar = () => {
    window.open(generateOutlookCalendarUrl(event), '_blank');
  };

  const handleDownloadICS = () => {
    downloadICSFile(event);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleGoogleCalendar}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19.5 22H4.5C3.12 22 2 20.88 2 19.5V4.5C2 3.12 3.12 2 4.5 2H19.5C20.88 2 22 3.12 22 4.5V19.5C22 20.88 20.88 22 19.5 22Z"/>
          </svg>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlookCalendar}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 12L12 7L17 12M12 7V21"/>
          </svg>
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadICS}>
          <Download className="h-4 w-4 mr-2" />
          Download .ics File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
