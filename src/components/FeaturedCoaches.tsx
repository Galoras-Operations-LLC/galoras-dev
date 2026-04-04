import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CoachCard } from "@/components/coaching/CoachCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type FeaturedCoach = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  specialties: string[] | null;
  is_featured: boolean | null;
  bio: string | null;
  location: string | null;
  current_role: string | null;
};

export function FeaturedCoaches() {
  const [selectedCoach, setSelectedCoach] = useState<FeaturedCoach | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const { data: featuredCoaches, isLoading } = useQuery({
    queryKey: ["featured-coaches"],
    queryFn: async () => {
      const baseSelect =
        "id, display_name, avatar_url, headline, specialties, is_featured, bio, location, current_role";

      const { data: featured, error: featuredError } = await (supabase
        .from("coaches")
        .select(baseSelect) as any)
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("featured_at", { ascending: false });

      if (featuredError) throw featuredError;

      return (featured || []) as FeaturedCoach[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-14 md:py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-foreground text-center">
            <span className="text-gradient">Featured</span> Coaches
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-center mb-10">
            Curated leaders selected by Galoras.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-3xl bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredCoaches || featuredCoaches.length === 0) {
    return null;
  }

  const PAGE_SIZE = 4;
  const maxPage = Math.ceil(featuredCoaches.length / PAGE_SIZE) - 1;
  const showControls = featuredCoaches.length > PAGE_SIZE;

  const start = pageIndex * PAGE_SIZE;
  const sliced = featuredCoaches.slice(start, start + PAGE_SIZE);
  // Fill remaining slots from beginning without duplicates
  const visibleCoaches: FeaturedCoach[] = [...sliced];
  if (visibleCoaches.length < PAGE_SIZE) {
    const ids = new Set(visibleCoaches.map((c) => c.id));
    for (const coach of featuredCoaches) {
      if (visibleCoaches.length >= PAGE_SIZE) break;
      if (!ids.has(coach.id)) {
        visibleCoaches.push(coach);
        ids.add(coach.id);
      }
    }
  }

  const prevPage = () => setPageIndex((p) => (p <= 0 ? maxPage : p - 1));
  const nextPage = () => setPageIndex((p) => (p >= maxPage ? 0 : p + 1));

  return (
    <section className="py-14 md:py-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex-1" />
          <div className="text-center">
            <h2 className="text-3xl md:text-[42px] font-bold tracking-tight text-foreground">
              <span className="text-gradient">Featured</span> Coaches
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Curated leaders selected by Galoras.
            </p>
          </div>
          <div className="flex-1 flex justify-end gap-2">
            {showControls && (
              <>
                <Button variant="ghost" size="icon" onClick={prevPage} aria-label="Previous coaches">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextPage} aria-label="Next coaches">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-center">
        <div className={cn(
          "grid gap-6",
          visibleCoaches.length === 1 && "grid-cols-1 max-w-xs",
          visibleCoaches.length === 2 && "grid-cols-2 max-w-2xl",
          visibleCoaches.length === 3 && "grid-cols-3 max-w-4xl",
          visibleCoaches.length >= 4 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full"
        )}>
          {visibleCoaches.map((coach, idx) => (
            <div
              key={`${coach.id}-${idx}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-3xl cursor-pointer border border-white/10 bg-white/5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5"
              onClick={() => setSelectedCoach(coach)}
            >
              {coach.avatar_url ? (
                <img
                  src={coach.avatar_url}
                  alt={coach.display_name || "Coach"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center">
                  <span className="text-5xl font-bold text-muted-foreground/40">
                    {(coach.display_name || "C").charAt(0)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>

        <div className="mx-auto mt-12 md:mt-14 h-px w-2/3 bg-white/10" />
      </div>

      <Dialog
        open={selectedCoach !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCoach(null);
        }}
      >
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedCoach?.display_name || "Coach Preview"}
          </DialogTitle>
          {selectedCoach && (
            <>
              <CoachCard
                variant="static"
                id={selectedCoach.id}
                displayName={selectedCoach.display_name}
                avatarUrl={selectedCoach.avatar_url}
                headline={selectedCoach.headline}
                specialties={selectedCoach.specialties}
                isFeatured={selectedCoach.is_featured}
                bio={selectedCoach.bio}
                location={selectedCoach.location}
                currentRole={selectedCoach.current_role}
              />
              <div className="p-4 pt-0">
                <Link to={`/coaching/${selectedCoach.id}`} className="block">
                  <Button className="w-full">View Full Profile</Button>
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
