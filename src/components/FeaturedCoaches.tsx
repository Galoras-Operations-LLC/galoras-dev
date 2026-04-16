import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: coaches, isLoading, isError } = useQuery({
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
    retry: 1,
  });

  if (isLoading || isError || !coaches || coaches.length === 0) return null;

  const prev = () => setActiveIndex(i => (i - 1 + coaches.length) % coaches.length);
  const next = () => setActiveIndex(i => (i + 1) % coaches.length);

  // Wrapped offset for circular positioning
  const wrappedOffset = (i: number) => {
    const n = coaches.length;
    const raw = i - activeIndex;
    if (raw > n / 2) return raw - n;
    if (raw < -n / 2) return raw + n;
    return raw;
  };

  const handleClick = (i: number) => {
    const offset = wrappedOffset(i);
    if (offset === 0) {
      const coach = coaches[i];
      navigate(coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`);
    } else {
      setActiveIndex(i);
    }
  };

  // Layout config per position offset
  const getLayout = (offset: number) => {
    const abs = Math.abs(offset);
    if (abs === 0) return { height: 480, width: 200, zIndex: 30, grayscale: false, opacity: 1, translateY: 0 };
    if (abs === 1) return { height: 400, width: 170, zIndex: 20, grayscale: true,  opacity: 0.85, translateY: 40 };
    if (abs === 2) return { height: 330, width: 145, zIndex: 10, grayscale: true,  opacity: 0.6, translateY: 80 };
    return               { height: 270, width: 120, zIndex: 5,  grayscale: true,  opacity: 0.35, translateY: 110 };
  };

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 80%, #1a1d22 0%, #0d0f12 100%)",
      }}
    >
      {/* Heading */}
      <div className="container-wide relative z-10 text-center mb-16">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">On the Platform</p>
        <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
          Meet the <span className="text-gradient">Coaches</span>
        </h2>
        <p className="mt-3 text-sm text-zinc-400 max-w-md mx-auto">
          Every coach on Galoras is vetted, experienced, and selected — not listed.
        </p>
      </div>

      {/* Stage */}
      <div className="relative flex items-end justify-center" style={{ height: 520 }}>
        {coaches.map((coach, i) => {
          const offset = wrappedOffset(i);
          const abs = Math.abs(offset);
          if (abs > 3) return null;

          const layout = getLayout(offset);
          const sign = offset < 0 ? -1 : 1;
          const xSpacing = abs === 0 ? 0 : sign * (abs * 190);

          return (
            <button
              key={coach.id}
              onClick={() => handleClick(i)}
              className="absolute bottom-0 focus:outline-none group"
              style={{
                width: layout.width,
                zIndex: layout.zIndex,
                transform: `translateX(${xSpacing}px) translateY(${layout.translateY}px)`,
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: layout.opacity,
              }}
              aria-label={coach.display_name || "Coach"}
            >
              {/* Photo — no card, no border, fades into dark background */}
              <div
                className="relative overflow-hidden"
                style={{ height: layout.height, width: "100%" }}
              >
                {coach.avatar_url ? (
                  <img
                    src={coach.avatar_url}
                    alt={coach.display_name || "Coach"}
                    className="w-full h-full object-cover object-top"
                    style={{
                      filter: layout.grayscale ? "grayscale(100%)" : "grayscale(0%)",
                      transition: "filter 0.4s ease",
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-end justify-center pb-8">
                    <span className="text-5xl font-bold text-zinc-500">
                      {(coach.display_name || "C").charAt(0)}
                    </span>
                  </div>
                )}

                {/* Bottom fade — blends photo into dark section background */}
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{
                    height: "55%",
                    background: "linear-gradient(to top, #0d0f12 0%, #0d0f1260 50%, transparent 100%)",
                  }}
                />

                {/* Active: name + CTA overlay */}
                {offset === 0 && (
                  <div className="absolute bottom-4 left-0 right-0 text-center px-3">
                    <p className="text-white font-display font-bold text-sm leading-tight">
                      {coach.display_name}
                    </p>
                    {(coach.current_role || coach.headline) && (
                      <p className="text-zinc-400 text-xs mt-0.5 line-clamp-1">
                        {coach.current_role || coach.headline}
                      </p>
                    )}
                    <p className="text-primary text-xs mt-2 font-semibold group-hover:text-accent transition-colors">
                      View Profile →
                    </p>
                  </div>
                )}
              </div>

              {/* Side coach name — shown below figure */}
              {offset !== 0 && (
                <p className="text-zinc-500 text-xs text-center mt-2 font-medium group-hover:text-zinc-300 transition-colors">
                  {coach.display_name}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="relative z-10 flex items-center justify-center gap-6 mt-10">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full border border-zinc-700 bg-black/40 flex items-center justify-center text-zinc-400 hover:text-white hover:border-primary hover:bg-primary/10 transition-all"
          aria-label="Previous coach"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {coaches.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="transition-all"
              style={{
                width: activeIndex === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: activeIndex === i ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)",
              }}
              aria-label={`Go to coach ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full border border-zinc-700 bg-black/40 flex items-center justify-center text-zinc-400 hover:text-white hover:border-primary hover:bg-primary/10 transition-all"
          aria-label="Next coach"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
