import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { coachId, senderName, senderEmail, message } = await req.json();

    if (!coachId || !senderEmail || !message) {
      return new Response(
        JSON.stringify({ error: "coachId, senderEmail, and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Insert message using service role (bypasses RLS)
    const subject = `Inquiry from ${senderName || senderEmail}`;
    const { error: insertError } = await supabase.from("messages").insert({
      coach_id: coachId,
      sender_email: senderEmail,
      subject,
      content: message,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save message" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Look up coach email
    const { data: coach } = await supabase
      .from("coaches")
      .select("display_name, email")
      .eq("id", coachId)
      .single();

    if (coach?.email) {
      const safeName = escapeHtml(senderName || "Someone");
      const safeEmail = escapeHtml(senderEmail);
      const safeContent = escapeHtml(message);
      const safeCoachName = escapeHtml(coach.display_name || "Coach");

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .content { padding: 32px; }
    .message-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f97316; }
    .label { color: #666; font-size: 13px; margin-bottom: 4px; }
    .value { color: #1a1a2e; font-weight: 500; margin-bottom: 16px; }
    .message-body { color: #333; line-height: 1.6; white-space: pre-wrap; }
    .cta-button { display: inline-block; background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .footer { background: #f8f9fa; padding: 24px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Inquiry on Galoras</h1>
    </div>
    <div class="content">
      <p>Hi ${safeCoachName},</p>
      <p>You've received a new inquiry through your Galoras profile.</p>
      <div class="message-card">
        <div class="label">From</div>
        <div class="value">${safeName} (${safeEmail})</div>
        <div class="label">Message</div>
        <div class="message-body">${safeContent}</div>
      </div>
      <p>Reply directly to <strong>${safeEmail}</strong> to respond.</p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://uat-galoras.site/coach-dashboard" class="cta-button">View Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>Galoras Coaching Platform</p>
    </div>
  </div>
</body>
</html>`;

      await resend.emails.send({
        from: Deno.env.get("EMAIL_FROM") ?? "Galoras <notifications@galoras.com>",
        to: [coach.email],
        reply_to: senderEmail,
        subject: `New inquiry from ${safeName}`,
        html,
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: any) {
    console.error("Error in send-contact-message:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
