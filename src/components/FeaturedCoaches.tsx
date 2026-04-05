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
    <section className="bg-black">
      {/* Heading */}
      <div className="text-center py-8">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
          Featured Coaches
        </h2>
      </div>

      {/* Full-width portrait strip */}
      <div className="flex w-full" style={{ height: "520px" }}>
        {coaches.map((coach) => (
          <button
            key={coach.id}
            onClick={() => handleClick(coach)}
            className="group relative flex-1 overflow-hidden cursor-pointer focus:outline-none"
            aria-label={`View ${coach.display_name || "coach"} profile`}
          >
            {coach.avatar_url ? (
              <img
                src={coach.avatar_url}
                alt={coach.display_name || "Coach"}
                className="w-full h-full object-cover object-top grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center grayscale">
                <span className="text-7xl font-bold text-zinc-500">
                  {(coach.display_name || "C").charAt(0)}
                </span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            {/* Name — revealed on hover */}
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
          </button>
        ))}
      </div>
    </section>
  );
}
