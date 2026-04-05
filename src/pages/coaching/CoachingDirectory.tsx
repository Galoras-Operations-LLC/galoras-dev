import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Build filter tabs from all unique specialties
  const allSpecialties = Array.from(
    new Set(
      (coaches || []).flatMap((c) => c.specialties || [])
    )
  ).sort();

  const filterTabs = [FILTER_ALL, ...allSpecialties];

  // Apply search + filter
  const filtered = (coaches || []).filter((coach) => {
    const text = [coach.display_name, coach.headline, coach.bio, ...(coach.specialties || [])]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === FILTER_ALL ||
      (coach.specialties || []).some(
        (s) => s.toLowerCase() === activeFilter.toLowerCase()
      );
    const matchesCategory =
      !categoryParam ||
      (coach.specialties || []).some(
        (s) => s.toLowerCase().includes(categoryParam.toLowerCase())
      );

    return matchesSearch && matchesFilter && matchesCategory;
  });

  // Primary category label for badge (first specialty or tier)
  const categoryLabel = (coach: PublicCoach) => {
    if (coach.specialties && coach.specialties.length > 0) return coach.specialties[0];
    if (coach.tier) return `${coach.tier.charAt(0).toUpperCase()}${coach.tier.slice(1)} Tier`;
    return "Executive Coaching";
  };

  return (
    <Layout>
      <section className="min-h-screen bg-zinc-950 pt-28 pb-20">
        <div className="container-wide">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Find a Coach
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              Execution-ready coaches surfaced by demonstrated performance — not polished profiles.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search coaches, specialties..."
              className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="text-center py-16 text-zinc-400">Loading coaches...</div>
          ) : error ? (
            <div className="text-center py-16 text-red-400">Failed to load coaches.</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">No coaches match your search.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((coach) => (
                <div
                  key={coach.id}
                  className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 flex flex-col"
                >
                  {/* Photo */}
                  <div className="relative" style={{ height: "260px" }}>
                    {coach.avatar_url ? (
                      <img
                        src={coach.avatar_url}
                        alt={coach.display_name || "Coach"}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <span className="text-6xl font-bold text-zinc-600">
                          {(coach.display_name || "C").charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category badge */}
                  <div className="bg-yellow-400 px-4 py-2">
                    <span className="text-black text-sm font-bold">{categoryLabel(coach)}</span>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {coach.display_name || "Coach"}
                    </h3>

                    {coach.headline && (
                      <p className="text-zinc-400 text-sm mb-3 line-clamp-1">{coach.headline}</p>
                    )}

                    {/* Specialty tags */}
                    {coach.specialties && coach.specialties.length > 1 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {coach.specialties.slice(1, 4).map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-0.5 rounded-full border border-zinc-700 text-zinc-300 text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2 mt-auto pt-4">
                      <Link
                        to={coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`}
                        className="flex-1"
                      >
                        <Button className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold border-0">
                          View Profile
                        </Button>
                      </Link>

                      {coach.booking_url ? (
                        <a href={coach.booking_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                            Book
                          </Button>
                        </a>
                      ) : (
                        <Button variant="outline" className="border-zinc-700 text-zinc-500" disabled>
                          Book
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
