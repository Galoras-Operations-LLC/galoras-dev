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
    const {
      token, fullName, bio, coachingFocus, linkedinUrl, avatarUrl,
      coachingPhilosophy, coachBackground, coachBackgroundDetail,
      certificationInterest, coachingExperienceYears, leadershipExperienceYears,
      currentRole, coachingExperienceLevel, pillarSpecialties,
      primaryJoinReason, commitmentLevel, startTimeline, excitementNote,
    } = await req.json();

    if (!token || !fullName || !bio || !coachingFocus) {
      return new Response(
        JSON.stringify({ error: "Required fields missing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate token and get application
    const { data: application, error: fetchError } = await supabase
      .from("coach_applications")
      .select("*")
      .eq("onboarding_token", token)
      .eq("status", "approved")
      .eq("onboarding_status", "pending")
      .maybeSingle();

    if (fetchError || !application) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the application with profile data and mark as completed
    const { error: updateError } = await supabase
      .from("coach_applications")
      .update({
        full_name: fullName,
        bio: bio,
        specialties: coachingFocus.split(",").map((s: string) => s.trim()),
        linkedin_url: linkedinUrl || null,
        avatar_url: avatarUrl || null,
        onboarding_status: "completed",
        reviewed_at: new Date().toISOString(),
        // New structured fields
        coaching_philosophy: coachingPhilosophy || null,
        coach_background: coachBackground || null,
        coach_background_detail: coachBackgroundDetail || null,
        certification_interest: certificationInterest || null,
        coaching_experience_years: coachingExperienceYears || null,
        leadership_experience_years: leadershipExperienceYears || null,
        current_role: currentRole || null,
        coaching_experience_level: coachingExperienceLevel || null,
        pillar_specialties: pillarSpecialties || null,
        primary_join_reason: primaryJoinReason || null,
        commitment_level: commitmentLevel || null,
        start_timeline: startTimeline || null,
        excitement_note: excitementNote || null,
      })
      .eq("id", application.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
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
