import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface CoachApplication {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  status: string;
  bio: string | null;
  experience_years: number | null;
  certifications: string | null;
  specialties: string[] | null;
  why_galoras: string | null;
  phone: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  onboarding_status: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
}

interface Props {
  application: CoachApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationDetailDialog({ application, open, onOpenChange }: Props) {
  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application — {application.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {application.avatar_url && (
            <img src={application.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
          )}
          <Field label="Email" value={application.email} />
          <Field label="Phone" value={application.phone} />
          <Field label="Bio" value={application.bio} />
          <Field label="Experience" value={application.experience_years ? `${application.experience_years} years` : null} />
          <Field label="Certifications" value={application.certifications} />
          {application.specialties && application.specialties.length > 0 && (
            <div>
              <span className="font-medium text-muted-foreground">Specialties</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {application.specialties.map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          )}
          <Field label="Why Galoras" value={application.why_galoras} />
          <Field label="Website" value={application.website_url} link />
          <Field label="LinkedIn" value={application.linkedin_url} link />
          <Field label="Submitted" value={format(new Date(application.created_at), "MMM d, yyyy 'at' h:mm a")} />
          {application.reviewed_at && (
            <Field label="Reviewed" value={format(new Date(application.reviewed_at), "MMM d, yyyy 'at' h:mm a")} />
          )}
          {application.reviewer_notes && (
            <Field label="Reviewer Notes" value={application.reviewer_notes} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, link }: { label: string; value: string | null | undefined; link?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <span className="font-medium text-muted-foreground">{label}</span>
      <p className="mt-0.5">
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            {value}
          </a>
        ) : (
          value
        )}
      </p>
    </div>
  );
}
