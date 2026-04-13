import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL_FROM = "Galoras <onboarding@resend.dev>";
const PLATFORM_URL = "https://uat-galoras.site";

const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ── Email Template: Requester Confirmation ───────────────────────────────────

function requesterConfirmationEmail(data: any): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,sans-serif;margin:0;padding:0;background:#f5f5f5}
.container{max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1)}
.header{background:linear-gradient(135deg,#0369a1,#0284c7);color:white;padding:24px 32px}
.header h1{margin:0;font-size:24px}
.header p{margin:4px 0 0 0;font-size:14px;opacity:0.9}
.content{padding:24px 32px}
.card{background:#f0f9ff;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #0369a1}
.row{margin:8px 0;font-size:14px}
.label{color:#666;display:inline-block;width:120px;font-weight:500}
.value{color:#1a1a2e}
.section{margin:16px 0}
.section-title{font-weight:600;color:#1a1a2e;margin:16px 0 8px 0}
.footer{background:#f8f9fa;padding:16px 32px;text-align:center;color:#999;font-size:12px}
</style></head><body><div class="container">
<div class="header">
<h1>✓ Request Received</h1>
<p>We've got your coaching request!</p>
</div>
<div class="content">
<p style="font-size:15px;color:#333">Hi ${escapeHtml(data.name || "")},</p>
<p style="font-size:15px;color:#666;line-height:1.6">Thank you for reaching out to Galoras. We've received your coaching request for <strong>${escapeHtml(data.coachName || "")}</strong> and will review it shortly.</p>

<div class="card">
<div class="section-title">Request Summary</div>
<div class="row"><span class="label">Coach:</span><span class="value">${escapeHtml(data.coachName || "")}</span></div>
${data.productTitle ? `<div class="row"><span class="label">Product:</span><span class="value">${escapeHtml(data.productTitle)}</span></div>` : ""}
${data.urgency ? `<div class="row"><span class="label">Timeline:</span><span class="value">${escapeHtml(data.urgency === "low" ? "No rush — exploring options" : data.urgency === "medium" ? "Within a few weeks" : data.urgency === "high" ? "This week" : "Urgent — ASAP")}</span></div>` : ""}
</div>

<div class="section">
<p style="font-size:15px;color:#666;line-height:1.6"><strong>What happens next?</strong></p>
<ul style="color:#666;font-size:14px;line-height:1.8">
<li>${escapeHtml(data.coachName || "Coach")} will review your request</li>
<li>You'll receive an email with next steps (typically within 24 hours)</li>
<li>If you have any questions, just reply to this email</li>
</ul>
</div>

<div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #22c55e">
<p style="color:#166534;font-size:14px;margin:0"><strong>💡 Tip:</strong> Add this email address to your contacts to ensure you don't miss our response.</p>
</div>

<p style="font-size:14px;color:#999;margin-top:24px;border-top:1px solid #eee;padding-top:16px">This email was sent because a coaching request was submitted from this email address. If you didn't submit this request, please let us know.</p>
</div>
<div class="footer">© Galoras Coaching Exchange</div>
</div></body></html>`;
}

// ── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const data = await req.json();
    const requesterEmail = data.requesterEmail as string;

    if (!requesterEmail) {
      return new Response(JSON.stringify({ error: "requesterEmail required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const subject = `Coaching Request Confirmation — ${data.coachName || ""}`;
    const html = requesterConfirmationEmail(data);

    const result = await resend.emails.send({
      from: Deno.env.get("EMAIL_FROM") ?? EMAIL_FROM,
      to: requesterEmail,
      subject,
      html,
    });

    console.log(`Request confirmation sent to ${requesterEmail}`, result);

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("send-request-confirmation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
