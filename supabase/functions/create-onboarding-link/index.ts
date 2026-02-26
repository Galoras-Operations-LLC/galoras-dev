import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE62 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateBase62(length = 12): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => BASE62[b % 62]).join("");
}

function generateToken(): string {
  return (
    crypto.randomUUID().replace(/-/g, "") +
    crypto.randomUUID().replace(/-/g, "")
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let step = "start";

  try {
    // 1. Extract JWT from Authorization header
    step = "auth_header";
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ step, error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const jwt = authHeader.replace("Bearer ", "");

    // 2. Create service-role client
    step = "env";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Get user from JWT
    step = "get_user";
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ step, error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log("[create-onboarding-link]", { step, userId: user.id });

    // 4. Admin check via direct user_roles query (service-role bypasses RLS)
    step = "admin_check";
    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleRow) {
      return new Response(
        JSON.stringify({ step, error: "Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log("[create-onboarding-link]", { step, result: "admin confirmed" });

    // 5. Parse input
    step = "parse_body";
    const { applicationId } = await req.json();
    if (!applicationId) {
      return new Response(
        JSON.stringify({ step, error: "applicationId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. Fetch current application
    step = "fetch_application";
    const { data: app, error: appError } = await supabase
      .from("coach_applications")
      .select("status, onboarding_status")
      .eq("id", applicationId)
      .maybeSingle();

    if (appError || !app) {
      return new Response(
        JSON.stringify({ step, error: "Application not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log("[create-onboarding-link]", { step, onboarding_status: app.onboarding_status });

    // 7. Status guard — block completed
    if (app.onboarding_status === "completed") {
      return new Response(
        JSON.stringify({
          step,
          error: "Cannot regenerate after onboarding completion",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Allowed: onboarding_status IS NULL, 'pending', or 'needs_changes'
    const allowed = [null, "pending", "needs_changes"];
    if (!allowed.includes(app.onboarding_status)) {
      return new Response(
        JSON.stringify({
          step,
          error: `Invalid onboarding_status: ${app.onboarding_status}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 8. Generate token + shortId server-side
    const token = generateToken();
    const shortId = generateBase62(12);

    // 9. Revoke old links
    step = "revoke_old_links";
    const { error: revokeError } = await supabase
      .from("onboarding_links")
      .update({ expires_at: new Date().toISOString() })
      .eq("application_id", applicationId)
      .gt("expires_at", new Date().toISOString());

    if (revokeError) {
      console.error("[create-onboarding-link] Failed to revoke old links:", revokeError);
      // Non-fatal — continue (there may be no old links)
    }

    // 10. Update coach_applications
    step = "update_application";
    const newOnboardingStatus = app.onboarding_status ?? "pending";

    const { error: updateError } = await supabase
      .from("coach_applications")
      .update({
        status: "approved",
        onboarding_token: token,
        onboarding_short_id: shortId,
        onboarding_status: newOnboardingStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateError) {
      return new Response(
        JSON.stringify({
          step,
          error: "Failed to update application",
          message: updateError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log("[create-onboarding-link]", { step, applicationId });

    // 11. Insert onboarding_links
    step = "insert_onboarding_link";
    const { error: insertError } = await supabase
      .from("onboarding_links")
      .insert({
        short_id: shortId,
        application_id: applicationId,
        onboarding_token: token,
      });

    if (insertError) {
      return new Response(
        JSON.stringify({
          step,
          error: "Failed to create onboarding link",
          message: insertError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    console.log("[create-onboarding-link]", { step, shortId });

    // 12. Success
    step = "done";
    console.log("[create-onboarding-link]", { step, applicationId, shortId });
    return new Response(
      JSON.stringify({ shortId, applicationId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[create-onboarding-link] Error:", { step, error });
    return new Response(
      JSON.stringify({ step, error: "Internal server error", message: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
