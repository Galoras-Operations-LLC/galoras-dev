import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Sparkles, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type PublicCoach = {
  id: string;
  slug: string | null;
  display_name: string | null;
  headline: string | null;
  bio: string | null;
  specialties: string[] | null;
  avatar_url: string | null;
};

type RankedCoach = PublicCoach & {
  score: number;
};

const contextKeywords: Record<string, string[]> = {
  scaling: ["scaling", "growth", "execution", "leadership", "scale"],
  transition: ["transition", "change", "career", "shift", "next stage"],
  performance: ["performance", "pressure", "execution", "results", "focus"],
  leadership: ["leadership", "team", "executive", "management", "influence"],
};

const contextLabels: Record<string, string> = {
  scaling: "Scaling business",
  transition: "Career transition",
  performance: "Performance pressure",
  leadership: "Leadership challenge",
};

export default function CoachingDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const context = searchParams.get("context");

  const {
    data: coaches,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-coaches-simple"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, slug, display_name, headline, bio, specialties, avatar_url")
        .eq("lifecycle_status", "published")
        .order("display_name", { ascending: true });

      if (error) throw error;
      return (data || []) as PublicCoach[];
    },
  });

  const rankedCoaches: RankedCoach[] =
    coaches
      ?.map((coach) => {
        let score = 0;

        const searchableText = [coach.display_name || "", coach.headline || "", coach.bio || ""]
          .join(" ")
          .toLowerCase();

        if (searchQuery && searchableText.includes(searchQuery.toLowerCase())) {
          score += 1;
        }

        if (context) {
          const keywords = contextKeywords[context] || [context];
          const matchCount = keywords.filter((keyword) => searchableText.includes(keyword.toLowerCase())).length;
          score += matchCount * 2;
        }

        return { ...coach, score };
      })
      .sort((a, b) => b.score - a.score) || [];

  const filteredCoaches: RankedCoach[] =
    rankedCoaches.filter((coach) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchableText = [coach.display_name || "", coach.headline || "", coach.bio || ""]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(q);
      }
      return true;
    }) || [];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1920&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />

        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border
  border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <Users className="h-4 w-4" />
              Coaching Exchange
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Explore <span className="text-gradient">Execution-Ready</span> Coaches
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Coaches in this exchange are surfaced based on demonstrated execution experience, deployability, and
              real-world performance.
            </p>

            <div className="flex flex-col items-center gap-3">
              {!context && (
                <Link to="/coaching/matching">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Begin Performance Context Mapping
                  </Button>
                </Link>
              )}

              {context && (
                <div
                  className="inline-flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-6
   py-3 text-sm text-primary"
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="text-muted-foreground">Showing coaches for</span>
                  <span className="font-semibold text-primary">{contextLabels[context] || context}</span>
                </div>
              )}

              {context && (
                <Link to="/coaching/matching">
                  <Button variant="ghost" size="sm">
                    Change Context
                  </Button>
                </Link>
              )}

              <p className="text-sm text-muted-foreground">
                AI supports the selection process — it does not replace performance evaluation.
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by coach, challenge, or operating context..."
                  className="pl-10 h-12 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coach list */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          <div className="mt-4 mb-8 text-center">
            <h2 className="text-3xl md:text-[40px] font-bold tracking-tight text-foreground text-center">
              Published <span className="text-gradient">Coaches</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Only approved and published coaches appear here.</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading coaches...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">Failed to load coaches.</div>
          ) : filteredCoaches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCoaches.map((coach) => (
                <div key={coach.id} className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-2xl font-semibold">{coach.display_name || "Unnamed Coach"}</h3>
                    {context && coach.score >= 4 && (
                      <div
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 border
  border-primary/20 px-3 py-1 text-xs font-medium text-primary shrink-0"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Best Match
                      </div>
                    )}
                  </div>

                  <p className="text-primary font-medium mb-4">{coach.headline || "No headline yet"}</p>

                  <p className="text-muted-foreground mb-4 line-clamp-4">
                    {coach.bio || "Profile details coming soon."}
                  </p>

                  <Link to={coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`}>
                    <Button variant="outline" className="w-full">
                      View Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">No Coaches Found</h3>
              <p className="text-muted-foreground mb-6">No approved and published coaches match the current search.</p>
              <Link to="/coaching/matching">
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try AI Matching
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
