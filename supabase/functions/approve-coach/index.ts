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

    // Write tag mappings and create pending product from application data
    try {
      const { data: appData } = await supabase
        .from("coach_applications")
        .select("specialty_tags, audience_tags, style_tags, industry_tags, availability_tag, enterprise_tags, credential_tags, pending_product")
        .eq("user_id", coachUserId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: coachRow } = await supabase
        .from("coaches")
        .select("id")
        .eq("user_id", coachUserId)
        .single();
      const coachId = coachRow?.id;

      if (coachId && appData) {
        // Collect all tag keys across all families
        const allTagKeys: string[] = [
          ...(appData.specialty_tags || []),
          ...(appData.audience_tags || []),
          ...(appData.style_tags || []),
          ...(appData.industry_tags || []),
          ...(appData.availability_tag ? [appData.availability_tag] : []),
          ...(appData.enterprise_tags || []),
          ...(appData.credential_tags || []),
        ];

        if (allTagKeys.length > 0) {
          // Look up tag IDs
          const { data: tagRows } = await supabase
            .from("tags")
            .select("id, tag_key")
            .in("tag_key", allTagKeys);

          if (tagRows && tagRows.length > 0) {
            const tagMapRows = tagRows.map((t: any) => ({ coach_id: coachId, tag_id: t.id }));
            await supabase
              .from("coach_tag_map")
              .upsert(tagMapRows, { onConflict: "coach_id,tag_id", ignoreDuplicates: true });
          }
        }

        // If there's a pending product, create it
        if (appData.pending_product && (appData.pending_product as any).title) {
          const pp = appData.pending_product as any;
          const { data: productRow } = await supabase
            .from("coach_products")
            .insert({
              coach_id: coachId,
              product_type: pp.product_type || "single_session",
              title: pp.title,
              outcome_statement: pp.outcome_statement || null,
              price_type: pp.price_type || "enquiry",
              price_cents: pp.price_cents || null,
              price_display: pp.price_display || null,
              cta_label: "Book Now",
              is_active: true,
              sort_order: 0,
            })
            .select("id")
            .single();

          if (productRow?.id) {
            // Build product tag keys
            const productTagKeys: string[] = [
              ...(pp.outcome_tags || []),
              ...(pp.audience_tags || []),
              ...(pp.format_tags || []),
              ...(pp.product_type ? [pp.product_type] : []),
            ];

            if (productTagKeys.length > 0) {
              const { data: productTagRows } = await supabase
                .from("tags")
                .select("id, tag_key")
                .in("tag_key", productTagKeys);

              if (productTagRows && productTagRows.length > 0) {
                await supabase
                  .from("product_tag_map")
                  .insert(productTagRows.map((t: any) => ({ product_id: productRow.id, tag_id: t.id })));
              }
            }
          }
        }
      }
    } catch (tagErr: any) {
      console.error("approve-coach tag/product sync error (non-blocking):", tagErr);
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
          from: "Galoras <noreply@uat-galoras.site>",
          to: [reg.email],
          subject: "You're approved — Payment receipt & next steps",
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
              <h2 style="margin-bottom:4px">Congratulations, ${reg.full_name ?? "Coach"}! You're in.</h2>
              <p style="color:#6b7280;margin-top:0">Your Galoras coach application has been approved.</p>

              <!-- Receipt -->
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:24px 0">
                <p style="margin:0 0 12px;font-weight:700;font-size:15px;color:#111">Payment Receipt</p>
                <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse">
                  <tr>
                    <td style="padding:6px 0">Galoras ${TIER_LABELS[tier]} Coach Subscription</td>
                    <td style="text-align:right;font-weight:600">$${(amountCents / 100).toFixed(2)} USD/month</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6b7280">Billing</td>
                    <td style="text-align:right;color:#6b7280">Monthly, starting today</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6b7280">Card on file</td>
                    <td style="text-align:right;color:#6b7280">Card authorized at application</td>
                  </tr>
                </table>
              </div>

              <!-- Profile CTA -->
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0">
                <p style="margin:0 0 8px;font-weight:600;color:#166534">Before we go live — complete your profile</p>
                <p style="margin:0 0 16px;font-size:14px;color:#374151">
                  Review your coach profile, update your bio, add your products, and make any changes before your listing goes public.
                </p>
                <a href="https://uat-galoras.site/coach-dashboard/edit"
                   style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
                  Complete My Profile →
                </a>
              </div>

              <!-- Orientation -->
              <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin:24px 0">
                <p style="margin:0 0 8px;font-weight:600;color:#0369a1">Book your orientation call</p>
                <p style="margin:0 0 16px;font-size:14px;color:#374151">
                  30 minutes with Barnes — platform walkthrough, how to get the most from your membership, and your first 90 days on Galoras.
                </p>
                <a href="https://calendly.com/barnes-lam/galoras-initial-session-call"
                   style="background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
                  Book Orientation →
                </a>
              </div>

              <p style="font-size:14px;color:#6b7280">Questions? Reply to this email or reach out to <a href="mailto:barnes@thestrategypitch.com" style="color:#0ea5e9">barnes@thestrategypitch.com</a>.</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
              <p style="color:#999;font-size:12px">© Galoras · uat-galoras.site</p>
            </div>
          `,
        }),
      });
    }

    // Auto-tag coach from profile text (fills gaps if application tags were incomplete)
    try {
      const coachRow2 = await supabase.from("coaches").select("id").eq("user_id", coachUserId).single();
      if (coachRow2.data?.id) {
        await supabase.functions.invoke("auto-tag-coach", {
          body: { coachId: coachRow2.data.id },
        });
      }
    } catch (autoTagErr: any) {
      console.error("auto-tag-coach call failed (non-blocking):", autoTagErr);
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
