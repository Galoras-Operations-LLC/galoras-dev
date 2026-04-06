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

// Z-order and horizontal positioning for overlapping cutout effect
// Centre coach is frontmost and largest; outer coaches recede behind
function getLayout(index: number, total: number) {
  if (total === 1) return { left: "25%", width: "50%", zIndex: 2, scale: 1 };

  // For N coaches, spread them so they overlap ~30%
  const slotWidth = 100 / total;
  const cardWidth = slotWidth * 1.55; // wider than slot → overlapping
  const left = slotWidth * index - (cardWidth - slotWidth) / 2;

  // Centre coach pops forward, edges recede
  const mid = (total - 1) / 2;
  const dist = Math.abs(index - mid);
  const zIndex = total - dist * 2;
  const scale = 1 - dist * 0.04;

  return {
    left: `${Math.max(0, left)}%`,
    width: `${cardWidth}%`,
    zIndex,
    scale,
  };
}

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
    navigate("/coaching");
  };

  return (
    <section
      style={{
        background: "linear-gradient(to bottom, #c0c0c0 0%, #808080 50%, #2a2a2a 100%)",
      }}
    >
      {/* Heading */}
      <div className="text-center pt-10 pb-4">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white drop-shadow">
          Featured Coaches
        </h2>
      </div>

      {/* Overlapping cutout strip */}
      <div className="relative w-full overflow-hidden" style={{ height: "520px" }}>
        {coaches.map((coach, i) => {
          const layout = getLayout(i, coaches.length);
          return (
            <button
              key={coach.id}
              onClick={() => handleClick(coach)}
              className="group absolute top-0 h-full cursor-pointer focus:outline-none"
              style={{
                left: layout.left,
                width: layout.width,
                zIndex: layout.zIndex,
                transform: `scale(${layout.scale})`,
                transformOrigin: "bottom center",
              }}
              aria-label={`View ${coach.display_name || "coach"} profile`}
            >
              {coach.avatar_url ? (
                <img
                  src={coach.avatar_url}
                  alt={coach.display_name || "Coach"}
                  className="w-full h-full object-contain object-bottom transition-all duration-500 group-hover:grayscale-0"
                  style={{ filter: "grayscale(1)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLImageElement).style.filter = "grayscale(0)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLImageElement).style.filter = "grayscale(1)";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-zinc-400 flex items-center justify-center">
                  <span className="text-7xl font-bold text-zinc-600">
                    {(coach.display_name || "C").charAt(0)}
                  </span>
                </div>
              )}

              {/* Bottom vignette — blends feet into dark base */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#2a2a2a] to-transparent pointer-events-none" />

              {/* Name tooltip on hover */}
              <div className="absolute bottom-8 left-0 right-0 text-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                <p className="text-white font-semibold text-sm drop-shadow">
                  {coach.display_name}
                </p>
                {(coach.current_role || coach.headline) && (
                  <p className="text-zinc-200 text-xs mt-0.5 drop-shadow">
                    {coach.current_role || coach.headline}
                  </p>
                )}
                <p className="text-primary text-xs mt-1 font-medium">
                  View Coaches →
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
