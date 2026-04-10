import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Previous 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: visits, error } = await supabase
      .from("site_visits")
      .select(
        "visitor_id, session_id, page_path, entered_at, duration_seconds, is_authenticated",
      )
      .gte("entered_at", since)
      .order("entered_at", { ascending: true });

    if (error) throw error;

    const totalPageViews = visits?.length ?? 0;
    const uniqueVisitors = new Set(visits?.map((v) => v.visitor_id)).size;
    const uniqueSessions = new Set(visits?.map((v) => v.session_id)).size;

    // Estimate session duration: for each session, time between first and last page view
    const sessionTimes: Record<string, { first: number; last: number }> = {};
    for (const v of visits ?? []) {
      const t = new Date(v.entered_at).getTime();
      if (!sessionTimes[v.session_id]) {
        sessionTimes[v.session_id] = { first: t, last: t };
      } else {
        if (t < sessionTimes[v.session_id].first)
          sessionTimes[v.session_id].first = t;
        if (t > sessionTimes[v.session_id].last)
          sessionTimes[v.session_id].last = t;
      }
    }

    let totalSeconds = 0;
    for (const sid in sessionTimes) {
      const diff =
        (sessionTimes[sid].last - sessionTimes[sid].first) / 1000;
      // Add 30s minimum per session (accounts for single-page sessions)
      totalSeconds += Math.max(diff, 30);
    }
    const totalMinutes = Math.round(totalSeconds / 60);

    // Top pages
    const pageCounts: Record<string, number> = {};
    for (const v of visits ?? []) {
      pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1;
    }
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, views: count }));

    // Authenticated vs anonymous
    const authenticatedVisits =
      visits?.filter((v) => v.is_authenticated).length ?? 0;

    const report = {
      period: { from: since, to: new Date().toISOString() },
      total_page_views: totalPageViews,
      unique_visitors: uniqueVisitors,
      unique_sessions: uniqueSessions,
      total_minutes_on_site: totalMinutes,
      authenticated_visits: authenticatedVisits,
      anonymous_visits: totalPageViews - authenticatedVisits,
      top_pages: topPages,
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(report, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
