import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const COACHES = [
  {
    name: "Barnes Lam",
    title: "Master Coach",
    slug: "barnes-lam",
    photo:
      "https://qbjuomsmnrclsjhdsjcz.supabase.co/storage/v1/object/public/coach-images/Barnes_Lam_-Removebg_BusinessPortraits.ca__1_-removebg-preview.png",
  },
  {
    name: "Mitesh Kapadia",
    title: "Master Coach",
    slug: "mitesh-kapadia",
    photo:
      "https://qbjuomsmnrclsjhdsjcz.supabase.co/storage/v1/object/public/coach-images/Outside_Blue_Mitesh-removebg-preview.png",
  },
];

export function FeaturedCoaches() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const [colorizing, setColorizing] = useState(false);

  useEffect(() => {
    if (colorizing) return; // pause rotation while colorizing
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive(i => (i + 1) % COACHES.length);
        setFading(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [colorizing]);

  const coach = COACHES[active];

  const handlePhotoClick = () => {
    setColorizing(true);
    // After color transition completes, navigate
    setTimeout(() => {
      navigate(`/coaching/${coach.slug}`);
      setColorizing(false);
    }, 600);
  };

  const filter = colorizing
    ? "grayscale(0%) contrast(1.0) brightness(1.05)"
    : "grayscale(100%) contrast(1.05)";

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 100%, #16181e 0%, #0d0f12 100%)" }}
    >
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 min-h-[600px]">

          {/* Left — copy */}
          <div className="flex flex-col justify-center py-20 pr-0 lg:pr-16 order-2 lg:order-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              The Coaches
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight mb-6">
              People Who Have <span className="text-gradient">Been There</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-4">
              Every Galoras coach has operated at the level they coach. Not studied it. Not observed it. Lived it, and taken responsibility for outcomes.
            </p>
            <p className="text-zinc-500 text-base leading-relaxed mb-10">
              Executives, founders, and operators who have led at the highest level and now deploy that experience to help others perform under real conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/coaching">
                <Button size="lg" className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold">
                  Meet the Coaches
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Dot indicators */}
            <div className="flex gap-2 mt-10">
              {COACHES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setFading(true); setTimeout(() => { setActive(i); setFading(false); }, 400); }}
                  className="transition-all rounded-full"
                  style={{
                    width: active === i ? 24 : 8,
                    height: 8,
                    background: active === i ? "hsl(var(--primary))" : "rgba(255,255,255,0.2)",
                  }}
                  aria-label={COACHES[i].name}
                />
              ))}
            </div>
          </div>

          {/* Right — rotating portrait, click to colourize + navigate */}
          <div className="relative flex items-center justify-center order-1 lg:order-2" style={{ minHeight: 560 }}>
            {/* Bottom fade */}
            <div
              className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
              style={{
                height: "30%",
                background:
                  "linear-gradient(to top, #0d0f12 0%, rgba(13,15,18,0.4) 60%, transparent 100%)",
              }}
            />

            <button
              onClick={handlePhotoClick}
              className="relative z-0 focus:outline-none group"
              aria-label={`View ${coach.name}'s profile`}
            >
              <img
                key={coach.slug}
                src={coach.photo}
                alt={coach.name}
                className="mx-auto block"
                style={{
                  maxHeight: 500,
                  maxWidth: "100%",
                  width: "auto",
                  objectFit: "contain",
                  filter,
                  opacity: fading ? 0 : 1,
                  transition: "filter 0.5s ease, opacity 0.5s ease",
                  cursor: "pointer",
                }}
              />
              {/* Hover hint */}
              {!colorizing && (
                <div className="absolute inset-0 flex items-end justify-center pb-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="text-xs font-semibold text-primary bg-black/60 px-3 py-1.5 rounded-full">
                    View Profile
                  </span>
                </div>
              )}
            </button>

            {/* Name plate */}
            <div
              className="absolute bottom-6 left-0 right-0 z-20 text-center pointer-events-none"
              style={{ opacity: fading ? 0 : 1, transition: "opacity 0.5s ease" }}
            >
              <p className="text-white font-display font-bold text-base">{coach.name}</p>
              <p className="text-zinc-400 text-xs mt-0.5">{coach.title}</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
