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

const SECTION_H = 680;  // px — section height
const OVERLAP   = 210;  // px — how much each coach overlaps the previous

// Per-coach image scale overrides to compensate for different photo crops
// (e.g. Barnes is a portrait/chest-up shot, Conor/Mitesh are full-body standing)
const SCALE_OVERRIDES: Record<string, number> = {
  "Barnes Lam": 2.0,
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

  const n = coaches.length;

  return (
    <section
      style={{
        background: "linear-gradient(to bottom, #b8b8b8 0%, #787878 55%, #1e1e1e 100%)",
      }}
    >
      {/* Heading */}
      <div className="text-center pt-10 pb-6">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white drop-shadow">
          Featured Coaches
        </h2>
      </div>

      {/* Strip — each coach gets an equal-width slot, overlapping */}
      <div
        className="flex items-end justify-center overflow-hidden"
        style={{ height: `${SECTION_H}px` }}
      >
        {coaches.map((coach, i) => {
          const mid = (n - 1) / 2;
          const dist = Math.abs(i - mid);
          const zIndex = Math.round(n * 4 - dist * 2);

          return (
            <button
              key={coach.id}
              onClick={() =>
                navigate(coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`)
              }
              className="group relative flex-shrink-0 cursor-pointer focus:outline-none"
              style={{
                // All slots exactly the same width → equal frame for every coach
                width: `calc(${100 / n}% + ${(OVERLAP * (n - 1)) / n}px)`,
                height: `${SECTION_H}px`,
                marginLeft: i > 0 ? `-${OVERLAP}px` : 0,
                zIndex,
              }}
              aria-label={`View ${coach.display_name || "coach"} profile`}
            >
              {coach.avatar_url ? (
                <img
                  src={coach.avatar_url}
                  alt={coach.display_name || "Coach"}
                  className="w-full h-full"
                  style={{
                    objectFit: "contain",
                    objectPosition: "bottom center",
                    filter: "grayscale(1)",
                    transition: "filter 0.4s ease",
                    transform: `scale(${SCALE_OVERRIDES[coach.display_name || ""] ?? 1})`,
                    transformOrigin: "bottom center",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.filter = "grayscale(0)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.filter = "grayscale(1)")
                  }
                />
              ) : (
                <div className="w-full h-full flex items-end justify-center pb-12">
                  <span className="text-7xl font-bold text-zinc-500">
                    {(coach.display_name || "C").charAt(0)}
                  </span>
                </div>
              )}

              {/* Bottom fade */}
              <div
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{
                  height: "120px",
                  background: "linear-gradient(to top, #1e1e1e 0%, transparent 100%)",
                }}
              />

              {/* Name on hover */}
              <div className="absolute bottom-8 left-0 right-0 text-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none px-3">
                <p className="text-white font-semibold text-sm drop-shadow-lg">
                  {coach.display_name}
                </p>
                {(coach.current_role || coach.headline) && (
                  <p className="text-zinc-300 text-xs mt-0.5 line-clamp-1 drop-shadow">
                    {coach.current_role || coach.headline}
                  </p>
                )}
                <p className="text-primary text-xs mt-1 font-medium">View Profile →</p>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ height: "40px", background: "#1e1e1e" }} />
    </section>
  );
}
