import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle } from "lucide-react";
import { ContactModal } from "./ContactModal";

type CarouselCoach = {
  id: string;
  slug: string | null;
  display_name: string | null;
  avatar_url: string | null;
  current_role: string | null;
  headline: string | null;
  bio: string | null;
  booking_url: string | null;
};

const VISIBLE = 4;
const INTERVAL_MS = 3000;

export function CoachCarousel() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [contactCoach, setContactCoach] = useState<{ id: string; name: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: coaches } = useQuery({
    queryKey: ["carousel-coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, slug, display_name, avatar_url, current_role, headline, bio, booking_url")
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

  const openContact = (coach: CarouselCoach) => {
    setContactCoach({ id: coach.id, name: coach.display_name || "Coach" });
  };

  const visible = Array.from({ length: Math.min(VISIBLE, coaches.length) }, (_, i) => {
    return coaches[(index + i) % coaches.length];
  });

  return (
    <>
    <section className="py-16 bg-zinc-900">
      <div className="container-wide">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Our <span className="text-gradient">Coaches</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Execution-ready coaches across every performance domain.
          </p>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-5 transition-opacity duration-300"
          style={{ opacity: transitioning ? 0 : 1 }}
        >
          {visible.map((coach) => (
            <div
              key={coach.id}
              className="bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 flex flex-col"
            >
              {/* Square photo — centered, proportional */}
              <div className="relative w-full bg-zinc-700" style={{ paddingBottom: "100%" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  {coach.avatar_url ? (
                    <img
                      src={coach.avatar_url}
                      alt={coach.display_name || "Coach"}
                      className="w-full h-full object-contain object-center"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-zinc-500">
                      {(coach.display_name || "C").charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <p className="font-bold text-white text-base leading-tight">
                  {coach.display_name || "Coach"}
                </p>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {coach.current_role || coach.headline || "Coach"}
                </p>

                {/* Buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-700">
                  <button
                    onClick={() => navigate(coach.slug ? `/coach/${coach.slug}` : `/coaching/${coach.id}`)}
                    className="flex-1 text-xs font-semibold bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => openContact(coach)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg border border-primary/50 text-primary hover:bg-primary/10 transition-colors"
                    title="Send a message"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {contactCoach && (
      <ContactModal
        coachId={contactCoach.id}
        coachName={contactCoach.name}
        onClose={() => setContactCoach(null)}
      />
    )}
    </>
  );
}
