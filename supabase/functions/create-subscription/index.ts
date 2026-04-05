import Stripe from "https://esm.sh/stripe@14";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Map plan keys to Stripe Price IDs — set these in your Stripe dashboard
const PLAN_PRICE_IDS: Record<string, string> = {
  b2c_monthly: Deno.env.get("STRIPE_PRICE_B2C_MONTHLY") ?? "",
  b2c_annual: Deno.env.get("STRIPE_PRICE_B2C_ANNUAL") ?? "",
  enterprise: Deno.env.get("STRIPE_PRICE_ENTERPRISE") ?? "",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { plan } = await req.json();

    if (!plan || !PLAN_PRICE_IDS[plan]) {
      return new Response(
        JSON.stringify({ error: `Invalid plan. Valid plans: ${Object.keys(PLAN_PRICE_IDS).join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get or create Stripe customer tied to this user
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, full_name")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Check for an existing active subscription to avoid duplicates
    const existing = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (existing.data.length > 0) {
      return new Response(
        JSON.stringify({ error: "Already has an active subscription" }),
        { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create the subscription (incomplete until payment confirmed)
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: PLAN_PRICE_IDS[plan] }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: { userId: user.id, plan },
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("create-subscription error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
