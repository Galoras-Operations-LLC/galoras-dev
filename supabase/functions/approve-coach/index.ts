import Stripe from "https://esm.sh/stripe@14";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_PRICES: Record<string, number> = {
  pro:    4900,   // $49.00
  elite:  9900,   // $99.00
  master: 19700,  // $197.00
};

const TIER_LABELS: Record<string, string> = {
  pro:    "Pro",
  elite:  "Elite",
  master: "Master",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const { data: { user: admin }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !admin) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify admin role
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", admin.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { applicationId, coachUserId, decisionReason } = await req.json();
    if (!applicationId || !coachUserId) {
      return new Response(JSON.stringify({ error: "Missing applicationId or coachUserId" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get coach registration (payment info)
    const { data: reg, error: regError } = await supabase
      .from("coach_registrations")
      .select("*")
      .eq("user_id", coachUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (regError || !reg) {
      return new Response(JSON.stringify({ error: "No registration found for this coach" }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const tier = reg.selected_tier ?? "pro";
    const amountCents = TIER_PRICES[tier] ?? 4900;

    let chargeResult = null;

    // Only charge if payment method is saved
    if (reg.stripe_customer_id && reg.stripe_payment_method_id) {
      // Attach payment method to customer (in case it's not already)
      try {
        await stripe.paymentMethods.attach(reg.stripe_payment_method_id, {
          customer: reg.stripe_customer_id,
        });
      } catch (_) { /* already attached */ }

      // Set as default
      await stripe.customers.update(reg.stripe_customer_id, {
        invoice_settings: { default_payment_method: reg.stripe_payment_method_id },
      });

      // Create subscription (monthly recurring)
      const subscription = await stripe.subscriptions.create({
        customer: reg.stripe_customer_id,
        default_payment_method: reg.stripe_payment_method_id,
        items: [{
          price_data: {
            currency: "usd",
            product_data: { name: `Galoras ${TIER_LABELS[tier]} Coach Subscription` },
            unit_amount: amountCents,
            recurring: { interval: "month" },
          },
        }],
        metadata: { userId: coachUserId, tier, applicationId },
      });

      chargeResult = { subscriptionId: subscription.id, status: subscription.status };

      // Update registration
      await supabase
        .from("coach_registrations")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", coachUserId);
    }

    // Update or create coach record
    const { data: existingCoach } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", coachUserId)
      .maybeSingle();

    if (existingCoach) {
      await supabase
        .from("coaches")
        .update({ lifecycle_status: "published", tier, status: "approved" })
        .eq("id", existingCoach.id);
    } else {
      await supabase.from("coaches").insert({
        user_id: coachUserId,
        display_name: reg.full_name,
        email: reg.email,
        bio: reg.bio,
        linkedin_url: reg.linkedin_url,
        tier,
        status: "approved",
        lifecycle_status: "published",
      });
    }

    // Update application
    await supabase
      .from("coach_applications")
      .update({
        review_status: "approved",
        status: "approved",
        decision_reason: decisionReason ?? null,
        decided_by: admin.id,
        decided_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    // Send approval email
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY && reg.email) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Galoras <onboarding@resend.dev>",
          to: [reg.email],
          subject: "You're approved — Welcome to the Galoras Coach Ecosystem",
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
              <h2>Welcome to Galoras, ${reg.full_name ?? "Coach"}!</h2>
              <p>Your application has been <strong>approved</strong>. You're now an active ${TIER_LABELS[tier]} coach on the Galoras platform.</p>
              <p>Your subscription of <strong>$${amountCents / 100}/month</strong> has been activated.</p>
              <p style="margin:24px 0">
                <a href="https://uat-galoras.site/coaching"
                   style="background:#38bdf8;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
                  View Your Profile →
                </a>
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="color:#999;font-size:12px">© Galoras · uat-galoras.site</p>
            </div>
          `,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, chargeResult }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("approve-coach error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
