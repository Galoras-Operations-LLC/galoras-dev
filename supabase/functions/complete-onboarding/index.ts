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
      primaryPillar, secondaryPillars, industryFocus, coachingStyle,
      engagementModel, availabilityStatus,
      founderStageFocus, founderFunctionStrength, execLevel, execFunction,
      bookingUrl,
      specialtyTags, audienceTags, styleTags, industryTags,
      availabilityTag, enterpriseTags, credentialTags, pendingProduct,
    } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Server-side URL validation — reject any non-https:// URL to prevent XSS via stored URLs
    const assertHttpsUrl = (val: unknown, field: string): string | null => {
      if (val == null || val === "") return null;
      try {
        const u = new URL(String(val));
        if (u.protocol !== "https:") throw new Error();
        return u.href;
      } catch {
        throw new Error(`${field} must be a valid https:// URL`);
      }
    };

    try {
      if (linkedinUrl !== undefined) assertHttpsUrl(linkedinUrl, "linkedinUrl");
      if (avatarUrl !== undefined) assertHttpsUrl(avatarUrl, "avatarUrl");
      if (bookingUrl !== undefined) assertHttpsUrl(bookingUrl, "bookingUrl");
    } catch (validationError: any) {
      return new Response(
        JSON.stringify({ error: validationError.message }),
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
      .in("onboarding_status", ["pending", "needs_changes"])
      .maybeSingle();

    if (fetchError || !application) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build update object with conditional spreads to prevent wiping Step-1 data
    const updates: Record<string, any> = {
      onboarding_status: "completed",
      reviewed_at: new Date().toISOString(),
      // Only update if provided
      ...(fullName && { full_name: fullName }),
      ...(bio && { bio }),
      ...(coachingFocus && { specialties: coachingFocus.split(",").map((s: string) => s.trim()) }),
      ...(linkedinUrl !== undefined && { linkedin_url: linkedinUrl || null }),
      ...(avatarUrl !== undefined && { avatar_url: avatarUrl || null }),
      ...(coachingPhilosophy !== undefined && { coaching_philosophy: coachingPhilosophy || null }),
      // Step-1 fields: only update if explicitly sent
      ...(coachBackground !== undefined && { coach_background: coachBackground || null }),
      ...(coachBackgroundDetail !== undefined && { coach_background_detail: coachBackgroundDetail || null }),
      ...(certificationInterest !== undefined && { certification_interest: certificationInterest || null }),
      ...(coachingExperienceYears !== undefined && { coaching_experience_years: coachingExperienceYears || null }),
      ...(leadershipExperienceYears !== undefined && { leadership_experience_years: leadershipExperienceYears || null }),
      ...(currentRole !== undefined && { current_role: currentRole || null }),
      ...(coachingExperienceLevel !== undefined && { coaching_experience_level: coachingExperienceLevel || null }),
      // Step-2 fields
      ...(pillarSpecialties !== undefined && { pillar_specialties: pillarSpecialties || null }),
      ...(primaryJoinReason !== undefined && { primary_join_reason: primaryJoinReason || null }),
      ...(commitmentLevel !== undefined && { commitment_level: commitmentLevel || null }),
      ...(startTimeline !== undefined && { start_timeline: startTimeline || null }),
      ...(excitementNote !== undefined && { excitement_note: excitementNote || null }),
      ...(primaryPillar !== undefined && { primary_pillar: primaryPillar || null }),
      ...(secondaryPillars !== undefined && { secondary_pillars: secondaryPillars || null }),
      ...(industryFocus !== undefined && { industry_focus: industryFocus || null }),
      ...(coachingStyle !== undefined && { coaching_style: coachingStyle || null }),
      ...(engagementModel !== undefined && { engagement_model: engagementModel || null }),
      ...(availabilityStatus !== undefined && { availability_status: availabilityStatus || null }),
      ...(founderStageFocus !== undefined && { founder_stage_focus: founderStageFocus || null }),
      ...(founderFunctionStrength !== undefined && { founder_function_strength: founderFunctionStrength || null }),
      ...(execLevel !== undefined && { exec_level: execLevel || null }),
      ...(execFunction !== undefined && { exec_function: execFunction || null }),
      ...(bookingUrl !== undefined && { booking_url: bookingUrl || null }),
      ...(specialtyTags !== undefined && { specialty_tags: specialtyTags || null }),
      ...(audienceTags !== undefined && { audience_tags: audienceTags || null }),
      ...(styleTags !== undefined && { style_tags: styleTags || null }),
      ...(industryTags !== undefined && { industry_tags: industryTags || null }),
      ...(availabilityTag !== undefined && { availability_tag: availabilityTag || null }),
      ...(enterpriseTags !== undefined && { enterprise_tags: enterpriseTags || null }),
      ...(credentialTags !== undefined && { credential_tags: credentialTags || null }),
      ...(pendingProduct !== undefined && { pending_product: pendingProduct || null }),
    };

    const { error: updateError } = await supabase
      .from("coach_applications")
      .update(updates)
      .eq("id", application.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark onboarding link as used after successful completion
    await supabase
      .from("onboarding_links")
      .update({ used_at: new Date().toISOString() })
      .eq("onboarding_token", token);

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
