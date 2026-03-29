import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find application by token
    const { data: application, error } = await supabase
      .from("coach_applications")
      .select("*")
      .eq("onboarding_token", token)
      .eq("status", "approved")
      .eq("onboarding_status", "pending")
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!application) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return only the fields the onboarding form needs — never echo the token or internal fields
    const {
      full_name, bio, coaching_philosophy, coach_background, coach_background_detail,
      certification_interest, coaching_experience_years, leadership_experience_years,
      current_role, coaching_experience_level, pillar_specialties, primary_join_reason,
      commitment_level, start_timeline, excitement_note, primary_pillar, secondary_pillars,
      industry_focus, coaching_style, engagement_model, availability_status,
      founder_stage_focus, founder_function_strength, exec_level, exec_function,
      specialties, linkedin_url, avatar_url,
    } = application;

    return new Response(
      JSON.stringify({
        application: {
          full_name, bio, coaching_philosophy, coach_background, coach_background_detail,
          certification_interest, coaching_experience_years, leadership_experience_years,
          current_role, coaching_experience_level, pillar_specialties, primary_join_reason,
          commitment_level, start_timeline, excitement_note, primary_pillar, secondary_pillars,
          industry_focus, coaching_style, engagement_model, availability_status,
          founder_stage_focus, founder_function_strength, exec_level, exec_function,
          specialties, linkedin_url, avatar_url,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
