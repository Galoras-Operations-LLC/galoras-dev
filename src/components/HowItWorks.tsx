import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const pillars = [
  {
    number: 1,
    title: "One Performance\nPhilosophy",
    body: "A shared view of clarity, fundamentals, and execution under pressure — applied consistently across every coach and programme.",
    accent: false,
    bg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop",
    href: "/coaching/why",
  },
  {
    number: 2,
    title: "Curated Human\nCapital",
    body: "A selective network of coaches, operators and leaders aligned to one standard — not just credentialled, but proven.",
    accent: true,
    bg: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop",
    href: "/coaching",
  },
  {
    number: 3,
    title: "Structured\nExperiences",
    body: "A clear pathway from individual coaching to team and enterprise engagement — designed for real conditions, not classroom theory.",
    accent: false,
    bg: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=800&auto=format&fit=crop",
    href: "/labs",
  },
  {
    number: 4,
    title: "Technology as\nan Enabler",
    body: "Supporting scale, quality and insight without replacing human judgment — intelligence that surfaces the right coach at the right moment.",
    accent: false,
    bg: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop",
    href: "/compass",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-zinc-950">
      <div className="container-wide">

        {/* Heading */}
        <div className="text-center mb-4">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
            Galoras — The Performance Ecosystem
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white uppercase">
            One Ecosystem.{" "}
            <span className="text-primary">One Standard.</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-base max-w-2xl mx-auto">
            Connecting top-tier coaches, leaders, and organisations through one system — from individual growth to enterprise performance.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {pillars.map((pillar) => (
            <Link
              key={pillar.number}
              to={pillar.href}
              className="group relative overflow-hidden rounded-2xl min-h-[380px] flex flex-col justify-end focus:outline-none"
            >
              {/* Background image */}
              <img
                src={pillar.bg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 group-hover:from-black/95 transition-colors duration-300" />

              {/* Content */}
              <div className="relative z-10 p-6">
                <h3
                  className={`text-xl md:text-2xl font-black uppercase leading-tight mb-3 whitespace-pre-line ${
                    pillar.accent ? "text-primary" : "text-white"
                  }`}
                >
                  {pillar.title}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  {pillar.body}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mt-10">
          {pillars.map((pillar, i) => (
            <div key={pillar.number} className="flex items-center">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                {pillar.number}
              </div>
              {i < pillars.length - 1 && (
                <div className="w-16 md:w-24 h-0.5 bg-primary/40" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom label */}
        <p className="text-center text-zinc-600 text-xs mt-5 uppercase tracking-widest">
          Unshackle the Mind. Execute in the Real World.
        </p>

      </div>
    </section>
  );
}
