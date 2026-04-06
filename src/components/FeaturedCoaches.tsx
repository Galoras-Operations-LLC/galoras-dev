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
      <div className="text-center pt-10 pb-6">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
          Featured Coaches
        </h2>
      </div>

      {/* Full-width portrait strip with shared background illusion */}
      <div className="relative flex w-full" style={{ height: "560px", background: "#000" }}>
        {coaches.map((coach, i) => (
          <button
            key={coach.id}
            onClick={() => handleClick(coach)}
            className="group relative flex-1 overflow-hidden cursor-pointer focus:outline-none"
            aria-label={`View ${coach.display_name || "coach"} profile`}
          >
            {/* Coach photo */}
            {coach.avatar_url ? (
              <img
                src={coach.avatar_url}
                alt={coach.display_name || "Coach"}
                className="w-full h-full object-cover object-top grayscale transition-all duration-500 group-hover:grayscale-0"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <span className="text-7xl font-bold text-zinc-700">
                  {(coach.display_name || "C").charAt(0)}
                </span>
              </div>
            )}

            {/* Top fade — blends photo background into black */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black via-black/70 to-transparent pointer-events-none" />

            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

            {/* Left edge fade — first coach gets heavier left fade */}
            <div
              className="absolute inset-y-0 left-0 w-16 pointer-events-none"
              style={{
                background: i === 0
                  ? "linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0))"
                  : "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0))",
              }}
            />

            {/* Right edge fade — last coach gets heavier right fade */}
            <div
              className="absolute inset-y-0 right-0 w-16 pointer-events-none"
              style={{
                background: i === coaches.length - 1
                  ? "linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))"
                  : "linear-gradient(to left, rgba(0,0,0,0.6), rgba(0,0,0,0))",
              }}
            />

            {/* Name — revealed on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <p className="text-white font-semibold text-sm leading-tight">
                {coach.display_name}
              </p>
              {(coach.current_role || coach.headline) && (
                <p className="text-zinc-400 text-xs mt-0.5 line-clamp-1">
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
