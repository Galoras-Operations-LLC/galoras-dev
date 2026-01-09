import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  type: "new_booking" | "booking_confirmed" | "booking_cancelled";
  coachId: string;
  coachName: string;
  coachEmail?: string;
  clientEmail: string;
  clientName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  notes?: string;
}

const generateEmailStyles = () => `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px; }
    .session-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f97316; }
    .session-detail { display: flex; margin: 8px 0; }
    .session-label { color: #666; width: 100px; font-size: 14px; }
    .session-value { color: #1a1a2e; font-weight: 500; }
    .cta-button { display: inline-block; background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 8px 4px; }
    .cta-button.secondary { background: #e5e7eb; color: #1a1a2e; }
    .footer { background: #f8f9fa; padding: 24px; text-align: center; color: #666; font-size: 12px; }
    .calendar-links { margin-top: 20px; }
  </style>
`;

const generateClientNewBookingEmail = (data: BookingNotificationRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${generateEmailStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Session Request Submitted!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.clientName},</p>
      <p>Your coaching session request with <strong>${data.coachName}</strong> has been submitted and is awaiting confirmation.</p>
      
      <div class="session-card">
        <div class="session-detail">
          <span class="session-label">📅 Date:</span>
          <span class="session-value">${data.scheduledDate}</span>
        </div>
        <div class="session-detail">
          <span class="session-label">🕐 Time:</span>
          <span class="session-value">${data.scheduledTime}</span>
        </div>
        <div class="session-detail">
          <span class="session-label">⏱ Duration:</span>
          <span class="session-value">${data.duration} minutes</span>
        </div>
        <div class="session-detail">
          <span class="session-label">👤 Coach:</span>
          <span class="session-value">${data.coachName}</span>
        </div>
        ${data.notes ? `
        <div class="session-detail">
          <span class="session-label">📝 Notes:</span>
          <span class="session-value">${data.notes}</span>
        </div>
        ` : ''}
      </div>

      <p>You'll receive another email once your coach confirms the session.</p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://galoras.com/dashboard" class="cta-button">View My Bookings</a>
      </div>
    </div>
    <div class="footer">
      <p>Galoras Coaching Platform</p>
      <p>Transforming potential into performance</p>
    </div>
  </div>
</body>
</html>
`;

const generateCoachNewBookingEmail = (data: BookingNotificationRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${generateEmailStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Session Request!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.coachName},</p>
      <p>You have a new coaching session request from <strong>${data.clientName}</strong>.</p>
      
      <div class="session-card">
        <div class="session-detail">
          <span class="session-label">📅 Date:</span>
          <span class="session-value">${data.scheduledDate}</span>
        </div>
        <div class="session-detail">
          <span class="session-label">🕐 Time:</span>
          <span class="session-value">${data.scheduledTime}</span>
        </div>
        <div class="session-detail">
          <span class="session-label">⏱ Duration:</span>
          <span class="session-value">${data.duration} minutes</span>
        </div>
        <div class="session-detail">
          <span class="session-label">👤 Client:</span>
          <span class="session-value">${data.clientName}</span>
        </div>
        <div class="session-detail">
          <span class="session-label">📧 Email:</span>
          <span class="session-value">${data.clientEmail}</span>
        </div>
        ${data.notes ? `
        <div class="session-detail">
          <span class="session-label">📝 Goals:</span>
          <span class="session-value">${data.notes}</span>
        </div>
        ` : ''}
      </div>

      <p>Please review and confirm or decline this request in your dashboard.</p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://galoras.com/coach-dashboard" class="cta-button">Manage Bookings</a>
      </div>
    </div>
    <div class="footer">
      <p>Galoras Coaching Platform</p>
      <p>Transforming potential into performance</p>
    </div>
  </div>
</body>
</html>
`;

const generateConfirmedEmail = (data: BookingNotificationRequest) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${generateEmailStyles()}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Session Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.clientName},</p>
      <p>Great news! <strong>${data.coachName}</strong> has confirmed your coaching session.</p>
      
      <div class="session-card">
        <div class="session-detail">
          <span class="session-label">📅 Date:</span>
          <span class="session-value">${data.scheduledDate}</span>
        </div>
        <div class="session-detail">
          <span class="session-label">🕐 Time:</span>
          <span class="session-value">${data.scheduledTime}</span>
        </div>
        <div class="session-detail">
          <span class="session-label">⏱ Duration:</span>
          <span class="session-value">${data.duration} minutes</span>
        </div>
        <div class="session-detail">
          <span class="session-label">👤 Coach:</span>
          <span class="session-value">${data.coachName}</span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://galoras.com/dashboard" class="cta-button">View My Bookings</a>
      </div>
    </div>
    <div class="footer">
      <p>Galoras Coaching Platform</p>
      <p>Transforming potential into performance</p>
    </div>
  </div>
</body>
</html>
`;

const generateCancelledEmail = (data: BookingNotificationRequest, isForCoach: boolean) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${generateEmailStyles()}
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
      <h1>❌ Session Cancelled</h1>
    </div>
    <div class="content">
      <p>Hi ${isForCoach ? data.coachName : data.clientName},</p>
      <p>The following coaching session has been cancelled:</p>
      
      <div class="session-card" style="border-left-color: #dc2626;">
        <div class="session-detail">
          <span class="session-label">📅 Date:</span>
          <span class="session-value">${data.scheduledDate}</span>
        </div>
        <div class="session-detail">
          <span class="session-label">🕐 Time:</span>
          <span class="session-value">${data.scheduledTime}</span>
        </div>
        <div class="session-detail">
          <span class="session-label">👤 ${isForCoach ? 'Client' : 'Coach'}:</span>
          <span class="session-value">${isForCoach ? data.clientName : data.coachName}</span>
        </div>
      </div>

      <p>If you have any questions, please reach out to us.</p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://galoras.com/${isForCoach ? 'coach-dashboard' : 'dashboard'}" class="cta-button">View Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>Galoras Coaching Platform</p>
      <p>Transforming potential into performance</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BookingNotificationRequest = await req.json();
    console.log("Sending booking notification:", data.type, "for client:", data.clientEmail);

    const emailPromises: Promise<any>[] = [];

    if (data.type === "new_booking") {
      // Send to client
      emailPromises.push(
        resend.emails.send({
          from: "Galoras <onboarding@resend.dev>",
          to: [data.clientEmail],
          subject: `Session Request Submitted - ${data.scheduledDate}`,
          html: generateClientNewBookingEmail(data),
        })
      );

      // Send to coach if we have their email
      if (data.coachEmail) {
        emailPromises.push(
          resend.emails.send({
            from: "Galoras <onboarding@resend.dev>",
            to: [data.coachEmail],
            subject: `New Session Request from ${data.clientName}`,
            html: generateCoachNewBookingEmail(data),
          })
        );
      }
    } else if (data.type === "booking_confirmed") {
      emailPromises.push(
        resend.emails.send({
          from: "Galoras <onboarding@resend.dev>",
          to: [data.clientEmail],
          subject: `Session Confirmed - ${data.scheduledDate} with ${data.coachName}`,
          html: generateConfirmedEmail(data),
        })
      );
    } else if (data.type === "booking_cancelled") {
      // Notify client
      emailPromises.push(
        resend.emails.send({
          from: "Galoras <onboarding@resend.dev>",
          to: [data.clientEmail],
          subject: `Session Cancelled - ${data.scheduledDate}`,
          html: generateCancelledEmail(data, false),
        })
      );

      // Notify coach if we have their email
      if (data.coachEmail) {
        emailPromises.push(
          resend.emails.send({
            from: "Galoras <onboarding@resend.dev>",
            to: [data.coachEmail],
            subject: `Session Cancelled - ${data.clientName}`,
            html: generateCancelledEmail(data, true),
          })
        );
      }
    }

    const results = await Promise.all(emailPromises);
    console.log("Email(s) sent successfully:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
