import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Search, Sparkles, UserCircle2, ArrowRight, GitCompareArrows, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContactModal } from "@/components/coaching/ContactModal";
import { DirectoryCoachCard, type DirectoryCoach } from "@/components/coaching/DirectoryCoachCard";
import { toggle } from "@/components/coaching/DirectoryFilters";
import { useAuth } from "@/hooks/useAuth";
import { useProductTypes } from "@/hooks/useProductTypes";

// ── Component ─────────────────────────────────────────────────────────────────

export default function CoachingDirectory() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  const matchedParam = searchParams.get("matched") === "1";

  const [searchQuery, setSearchQuery] = useState("");

  // Multi-select filters
  const [selProductTypes, setSelProductTypes] = useState<string[]>([]);
  const [selSpecialties, setSelSpecialties] = useState<string[]>(
    filterParam ? [filterParam] : []
  );
  const [selAudience, setSelAudience] = useState<string[]>([]);
  const [selOutcomes, setSelOutcomes] = useState<string[]>([]);
  const [selFormats, setSelFormats] = useState<string[]>([]);
  const [selPillars, setSelPillars] = useState<string[]>([]);
  const [selTiers, setSelTiers] = useState<string[]>([]);
  const [selEngagementFormats, setSelEngagementFormats] = useState<string[]>([]);
  const [enterpriseOnly, setEnterpriseOnly] = useState(false);

  const [contactCoach, setContactCoach] = useState<{ id: string; name: string } | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const { isLoggedIn, profile } = useAuth();
  const navigate = useNavigate();
  const { getConfig } = useProductTypes();

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const activeFilterCount =
    selProductTypes.length + selSpecialties.length + selAudience.length +
    selOutcomes.length + selFormats.length + selPillars.length +
    selTiers.length + selEngagementFormats.length + (enterpriseOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelProductTypes([]);
    setSelSpecialties([]);
    setSelAudience([]);
    setSelOutcomes([]);
    setSelFormats([]);
    setSelPillars([]);
    setSelTiers([]);
    setSelEngagementFormats([]);
    setEnterpriseOnly(false);
    setSearchQuery("");
  };

  // ── Data ───────────────────────────────────────────────────────────────────

  const { data: coaches, isLoading, error } = useQuery({
    queryKey: ["public-coaches-directory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, slug, display_name, headline, bio, specialties, audience, avatar_url, booking_url, tier, primary_pillar, engagement_format, coaching_style, coach_products(product_type, title, price_type, price_amount, enterprise_ready)")
        .eq("lifecycle_status", "published")
        .order("display_name", { ascending: true });
      if (error) throw error;
      return (data || []) as DirectoryCoach[];
    },
  });

  const { data: coachTagData } = useQuery({
    queryKey: ["coach-tag-map-directory"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("coach_tag_map")
        .select("coach_id, tags(tag_key, tag_label, tag_family)");
      return data || [];
    },
  });

  const coachTagLookup = useMemo(() => {
    const map: Record<string, { tag_key: string; tag_label: string; tag_family: string }[]> = {};
    (coachTagData || []).forEach((row: any) => {
      if (!map[row.coach_id]) map[row.coach_id] = [];
      if (row.tags) map[row.coach_id].push(row.tags);
    });
    return map;
  }, [coachTagData]);

  // Build a set of all tag labels for search matching
  const allTagLabels = useMemo(() => {
    const labels: Record<string, string[]> = {};
    (coachTagData || []).forEach((row: any) => {
      if (!row.tags) return;
      if (!labels[row.coach_id]) labels[row.coach_id] = [];
      labels[row.coach_id].push(row.tags.tag_label.toLowerCase());
    });
    return labels;
  }, [coachTagData]);

  // DB-driven filter options (derived from published coaches)
  const { dbPillars, dbTiers, dbEngagementFormats, dbAudiences } = useMemo(() => {
    const pillars = new Set<string>(), tiers = new Set<string>();
    const formats = new Set<string>(), audiences = new Set<string>();
    (coaches || []).forEach(c => {
      if (c.primary_pillar) pillars.add(c.primary_pillar);
      if (c.tier) tiers.add(c.tier);
      if (c.engagement_format) formats.add(c.engagement_format);
      (c.audience || []).forEach(a => audiences.add(a));
    });
    return {
      dbPillars: [...pillars].sort(), dbTiers: [...tiers].sort(),
      dbEngagementFormats: [...formats].sort(), dbAudiences: [...audiences].sort(),
    };
  }, [coaches]);

  const matchScore = (coach: DirectoryCoach): number => {
    if (!profile?.coaching_areas || profile.coaching_areas.length === 0) return 0;
    const userAreas = profile.coaching_areas.map((a) => a.toLowerCase());
    return (coach.specialties || []).filter((s) =>
      userAreas.includes(s.toLowerCase())
    ).length;
  };

  // Filtering: AND across categories, OR within category
  const filtered = (coaches || []).filter((coach) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const text = [coach.display_name, coach.headline, coach.bio, ...(coach.specialties || [])].join(" ").toLowerCase();
      const tags = (allTagLabels[coach.id] || []).join(" ");
      if (!text.includes(q) && !tags.includes(q)) return false;
    }
    if (selProductTypes.length > 0) {
      const types = (coach.coach_products || []).map(p => p.product_type);
      if (!selProductTypes.some(t => types.includes(t))) return false;
    }
    if (enterpriseOnly && !(coach.coach_products || []).some(p => p.enterprise_ready)) return false;
    const ct = coachTagLookup[coach.id] || [];
    if (selSpecialties.length > 0) {
      const keys = ct.filter(t => t.tag_family === "specialty").map(t => t.tag_key);
      const legacy = (coach.specialties || []).map(s => s.toLowerCase());
      if (!selSpecialties.some(s => keys.includes(s) || legacy.includes(s))) return false;
    }
    if (selAudience.length > 0 && !selAudience.some(a => ct.filter(t => t.tag_family === "audience").map(t => t.tag_key).includes(a))) return false;
    if (selOutcomes.length > 0 && !selOutcomes.some(o => ct.filter(t => t.tag_family === "outcome").map(t => t.tag_key).includes(o))) return false;
    if (selFormats.length > 0 && !selFormats.some(f => ct.filter(t => t.tag_family === "format").map(t => t.tag_key).includes(f))) return false;
    if (selPillars.length > 0 && (!coach.primary_pillar || !selPillars.includes(coach.primary_pillar))) return false;
    if (selTiers.length > 0 && (!coach.tier || !selTiers.includes(coach.tier))) return false;
    if (selEngagementFormats.length > 0 && (!coach.engagement_format || !selEngagementFormats.includes(coach.engagement_format))) return false;
    return true;
  }).sort((a, b) => matchScore(b) - matchScore(a));

  const hasProfile = isLoggedIn && profile?.onboarding_complete;
  const hasMatches = isLoggedIn && profile?.coaching_areas && profile.coaching_areas.length > 0;

  const coachProfilePath = (coach: DirectoryCoach) =>
    coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="pt-28 pb-14 bg-zinc-950">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white uppercase mb-4">
              Find a Coach for{" "}
              <span className="text-primary">Where You Are</span>
            </h1>
            <p className="text-zinc-400 text-base mb-8 max-w-xl mx-auto">
              Every coach on Galoras has performed at the level you're trying to reach. No generic advice — only people who've been in the room.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search by name, specialty, or outcome..."
                className="pl-11 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 h-12 text-sm focus-visible:ring-primary rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Compass nudge */}
            <Link
              to="/compass"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-primary transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Not sure who you need? Let Compass match you
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <div className="bg-card border-y border-border sticky top-0 z-20">
        <div className="container-wide py-4">
          {/* Profile nudge — only if incomplete */}
          {!hasProfile && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <UserCircle2 className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                {isLoggedIn
                  ? "Complete your profile to see coaches matched to your goals."
                  : "Create a free profile to get personalized coach matches."}
              </p>
              <button
                onClick={() => navigate(isLoggedIn ? "/onboarding" : "/signup")}
                className="ml-auto text-xs font-bold text-primary hover:underline whitespace-nowrap"
              >
                {isLoggedIn ? "Complete profile →" : "Get started →"}
              </button>
            </div>
          )}

          {/* Filter pills — single row, scrollable */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Filter:</span>

            {/* Pillar pills */}
            {dbPillars.map(p => (
              <button key={p} onClick={() => setSelPillars(prev => toggle(prev, p))}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selPillars.includes(p)
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-white"
                }`}>
                {p}
              </button>
            ))}

            {/* Divider */}
            {dbPillars.length > 0 && dbTiers.length > 0 && (
              <div className="w-px h-5 bg-border shrink-0" />
            )}

            {/* Tier pills */}
            {dbTiers.map(t => (
              <button key={t} onClick={() => setSelTiers(prev => toggle(prev, t))}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                  selTiers.includes(t)
                    ? "bg-accent/15 border-accent/40 text-accent"
                    : "bg-card border-border text-muted-foreground hover:border-accent/30 hover:text-white"
                }`}>
                {t}
              </button>
            ))}

            {/* Divider */}
            {dbTiers.length > 0 && dbEngagementFormats.length > 0 && (
              <div className="w-px h-5 bg-border shrink-0" />
            )}

            {/* Engagement format pills */}
            {dbEngagementFormats.map(f => (
              <button key={f} onClick={() => setSelEngagementFormats(prev => toggle(prev, f))}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                  selEngagementFormats.includes(f)
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                    : "bg-card border-border text-muted-foreground hover:border-emerald-500/30 hover:text-white"
                }`}>
                {f === "in_person" ? "In-Person" : f}
              </button>
            ))}

            {/* Clear */}
            {activeFilterCount > 0 && (
              <>
                <div className="w-px h-5 bg-border shrink-0" />
                <button onClick={clearAllFilters} className="shrink-0 text-xs text-red-400 hover:text-red-300 font-medium">
                  Clear all ({activeFilterCount})
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Directory ── */}
      <section className="min-h-screen bg-background py-10 pb-24">
        <div className="container-wide">

          {/* Matched banner */}
          {matchedParam && (
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-2xl">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">
                Coaches matched to your context.
              </p>
              <button
                onClick={() => { clearAllFilters(); navigate("/coaching", { replace: true }); }}
                className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 whitespace-nowrap"
              >
                Clear match
              </button>
            </div>
          )}

          {/* Results count */}
          {!isLoading && !error && (
            <p className="text-xs text-zinc-600 mb-6">
              {filtered.length} coach{filtered.length !== 1 ? "es" : ""} available
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-zinc-500 text-sm">Loading coaches...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 text-sm">Failed to load coaches.</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-500 text-sm mb-4">No coaches match your filters.</p>
              <button
                onClick={clearAllFilters}
                className="text-primary text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((coach) => (
                <DirectoryCoachCard
                  key={coach.id}
                  coach={coach}
                  profilePath={coachProfilePath(coach)}
                  matchScore={matchScore(coach)}
                  hasMatches={!!hasMatches}
                  isLoggedIn={!!isLoggedIn}
                  coachTags={coachTagLookup[coach.id] || []}
                  compareList={compareList}
                  getConfig={getConfig}
                  onToggleCompare={toggleCompare}
                  onContact={(id, name) => setContactCoach({ id, name })}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {contactCoach && (
        <ContactModal
          coachId={contactCoach.id}
          coachName={contactCoach.name}
          onClose={() => setContactCoach(null)}
        />
      )}

      {/* ── Floating Compare Tray ── */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#0a1628] border border-amber-500/40 shadow-2xl shadow-black/60 backdrop-blur-sm">
            <GitCompareArrows className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-sm text-slate-300 font-medium">
              {compareList.length} coach{compareList.length !== 1 ? "es" : ""} selected
              {compareList.length < 2 && (
                <span className="text-slate-500 ml-1">(select at least 2)</span>
              )}
            </span>

            <button
              onClick={() => navigate(`/coaching/compare?ids=${compareList.join(",")}`)}
              disabled={compareList.length < 2}
              className="ml-2 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Compare
            </button>

            <button
              onClick={() => setCompareList([])}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
              title="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
