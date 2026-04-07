import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarCheck,
  MessageCircle,
  Send,
  Sparkles,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ContactModal } from "@/components/coaching/ContactModal";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthGate } from "@/components/AuthGate";

type CompareCoach = {
  id: string;
  slug: string | null;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  positioning_statement: string | null;
  methodology: string | null;
  specialties: string[] | null;
  audience: string[] | null;
  avatar_url: string | null;
  booking_url: string | null;
  tier: string | null;
};

const DIMENSION_LABELS = [
  { key: "specialties",           label: "Core Ability" },
  { key: "audience",              label: "Ideal For" },
  { key: "methodology",           label: "Framework & Style" },
  { key: "positioning_statement", label: "Why This Coach" },
  { key: "booking_url",           label: "Availability" },
];

function tierColor(tier: string | null) {
  if (tier === "master") return "text-amber-400 border-amber-500/40 bg-amber-500/10";
  if (tier === "elite")  return "text-sky-400 border-sky-500/40 bg-sky-500/10";
  return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
}

export default function CoachCompare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [contactCoach, setContactCoach] = useState<{ id: string; name: string } | null>(null);

  const ids = (searchParams.get("ids") || "").split(",").filter(Boolean).slice(0, 3);

  const { data: coaches = [], isLoading } = useQuery({
    queryKey: ["compare-coaches", ids.join(",")],
    enabled: ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select(
          "id, slug, display_name, headline, bio, positioning_statement, methodology, specialties, audience, avatar_url, booking_url, tier"
        )
        .in("id", ids);
      if (error) throw error;
      // preserve original order
      return ids
        .map((id) => (data || []).find((c: CompareCoach) => c.id === id))
        .filter(Boolean) as CompareCoach[];
    },
  });

  const coachProfilePath = (c: CompareCoach) =>
    c.slug ? `/coach/${c.slug}` : `/coaching/${c.id}`;

  const colClass =
    coaches.length === 2
      ? "grid-cols-2"
      : coaches.length === 3
      ? "grid-cols-3"
      : "grid-cols-1 max-w-sm mx-auto";

  if (ids.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-400 mb-4">No coaches selected for comparison.</p>
            <Link to="/coaching" className="text-primary hover:underline text-sm">
              ← Back to directory
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#070d1a] text-white">

        {/* ── Header ── */}
        <div className="border-b border-[#1e3a5f] bg-[#0a1628]">
          <div className="container-wide py-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to coaches
            </button>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
                  Galoras Compass
                </p>
                <h1 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight text-white">
                  Coach{" "}
                  <span className="text-amber-400">Comparison</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Comparing {coaches.length} coach{coaches.length !== 1 ? "es" : ""} — side by side
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-300 max-w-[220px]">
                  Powered by Galoras Compass — matched to your context
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="container-wide py-10">
          {isLoading ? (
            <div className="text-center py-20 text-slate-500 text-sm">Loading coaches…</div>
          ) : (
            <>
              {/* ── Coach columns ── */}
              <div className={`grid ${colClass} gap-6 mb-10`}>
                {coaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="rounded-2xl border border-[#1e3a5f] bg-[#0d1f35] overflow-hidden flex flex-col"
                  >
                    {/* Photo */}
                    <Link to={coachProfilePath(coach)} className="relative block bg-[#0a1628]" style={{ height: 280 }}>
                      {coach.avatar_url ? (
                        <img
                          src={coach.avatar_url}
                          alt={coach.display_name || "Coach"}
                          className="w-full h-full object-contain object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-7xl font-bold text-slate-700">
                            {(coach.display_name || "C").charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f35]/90 via-transparent to-transparent" />
                    </Link>

                    {/* Identity */}
                    <div className="px-5 pt-4 pb-3 border-b border-[#1e3a5f]">
                      <Link to={coachProfilePath(coach)}>
                        <h2 className="text-lg font-black text-white hover:text-amber-400 transition-colors leading-tight">
                          {coach.display_name || "Coach"}
                        </h2>
                      </Link>
                      {coach.headline && (
                        <p className="text-slate-400 text-sm mt-0.5 line-clamp-2">{coach.headline}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {coach.tier && (
                          <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold capitalize ${tierColor(coach.tier)}`}>
                            {coach.tier}
                          </span>
                        )}
                        {(coach.specialties || []).slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-400 text-xs capitalize bg-amber-500/5"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div className="px-5 py-4 flex-1 space-y-4">

                      {/* Why This Coach */}
                      <div>
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
                          Why This Coach
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
                          {coach.positioning_statement || coach.bio || "—"}
                        </p>
                      </div>

                      {/* Core Ability */}
                      {coach.specialties && coach.specialties.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Core Ability
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {coach.specialties.map((s) => (
                              <span
                                key={s}
                                className="flex items-center gap-1 text-xs text-slate-300 bg-[#1a2f4a] border border-[#2a4a6f] px-2 py-0.5 rounded-full capitalize"
                              >
                                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ideal For */}
                      {coach.audience && coach.audience.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Ideal For
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {coach.audience.map((a) => (
                              <span
                                key={a}
                                className="text-xs text-slate-400 bg-[#1a2f4a] border border-[#2a4a6f] px-2 py-0.5 rounded-full"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Framework & Style */}
                      {coach.methodology && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                            Framework & Style
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                            {coach.methodology}
                          </p>
                        </div>
                      )}

                      {/* Availability */}
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Availability
                        </p>
                        {coach.booking_url ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <Globe className="h-3 w-3" />
                            Bookings open
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">Contact to arrange</span>
                        )}
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="px-5 py-4 border-t border-[#1e3a5f] space-y-2">
                      <Link to={coachProfilePath(coach)} className="block">
                        <Button className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm h-11 gap-2">
                          <CalendarCheck className="h-4 w-4" />
                          Book Intro Call
                        </Button>
                      </Link>

                      <div className="grid grid-cols-2 gap-2">
                        <AuthGate isLoggedIn={isLoggedIn} message="Sign in to message coaches">
                          <button
                            onClick={() =>
                              setContactCoach({ id: coach.id, name: coach.display_name || "Coach" })
                            }
                            className="flex items-center justify-center gap-1.5 h-9 rounded-lg border border-[#2a4a6f] text-slate-400 hover:border-amber-500/50 hover:text-amber-400 transition-colors text-xs font-semibold"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            Message
                          </button>
                        </AuthGate>

                        <Link to={coachProfilePath(coach)}>
                          <button className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg border border-[#2a4a6f] text-slate-400 hover:border-amber-500/50 hover:text-amber-400 transition-colors text-xs font-semibold">
                            <Send className="h-3.5 w-3.5" />
                            Proposal
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Compass Powers sidebar note ── */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 max-w-sm mx-auto text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <p className="text-sm font-black text-amber-400 uppercase tracking-wider">
                    Galoras Compass Powers
                  </p>
                </div>
                <ul className="space-y-1.5 text-sm text-slate-300 text-left">
                  {[
                    "Matching Logic",
                    "Why Explanation Layer",
                    "Profile Comparison",
                    "Controlled Selection",
                    "Behavioural Analytics",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {contactCoach && (
        <ContactModal
          coachId={contactCoach.id}
          coachName={contactCoach.name}
          onClose={() => setContactCoach(null)}
        />
      )}
    </Layout>
  );
}
