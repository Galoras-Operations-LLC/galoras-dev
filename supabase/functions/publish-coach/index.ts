import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const normalizeUrl = (url: string | null | undefined) => {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin using their JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { applicationId, reviewerNotes } = await req.json();
    if (!applicationId) {
      return new Response(
        JSON.stringify({ error: "applicationId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch application
    const { data: app, error: appError } = await adminClient
      .from("coach_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (appError || !app) {
      return new Response(
        JSON.stringify({ error: "Application not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify correct status
    if (app.status !== "approved" || app.onboarding_status !== "completed") {
      return new Response(
        JSON.stringify({
          error: "Application must be approved with completed onboarding",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Look up or create auth user (must happen before idempotency check)
    let coachUserId = app.user_id;

    if (!coachUserId) {
      const { data: usersData } = await adminClient.auth.admin.listUsers();
      const existingUser = usersData?.users?.find(
        (u: { email?: string }) => u.email === app.email
      );

      if (existingUser) {
        coachUserId = existingUser.id;
      } else {
        const { data: newUser, error: createError } =
          await adminClient.auth.admin.createUser({
            email: app.email,
            email_confirm: true,
          });

        if (createError || !newUser?.user) {
          return new Response(
            JSON.stringify({
              error: "Failed to create auth user",
              details: createError?.message,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        coachUserId = newUser.user.id;
      }

      await adminClient
        .from("coach_applications")
        .update({ user_id: coachUserId })
        .eq("id", applicationId);
    }

    // Idempotency: check if coach already exists by user_id
    const { data: existingCoach } = await adminClient
      .from("coaches")
      .select("id")
      .eq("user_id", coachUserId)
      .maybeSingle();

    if (existingCoach) {
      // Update fields (including booking_url) on re-publish
      await adminClient
        .from("coaches")
        .update({
          booking_url: normalizeUrl(app.booking_url),
          linkedin_url: app.linkedin_url,
          website_url: app.website_url,
          avatar_url: app.avatar_url,
          bio: app.bio,
        })
        .eq("id", existingCoach.id);

      await adminClient
        .from("coach_applications")
        .update({
          onboarding_status: "published",
          reviewed_at: new Date().toISOString(),
          reviewer_notes: reviewerNotes || app.reviewer_notes,
        })
        .eq("id", applicationId);

      return new Response(
        JSON.stringify({ success: true, coachId: existingCoach.id, alreadyExisted: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert coaches record
    const { data: coachRecord, error: coachError } = await adminClient
      .from("coaches")
      .insert({
        user_id: coachUserId,
        display_name: app.full_name,
        bio: app.bio,
        booking_url: normalizeUrl(app.booking_url),
        specialties: app.specialties,
        avatar_url: app.avatar_url,
        linkedin_url: app.linkedin_url,
        website_url: app.website_url,
        status: "approved",
        coach_background: app.coach_background || null,
        coaching_experience_level: app.coaching_experience_level || null,
        leadership_experience_years: app.leadership_experience_years || null,
        pillar_specialties: app.pillar_specialties || null,
        current_role: app.current_role || null,
        coaching_philosophy: app.coaching_philosophy || null,
      })
      .select("id")
      .single();

    if (coachError) {
      return new Response(
        JSON.stringify({
          error: "Failed to create coach record",
          details: coachError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert profile (ignore conflict if handle_new_user trigger already created one)
    await adminClient.from("profiles").upsert(
      {
        user_id: coachUserId,
        email: app.email,
        full_name: app.full_name,
        avatar_url: app.avatar_url,
        bio: app.bio,
      },
      { onConflict: "user_id" }
    );

    // Assign user role if not exists
    const { data: existingRole } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", coachUserId)
      .eq("role", "user")
      .maybeSingle();

    if (!existingRole) {
      await adminClient
        .from("user_roles")
        .insert({ user_id: coachUserId, role: "user" });
    }

    // Update application status to published
    await adminClient
      .from("coach_applications")
      .update({
        onboarding_status: "published",
        reviewed_at: new Date().toISOString(),
        reviewer_notes: reviewerNotes || app.reviewer_notes,
      })
      .eq("id", applicationId);

    return new Response(
      JSON.stringify({ success: true, coachId: coachRecord.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
