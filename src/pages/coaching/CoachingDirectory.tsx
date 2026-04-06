import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContactModal } from "@/components/coaching/ContactModal";

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

export default function CoachingDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [contactCoach, setContactCoach] = useState<{ id: string; name: string } | null>(null);

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

  const allSpecialties = Array.from(
    new Set((coaches || []).flatMap((c) => c.specialties || []))
  ).sort();

  const filterTabs = [FILTER_ALL, ...allSpecialties];

  const filtered = (coaches || []).filter((coach) => {
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
  });

  const primarySpecialty = (coach: PublicCoach) => {
    if (coach.specialties && coach.specialties.length > 0) return coach.specialties[0];
    if (coach.tier) return `${coach.tier.charAt(0).toUpperCase()}${coach.tier.slice(1)} Tier`;
    return "Coaching";
  };

  return (
    <Layout>
      {/* Page header */}
      <section className="pt-28 pb-12 bg-zinc-950 border-b border-zinc-800">
        <div className="container-wide">
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white uppercase mb-3">
            Coaching <span className="text-primary">Exchange</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-2xl mb-8">
            Execution-ready coaches surfaced by demonstrated performance — not polished profiles.
          </p>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search coaches, specialties..."
              className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 h-11 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="min-h-screen bg-zinc-950 py-10 pb-20">
        <div className="container-wide">
          {/* Filter tabs */}
          {filterTabs.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    activeFilter === tab
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-zinc-500">Loading coaches...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">Failed to load coaches.</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">No coaches match your search.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((coach) => (
                <div
                  key={coach.id}
                  className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-primary/40 transition-colors flex flex-col"
                >
                  {/* Photo */}
                  <div className="relative bg-zinc-800" style={{ height: "240px" }}>
                    {coach.avatar_url ? (
                      <img
                        src={coach.avatar_url}
                        alt={coach.display_name || "Coach"}
                        className="w-full h-full object-contain object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-bold text-zinc-600">
                          {(coach.display_name || "C").charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Specialty badge — top left */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30 backdrop-blur-sm">
                        {primarySpecialty(coach)}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-white leading-tight mb-0.5">
                      {coach.display_name || "Coach"}
                    </h3>

                    {coach.headline && (
                      <p className="text-zinc-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                        {coach.headline}
                      </p>
                    )}

                    {/* Extra specialties */}
                    {coach.specialties && coach.specialties.length > 1 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {coach.specialties.slice(1, 3).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-500 text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2 mt-auto pt-3 border-t border-zinc-800">
                      <Link
                        to={coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`}
                        className="flex-1"
                      >
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-8 rounded-lg">
                          View Profile
                        </Button>
                      </Link>

                      <button
                        onClick={() =>
                          setContactCoach({ id: coach.id, name: coach.display_name || "Coach" })
                        }
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-primary/50 text-primary hover:bg-primary/10 transition-colors"
                        title="Send a message"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
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
    </Layout>
  );
}
