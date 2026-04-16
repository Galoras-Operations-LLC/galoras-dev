import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const BARNES_PHOTO =
  "https://qbjuomsmnrclsjhdsjcz.supabase.co/storage/v1/object/public/coach-images/Barnes_Lam_-Removebg_BusinessPortraits.ca__1_-removebg-preview.png";

export function FeaturedCoaches() {
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
              Every Galoras coach has operated at the level they coach. Not studied it. Not observed it. Lived it — and taken responsibility for outcomes.
            </p>
            <p className="text-zinc-500 text-base leading-relaxed mb-10">
              Barnes Lam has led $100M+ revenue businesses across four continents. He built the Sport of Business framework from the inside — and he deploys it with the same rigour he used when the stakes were real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/coach/barnes-lam">
                <Button size="lg" className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold">
                  Meet Barnes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/coaching">
                <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  All Coaches
                </Button>
              </Link>
            </div>
          </div>

          {/* Right — B&W photo */}
          <div className="relative flex items-end justify-center order-1 lg:order-2 pt-16 lg:pt-0">
            {/* Subtle vertical gradient fade at bottom */}
            <div
              className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
              style={{
                height: "40%",
                background:
                  "linear-gradient(to top, #0d0f12 0%, rgba(13,15,18,0.5) 60%, transparent 100%)",
              }}
            />
            <img
              src={BARNES_PHOTO}
              alt="Barnes Lam — Galoras Coach"
              className="relative z-0 max-h-[580px] w-auto object-contain object-bottom"
              style={{ filter: "grayscale(100%) contrast(1.05)" }}
            />
            {/* Name plate */}
            <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
              <p className="text-white font-display font-bold text-base">Barnes Lam</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Executive Coach · Sport of Business
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
