import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CoachCard } from "@/components/coaching/CoachCard";

export function FeaturedCoaches() {
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
        .order("created_at", { ascending: true })
        .limit(7);

      if (featuredError) throw featuredError;

      if ((featured?.length ?? 0) >= 7) return featured || [];

      const { data: approved, error: approvedError } = await supabase
        .from("coaches")
        .select(baseSelect)
        .eq("status", "approved")
        .order("created_at", { ascending: true })
        .limit(25);

      if (approvedError) throw approvedError;

      const featuredIds = new Set((featured || []).map((c) => c.id));
      const fillers = (approved || []).filter((c) => !featuredIds.has(c.id));

      return [...(featured || []), ...fillers].slice(0, 7);
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            Meet Our <span className="text-primary">Verified Coaches</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Elite professionals committed to growth, performance, and impact.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse"
              >
                <div className="h-56 md:h-64 bg-muted" />
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
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
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
          Meet Our <span className="text-primary">Verified Coaches</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Elite professionals committed to growth, performance, and impact.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCoaches.map((coach) => (
            <CoachCard
              key={coach.id}
              id={coach.id}
              displayName={coach.display_name}
              avatarUrl={coach.avatar_url}
              headline={coach.headline}
              specialties={coach.specialties}
              isFeatured={coach.is_featured}
              bio={coach.bio}
              location={coach.location}
              currentRole={coach.current_role}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
