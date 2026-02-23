import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Extract JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const jwt = authHeader.replace("Bearer ", "");

    // 2. Create service-role client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. Admin check via has_role DB function
    const { data: isAdmin, error: roleError } = await supabase.rpc(
      "has_role",
      { _user_id: user.id, _role: "admin" }
    );
    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 5. Parse input
    const { applicationId } = await req.json();
    if (!applicationId) {
      return new Response(
        JSON.stringify({ error: "applicationId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 6. Fetch current application
    const { data: app, error: appError } = await supabase
      .from("coach_applications")
      .select("status, onboarding_status")
      .eq("id", applicationId)
      .maybeSingle();

    if (appError || !app) {
      return new Response(
        JSON.stringify({ error: "Application not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 7. Status guard — block completed
    if (app.onboarding_status === "completed") {
      return new Response(
        JSON.stringify({
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

    // 9. Revoke old links (Fix 5)
    const { error: revokeError } = await supabase
      .from("onboarding_links")
      .update({ expires_at: new Date().toISOString() })
      .eq("application_id", applicationId)
      .gt("expires_at", new Date().toISOString());

    if (revokeError) {
      console.error("Failed to revoke old links:", revokeError);
      // Non-fatal — continue (there may be no old links)
    }

    // 10. Update coach_applications (preserves needs_changes via COALESCE)
    const newOnboardingStatus =
      app.onboarding_status ?? "pending";

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
          error: "Failed to update application",
          details: updateError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 11. Insert onboarding_links
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
          error: "Failed to create onboarding link",
          details: insertError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 12. Success
    return new Response(
      JSON.stringify({ shortId, applicationId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
