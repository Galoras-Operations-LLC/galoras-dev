import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, Sparkles, UserCircle2, ArrowRight, CalendarCheck, GitCompareArrows, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContactModal } from "@/components/coaching/ContactModal";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/hooks/useAuth";

type PublicCoach = {
  id: string;
  slug: string | null;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  specialties: string[] | null;
  audience: string[] | null;
  avatar_url: string | null;
  booking_url: string | null;
  tier: string | null;
};

const FILTER_ALL = "All";

const goalFilters = [
  { label: "All Coaches", value: FILTER_ALL },
  { label: "Leading a Team", value: "leadership" },
  { label: "Career Change", value: "career" },
  { label: "Managing Pressure", value: "performance" },
  { label: "Mental Resilience", value: "mindset" },
  { label: "Executive Presence", value: "communication" },
  { label: "Making a Move", value: "transitions" },
];

export default function CoachingDirectory() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  const categoryParam = searchParams.get("category");
  const matchedParam = searchParams.get("matched") === "1";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(
    filterParam && goalFilters.some(f => f.value === filterParam) ? filterParam : FILTER_ALL
  );
  const [contactCoach, setContactCoach] = useState<{ id: string; name: string } | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const { isLoggedIn, profile } = useAuth();
  const navigate = useNavigate();

  const toggleCompare = (id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, id];
    });
  };

  const { data: coaches, isLoading, error } = useQuery({
    queryKey: ["public-coaches-directory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, slug, display_name, headline, bio, specialties, audience, avatar_url, booking_url, tier")
        .eq("lifecycle_status", "published")
        .order("display_name", { ascending: true });

      if (error) throw error;
      return (data || []) as PublicCoach[];
    },
  });

  const matchScore = (coach: PublicCoach): number => {
    if (!profile?.coaching_areas || profile.coaching_areas.length === 0) return 0;
    const userAreas = profile.coaching_areas.map((a) => a.toLowerCase());
    return (coach.specialties || []).filter((s) =>
      userAreas.includes(s.toLowerCase())
    ).length;
  };

  const filtered = (coaches || [])
    .filter((coach) => {
      const text = [coach.display_name, coach.headline, coach.bio, ...(coach.specialties || [])]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === FILTER_ALL ||
        (coach.specialties || []).some((s) => s.toLowerCase() === activeFilter.toLowerCase());
      const matchesCategory =
        !categoryParam ||
        (coach.specialties || []).some((s) =>
          s.toLowerCase().includes(categoryParam.toLowerCase())
        );
      return matchesSearch && matchesFilter && matchesCategory;
    })
    .sort((a, b) => matchScore(b) - matchScore(a));

  const hasProfile = isLoggedIn && profile?.onboarding_complete;
  const hasMatches = isLoggedIn && profile?.coaching_areas && profile.coaching_areas.length > 0;

  const coachProfilePath = (coach: PublicCoach) =>
    coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`;

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
                placeholder="Search by name, goal, or specialty..."
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

      {/* ── Trust bar ── */}
      <div className="bg-zinc-900 border-y border-zinc-800">
        <div className="container-wide py-3">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-xs text-zinc-500">
            <span>Vetted by Galoras</span>
            <span className="text-zinc-700">·</span>
            <span>Matched to your goals</span>
            <span className="text-zinc-700">·</span>
            <span>Real-world execution experience</span>
            <span className="text-zinc-700">·</span>
            <span>Book directly — no gatekeeping</span>
          </div>
        </div>
      </div>

      {/* ── Directory ── */}
      <section className="min-h-screen bg-zinc-950 py-10 pb-24">
        <div className="container-wide">

          {/* Profile nudge */}
          {!hasProfile && (
            <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-primary/5 border border-primary/20 max-w-2xl mx-auto">
              <UserCircle2 className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm text-zinc-300">
                {isLoggedIn
                  ? "Complete your profile to see coaches matched to your goals."
                  : "Create a free profile to see coaches matched to your goals."}
              </p>
              <button
                onClick={() => navigate(isLoggedIn ? "/onboarding" : "/signup")}
                className="ml-auto text-xs font-semibold text-primary hover:underline whitespace-nowrap"
              >
                {isLoggedIn ? "Complete profile →" : "Get started →"}
              </button>
            </div>
          )}

          {/* Matched banner */}
          {matchedParam && (
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-2xl">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">
                Coaches matched to your context.
                {activeFilter !== FILTER_ALL && (
                  <> Showing <span className="font-semibold">{goalFilters.find(f => f.value === activeFilter)?.label}</span> coaches.</>
                )}
              </p>
              <button
                onClick={() => { setActiveFilter(FILTER_ALL); navigate("/coaching", { replace: true }); }}
                className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 whitespace-nowrap"
              >
                Clear match
              </button>
            </div>
          )}

          {/* Goal filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {goalFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeFilter === f.value
                    ? "bg-primary border-primary text-zinc-950"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!isLoading && !error && (
            <p className="text-xs text-zinc-600 mb-6">
              {filtered.length} coach{filtered.length !== 1 ? "es" : ""} available
              {activeFilter !== FILTER_ALL ? ` · ${goalFilters.find(f => f.value === activeFilter)?.label}` : ""}
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-zinc-500 text-sm">Loading coaches...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-400 text-sm">Failed to load coaches.</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-500 text-sm mb-4">No coaches match your search.</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveFilter(FILTER_ALL); }}
                className="text-primary text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((coach) => {
                const score = matchScore(coach);
                const profilePath = coachProfilePath(coach);

                return (
                  <div
                    key={coach.id}
                    className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-primary/40 transition-all duration-200 flex flex-col"
                  >
                    {/* Photo */}
                    <Link to={profilePath} className="relative bg-zinc-800 block" style={{ height: "260px" }}>
                      {coach.avatar_url ? (
                        <img
                          src={coach.avatar_url}
                          alt={coach.display_name || "Coach"}
                          className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl font-bold text-zinc-600">
                            {(coach.display_name || "C").charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />

                      {/* Match badge */}
                      {hasMatches && score > 0 && (
                        <div className="absolute top-3 right-3">
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                            <Sparkles className="h-3 w-3" />
                            Matched
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <Link to={profilePath}>
                        <h3 className="text-base font-bold text-white leading-tight mb-1 hover:text-primary transition-colors">
                          {coach.display_name || "Coach"}
                        </h3>
                      </Link>

                      {coach.headline && (
                        <p className="text-zinc-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                          {coach.headline}
                        </p>
                      )}

                      {/* Specialty tags */}
                      {coach.specialties && coach.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {coach.specialties.slice(0, 2).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-500 text-xs capitalize"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTAs */}
                      <div className="flex gap-2 mt-auto pt-3 border-t border-zinc-800">
                        <Link to={profilePath} className="flex-1">
                          <Button className="w-full bg-primary hover:bg-primary/90 text-zinc-950 text-xs font-bold h-9 rounded-lg gap-1.5">
                            <CalendarCheck className="h-3.5 w-3.5" />
                            Book Intro Call
                          </Button>
                        </Link>

                        <button
                          onClick={() => toggleCompare(coach.id)}
                          title={compareList.includes(coach.id) ? "Remove from compare" : "Add to compare"}
                          className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
                            compareList.includes(coach.id)
                              ? "border-amber-500 bg-amber-500/10 text-amber-400"
                              : "border-zinc-700 text-zinc-400 hover:border-amber-500/50 hover:text-amber-400"
                          }`}
                        >
                          <GitCompareArrows className="h-3.5 w-3.5" />
                        </button>

                        <AuthGate isLoggedIn={isLoggedIn} message="Sign in to message coaches">
                          <button
                            onClick={() =>
                              setContactCoach({ id: coach.id, name: coach.display_name || "Coach" })
                            }
                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-700 text-zinc-400 hover:border-primary/50 hover:text-primary transition-colors"
                            title="Send a message"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                        </AuthGate>
                      </div>
                    </div>
                  </div>
                );
              })}
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
