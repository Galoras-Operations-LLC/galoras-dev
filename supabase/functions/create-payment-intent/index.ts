import Stripe from "https://esm.sh/stripe@14";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { productId, coachId, amountCents, currency = "cad" } = await req.json();

    if (!productId || !coachId || !amountCents) {
      return new Response(
        JSON.stringify({ error: "Missing productId, coachId, or amountCents" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the product exists and is active
    const { data: product, error: productError } = await supabase
      .from("coach_products")
      .select("id, title, coach_id, is_active")
      .eq("id", productId)
      .eq("coach_id", coachId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return new Response(JSON.stringify({ error: "Product not found or inactive" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get user profile for metadata
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    // Create a pending booking record
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        coach_id: coachId,
        product_id: productId,
        client_id: user.id,
        status: "pending_payment",
        amount_cents: amountCents,
        currency,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Booking creation error:", bookingError);
      return new Response(JSON.stringify({ error: "Failed to create booking" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: booking.id,
        productId,
        coachId,
        userId: user.id,
        userEmail: user.email ?? "",
        userName: profile?.full_name ?? "",
        productTitle: product.title ?? "",
      },
    });

    // Store paymentIntentId on booking
    await supabase
      .from("bookings")
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        bookingId: booking.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("create-payment-intent error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
