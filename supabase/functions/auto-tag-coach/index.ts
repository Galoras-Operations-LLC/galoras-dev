import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Tag mapping rules ─────────────────────────────────────────────────────────
// Each rule: { tag_key, tag_family, keywords[] }
// If ANY keyword appears in the coach's combined text, the tag is assigned.

const TAG_RULES: { tag_key: string; keywords: string[] }[] = [
  // Specialty
  { tag_key: "leadership_development",  keywords: ["leadership", "leader", "leading"] },
  { tag_key: "executive_coaching",      keywords: ["executive", "c-suite", "ceo", "cfo", "cto", "coo", "vp", "director"] },
  { tag_key: "career_transitions",      keywords: ["career transition", "career change", "career pivot", "career advancement"] },
  { tag_key: "performance_coaching",    keywords: ["performance", "execution", "productivity", "high-performance"] },
  { tag_key: "mindset_resilience",      keywords: ["mindset", "resilience", "mental", "psychological", "emotional intelligence"] },
  { tag_key: "communication_presence",  keywords: ["communication", "presence", "executive presence", "public speaking", "influence"] },
  { tag_key: "team_dynamics",           keywords: ["team dynamics", "team coaching", "team performance", "team building"] },
  { tag_key: "startup_founder",         keywords: ["startup", "founder", "entrepreneur", "venture", "early-stage"] },
  { tag_key: "wellbeing",              keywords: ["wellbeing", "well-being", "stress management", "burnout", "wellness"] },
  { tag_key: "diversity_inclusion",     keywords: ["diversity", "inclusion", "dei", "equity", "belonging"] },

  // Audience
  { tag_key: "c_suite",               keywords: ["c-suite", "ceo", "cfo", "cto", "coo", "chief", "board director"] },
  { tag_key: "senior_leaders",         keywords: ["vp", "director", "senior leader", "senior manager", "svp", "evp"] },
  { tag_key: "mid_managers",           keywords: ["mid-level", "manager", "people manager", "first-time manager"] },
  { tag_key: "founders",              keywords: ["founder", "entrepreneur", "ceo", "co-founder"] },
  { tag_key: "teams",                 keywords: ["team", "group", "cohort", "department"] },
  { tag_key: "career_changers",        keywords: ["career change", "career transition", "career pivot"] },

  // Outcome
  { tag_key: "clarity",               keywords: ["clarity", "direction", "focus", "priorities", "clear"] },
  { tag_key: "confidence",            keywords: ["confidence", "self-belief", "imposter", "self-doubt"] },
  { tag_key: "promotion_readiness",    keywords: ["promotion", "advancement", "next level", "step up", "career growth"] },
  { tag_key: "better_communication",   keywords: ["communication", "presenting", "influence", "stakeholder"] },
  { tag_key: "team_performance",       keywords: ["team performance", "team alignment", "team effectiveness"] },
  { tag_key: "strategic_thinking",     keywords: ["strategic", "strategy", "gtm", "go-to-market", "vision"] },
  { tag_key: "accountability",         keywords: ["accountability", "follow-through", "execution", "discipline"] },
  { tag_key: "resilience",            keywords: ["resilience", "stress", "pressure", "burnout", "adversity"] },

  // Format
  { tag_key: "one_to_one",            keywords: ["1:1", "one-to-one", "1-on-1", "individual", "one to one"] },
  { tag_key: "group_coaching",         keywords: ["group", "cohort", "team coaching"] },
  { tag_key: "workshop",              keywords: ["workshop", "seminar", "masterclass", "training"] },
  { tag_key: "online_remote",          keywords: ["online", "remote", "virtual", "zoom"] },
  { tag_key: "in_person",             keywords: ["in-person", "in person", "face-to-face", "onsite"] },
  { tag_key: "hybrid",                keywords: ["hybrid"] },

  // Style
  { tag_key: "directive",             keywords: ["directive", "hands-on", "prescriptive", "action-oriented"] },
  { tag_key: "solution_focused",       keywords: ["solution-focused", "solution focused", "practical", "outcome-driven", "results"] },
  { tag_key: "strengths_based",        keywords: ["strengths-based", "strengths based", "positive psychology", "gallup"] },
  { tag_key: "cognitive_behavioural",  keywords: ["cognitive", "behavioural", "behavioral", "cbt"] },
  { tag_key: "systemic",              keywords: ["systemic", "systems thinking", "organizational systems"] },
  { tag_key: "mindfulness_based",      keywords: ["mindfulness", "meditation", "contemplative", "awareness"] },

  // Industry
  { tag_key: "technology",            keywords: ["tech", "saas", "software", "ai", "digital", "telecom", "apple", "google", "cisco", "blackberry"] },
  { tag_key: "finance",               keywords: ["finance", "banking", "investment", "private equity", "fintech"] },
  { tag_key: "healthcare",            keywords: ["health", "medical", "pharma", "biotech"] },
  { tag_key: "professional_services",  keywords: ["consulting", "legal", "accounting", "professional services"] },

  // Enterprise
  { tag_key: "enterprise_ready",       keywords: ["enterprise", "corporate", "organization", "department", "org-wide"] },
  { tag_key: "team_coaching",          keywords: ["team coaching", "team development", "team program"] },
  { tag_key: "leadership_programs",    keywords: ["leadership program", "leadership development program", "ldp"] },

  // Availability (default to taking_clients for new coaches)
  { tag_key: "taking_clients",         keywords: ["__default__"] },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { coachId } = await req.json();
    if (!coachId) {
      return new Response(JSON.stringify({ error: "coachId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Fetch coach profile
    const { data: coach, error: coachErr } = await supabase
      .from("coaches")
      .select("id, display_name, headline, bio, specialties, audience, coaching_style, coaching_philosophy, primary_pillar, secondary_pillars, industry_focus, pillar_specialties, current_role, engagement_model, methodology")
      .eq("id", coachId)
      .single();

    if (coachErr || !coach) {
      return new Response(JSON.stringify({ error: "Coach not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Also fetch their products for additional signal
    const { data: products } = await supabase
      .from("coach_products")
      .select("title, outcome_statement, target_audience, delivery_format, enterprise_ready")
      .eq("coach_id", coachId)
      .eq("is_active", true);

    // Build combined text corpus for keyword matching
    const textParts = [
      coach.display_name,
      coach.headline,
      coach.bio,
      coach.coaching_style,
      coach.coaching_philosophy,
      coach.primary_pillar,
      coach.industry_focus,
      coach.current_role,
      coach.engagement_model,
      coach.methodology,
      ...(coach.specialties || []),
      ...(coach.audience || []),
      ...(coach.secondary_pillars || []),
      ...(coach.pillar_specialties || []),
      ...(products || []).flatMap(p => [
        p.title,
        p.outcome_statement,
        ...(p.target_audience || []),
        p.delivery_format,
      ]),
    ].filter(Boolean);

    const corpus = textParts.join(" ").toLowerCase();

    // Check enterprise_ready from products
    const hasEnterpriseProduct = (products || []).some(p => p.enterprise_ready);

    // Fetch all active tags
    const { data: allTags } = await supabase
      .from("tags")
      .select("id, tag_key")
      .eq("is_active", true);

    if (!allTags) {
      return new Response(JSON.stringify({ error: "No tags found" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const tagIdByKey: Record<string, string> = {};
    for (const t of allTags) tagIdByKey[t.tag_key] = t.id;

    // Match tags
    const matchedTagIds: string[] = [];

    for (const rule of TAG_RULES) {
      const tagId = tagIdByKey[rule.tag_key];
      if (!tagId) continue;

      // Special: enterprise_ready also checks product flag
      if (rule.tag_key === "enterprise_ready" && hasEnterpriseProduct) {
        matchedTagIds.push(tagId);
        continue;
      }

      // Default tag (taking_clients for new coaches)
      if (rule.keywords.includes("__default__")) {
        matchedTagIds.push(tagId);
        continue;
      }

      if (rule.keywords.some(kw => corpus.includes(kw))) {
        matchedTagIds.push(tagId);
      }
    }

    // Clear existing tags for this coach, then insert new ones
    await supabase.from("coach_tag_map").delete().eq("coach_id", coachId);

    if (matchedTagIds.length > 0) {
      const rows = matchedTagIds.map(tagId => ({ coach_id: coachId, tag_id: tagId }));
      const { error: insertErr } = await supabase
        .from("coach_tag_map")
        .insert(rows);

      if (insertErr) {
        console.error("Tag insert error:", insertErr);
        return new Response(JSON.stringify({ error: "Failed to insert tags", detail: insertErr.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    return new Response(
      JSON.stringify({ coachId, tagsAssigned: matchedTagIds.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("auto-tag-coach error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
