import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL") ?? "noreply@uat-galoras.site";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

interface LifecycleRequest {
  coach_email: string;
  coach_name: string;
  new_status: string;
  old_status: string;
  reviewer_notes?: string;
}

interface EmailContent {
  subject: string;
  body: string;
  showNotes: boolean;
}

function getEmailContent(oldStatus: string, newStatus: string, reviewerNotes?: string): EmailContent | null {
  const transition = `${oldStatus} -> ${newStatus}`;

  switch (transition) {
    case "submitted -> under_review":
      return {
        subject: "Profile Under Review",
        body: "Your Galoras profile is now under review. We'll notify you once the review is complete.",
        showNotes: false,
      };

    case "under_review -> approved":
      return {
        subject: "Profile Approved",
        body: "Your Galoras profile has been approved! You're one step closer to going live on the platform.",
        showNotes: false,
      };

    case "approved -> published":
      return {
        subject: "Profile Live",
        body: "Congratulations! Your profile is now live on the Galoras Coaching Exchange. Clients can find and book you.",
        showNotes: false,
      };

    case "under_review -> revision_required":
      return {
        subject: "Revision Required",
        body: "We've reviewed your profile and have some suggestions. Please log in to your coach dashboard to review the notes.",
        showNotes: true,
      };

    case "published -> approved":
      return {
        subject: "Profile Unpublished",
        body: "Your Galoras profile has been temporarily unpublished. Please contact us if you have questions.",
        showNotes: false,
      };

    default:
      // Handle "any -> rejected"
      if (newStatus === "rejected") {
        return {
          subject: "Application Update",
          body: "We've completed our review of your Galoras application. Unfortunately, we're unable to approve your profile at this time.",
          showNotes: true,
        };
      }
      return null;
  }
}

function buildHtml(coachName: string, subject: string, body: string, reviewerNotes?: string, showNotes?: boolean): string {
  const safeName = escapeHtml(coachName);
  const safeBody = escapeHtml(body);
  const safeSubject = escapeHtml(subject);

  const notesBlock =
    showNotes && reviewerNotes
      ? `<div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;"><strong>Reviewer Notes:</strong><br/>${escapeHtml(reviewerNotes)}</div>`
      : "";

  return `<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Profile Update: ${safeSubject}</h2>
  <p style="color: #444;">Hi ${safeName},</p>
  <p style="color: #444;">${safeBody}</p>
  ${notesBlock}
  <p style="color: #444;">&mdash; The Galoras Team</p>
</div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: LifecycleRequest = await req.json();

    // Validate required fields
    if (!data.coach_email || !data.coach_name || !data.new_status || !data.old_status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: coach_email, coach_name, new_status, old_status" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const content = getEmailContent(data.old_status, data.new_status, data.reviewer_notes);

    if (!content) {
      return new Response(
        JSON.stringify({ error: `Unsupported status transition: ${data.old_status} -> ${data.new_status}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const html = buildHtml(data.coach_name, content.subject, content.body, data.reviewer_notes, content.showNotes);

    const result = await resend.emails.send({
      from: `Galoras <${SENDER_EMAIL}>`,
      to: [data.coach_email],
      subject: `Galoras \u2014 ${content.subject}`,
      html,
    });

    console.log(`Lifecycle notification sent: ${data.old_status} -> ${data.new_status} to ${data.coach_email}`, result);

    return new Response(
      JSON.stringify({ success: true, transition: `${data.old_status} -> ${data.new_status}`, result }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("send-lifecycle-notification error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
