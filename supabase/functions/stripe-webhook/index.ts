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

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  console.log("Stripe webhook event:", event.type);

  try {
    switch (event.type) {

      // ── ONE-TIME COACHING PURCHASE ──────────────────────────────────────
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const { bookingId, userId, userName, userEmail, coachId, productTitle } = intent.metadata;

        if (!bookingId) break; // not a booking payment

        // Confirm booking
        await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            stripe_payment_intent_id: intent.id,
          })
          .eq("id", bookingId);

        // Fetch coach details for notification
        const { data: coach } = await supabase
          .from("coaches")
          .select("display_name, user_id")
          .eq("id", coachId)
          .maybeSingle();

        // Fetch coach email via profiles
        let coachEmail: string | undefined;
        if (coach?.user_id) {
          const { data: coachProfile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", coach.user_id)
            .maybeSingle();
          coachEmail = coachProfile?.email ?? undefined;
        }

        // Send booking notification emails
        if (userEmail && coach) {
          await supabase.functions.invoke("send-booking-notification", {
            body: {
              type: "booking_confirmed",
              coachId,
              coachName: coach.display_name ?? "Your Coach",
              coachEmail,
              clientEmail: userEmail,
              clientName: userName || userEmail,
              productTitle,
              scheduledDate: "TBD",
              scheduledTime: "TBD",
              duration: 60,
            },
          });
        }

        console.log(`Booking ${bookingId} confirmed for user ${userId}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const { bookingId } = intent.metadata;

        if (!bookingId) break;

        await supabase
          .from("bookings")
          .update({ status: "payment_failed" })
          .eq("id", bookingId);

        console.log(`Booking ${bookingId} payment failed`);
        break;
      }

      // ── SUBSCRIPTIONS ────────────────────────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.userId;
        const plan = sub.metadata.plan;

        if (!userId) break;

        await supabase
          .from("profiles")
          .update({
            subscription_status: sub.status,
            subscription_tier: plan ?? null,
            subscription_id: sub.id,
            subscription_current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq("id", userId);

        console.log(`Subscription ${sub.id} ${event.type} for user ${userId}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.userId;

        if (!userId) break;

        await supabase
          .from("profiles")
          .update({
            subscription_status: "canceled",
            subscription_tier: null,
            subscription_id: null,
            subscription_current_period_end: null,
          })
          .eq("id", userId);

        console.log(`Subscription canceled for user ${userId}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = invoice.subscription as string;

        if (!sub) break;

        const subscription = await stripe.subscriptions.retrieve(sub);
        const userId = subscription.metadata.userId;

        if (!userId) break;

        await supabase
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("id", userId);

        console.log(`Invoice payment failed for subscription ${sub}, user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`Error handling event ${event.type}:`, err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
