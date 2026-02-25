import { useState } from "react";
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

  if (isLoading) {
    return (
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            Meet Our <span className="text-primary">Verified Coaches</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-muted animate-pulse"
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

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
          Meet Our <span className="text-primary">Verified Coaches</span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCoaches.map((coach) => (
            <div
              key={coach.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer"
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
