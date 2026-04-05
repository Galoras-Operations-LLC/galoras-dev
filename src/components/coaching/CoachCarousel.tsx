import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type CarouselCoach = {
  id: string;
  slug: string | null;
  display_name: string | null;
  avatar_url: string | null;
  current_role: string | null;
  headline: string | null;
  bio: string | null;
};

const VISIBLE = 5;
const INTERVAL_MS = 2000;

export function CoachCarousel() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: coaches } = useQuery({
    queryKey: ["carousel-coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, slug, display_name, avatar_url, current_role, headline, bio")
        .eq("lifecycle_status", "published")
        .order("display_name", { ascending: true });

      if (error) throw error;
      return (data || []) as CarouselCoach[];
    },
  });

  const advance = () => {
    if (!coaches || coaches.length <= VISIBLE) return;
    setTransitioning(true);
    setTimeout(() => {
      setIndex((i) => (i + 1) % coaches.length);
      setTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    timerRef.current = setInterval(advance, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [coaches]);

  if (!coaches || coaches.length === 0) return null;

  // Build visible window — wraps around
  const visible = Array.from({ length: Math.min(VISIBLE, coaches.length) }, (_, i) => {
    return coaches[(index + i) % coaches.length];
  });

  return (
    <section className="py-16 bg-background">
      <div className="container-wide">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Our <span className="text-gradient">Coaches</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Execution-ready coaches across every performance domain.
          </p>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 transition-opacity duration-300"
          style={{ opacity: transitioning ? 0 : 1 }}
        >
          {visible.map((coach) => (
            <button
              key={coach.id}
              onClick={() => navigate(coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`)}
              className="group text-left bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-primary/50 transition-all duration-300 cursor-pointer focus:outline-none"
            >
              {/* Photo */}
              <div className="aspect-square overflow-hidden bg-zinc-800">
                {coach.avatar_url ? (
                  <img
                    src={coach.avatar_url}
                    alt={coach.display_name || "Coach"}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl font-bold text-zinc-600">
                      {(coach.display_name || "C").charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="font-semibold text-white text-sm leading-tight">
                  {coach.display_name || "Coach"}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                  {coach.current_role || coach.headline || "Coach"}
                </p>
                {(coach.bio || coach.headline) && (
                  <p className="mt-2 text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                    &ldquo;{coach.bio || coach.headline}&rdquo;
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
