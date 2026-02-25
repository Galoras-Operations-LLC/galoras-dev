import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CoachCard } from "@/components/coaching/CoachCard";
import { Button } from "@/components/ui/button";
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
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);

  // Responsive visible count
  useEffect(() => {
    const lgQuery = window.matchMedia("(min-width: 1024px)");
    const mdQuery = window.matchMedia("(min-width: 768px)");

    const update = () => {
      if (lgQuery.matches) setVisibleCount(4);
      else if (mdQuery.matches) setVisibleCount(3);
      else setVisibleCount(2);
    };

    update();
    lgQuery.addEventListener("change", update);
    mdQuery.addEventListener("change", update);
    return () => {
      lgQuery.removeEventListener("change", update);
      mdQuery.removeEventListener("change", update);
    };
  }, []);

  const { data: featuredCoaches, isLoading } = useQuery({
    queryKey: ["featured-coaches"],
    queryFn: async () => {
      const baseSelect =
        "id, display_name, avatar_url, headline, specialties, is_featured, bio, location, current_role";

      const { data: featured, error: featuredError } = await supabase
        .from("coaches")
        .select(baseSelect)
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("featured_at", { ascending: false });

      if (featuredError) throw featuredError;

      return featured || [];
    },
  });

  // Auto-rotate timer
  useEffect(() => {
    if (!featuredCoaches || featuredCoaches.length === 0) return;
    if (selectedCoach !== null) return;

    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + visibleCount) % featuredCoaches.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedCoach, visibleCount, featuredCoaches]);

  if (isLoading) {
    return (
      <section className="py-14 md:py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center">
            Featured Coaches
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

  const visibleCoaches: FeaturedCoach[] = [];
  for (let i = 0; i < visibleCount; i++) {
    visibleCoaches.push(featuredCoaches[(startIndex + i) % featuredCoaches.length]);
  }

  return (
    <section className="py-14 md:py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center">
          Featured Coaches
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center mb-10">
          Curated leaders selected by Galoras.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
