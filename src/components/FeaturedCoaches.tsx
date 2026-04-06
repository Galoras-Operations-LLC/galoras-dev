import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type FeaturedCoach = {
  id: string;
  slug: string | null;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  current_role: string | null;
};

export function FeaturedCoaches() {
  const navigate = useNavigate();

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["featured-coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, slug, display_name, avatar_url, headline, current_role")
        .eq("lifecycle_status", "published")
        .eq("is_featured", true)
        .order("display_name", { ascending: true });

      if (error) throw error;
      return (data || []) as FeaturedCoach[];
    },
  });

  if (isLoading || !coaches || coaches.length === 0) return null;

  const handleClick = (coach: FeaturedCoach) => {
    const path = coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`;
    navigate(path);
  };

  return (
    <section className="py-16 bg-zinc-950">
      <div className="container-wide">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Featured <span className="text-gradient">Coaches</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Curated leaders selected by Galoras.
          </p>
        </div>

        <div className="flex items-end justify-center gap-0">
          {coaches.map((coach, i) => (
            <button
              key={coach.id}
              onClick={() => handleClick(coach)}
              className="group relative flex-1 max-w-[280px] min-w-[160px] cursor-pointer focus:outline-none"
              style={{ marginLeft: i > 0 ? "-96px" : 0 }}
              aria-label={`View ${coach.display_name || "coach"} profile`}
            >
              <div className="relative overflow-hidden">
                {coach.avatar_url ? (
                  <img
                    src={coach.avatar_url}
                    alt={coach.display_name || "Coach"}
                    className="w-full h-[420px] object-cover transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105"
                    style={
                      coach.display_name === "Barnes Lam"
                        ? { objectPosition: "center 96px" }
                        : { objectPosition: "top", transform: "scale(1.2)", transformOrigin: "top center" }
                    }
                  />
                ) : (
                  <div className="w-full h-[420px] bg-zinc-800 flex items-center justify-center">
                    <span className="text-7xl font-bold text-zinc-500">
                      {(coach.display_name || "C").charAt(0)}
                    </span>
                  </div>
                )}

                {/* Dark gradient at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* Name + role — revealed on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <p className="text-white font-semibold text-sm leading-tight">
                    {coach.display_name}
                  </p>
                  {(coach.current_role || coach.headline) && (
                    <p className="text-zinc-300 text-xs mt-0.5 line-clamp-1">
                      {coach.current_role || coach.headline}
                    </p>
                  )}
                  <p className="text-primary text-xs mt-1 font-medium">
                    View Profile →
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
