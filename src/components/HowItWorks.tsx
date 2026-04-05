import { Zap } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Find Your Coach.\nUnshackle Your Performance.",
    body: "Real conversations. Real growth. From executive presence to commercial execution — this is where it starts.",
    accent: false,
    bg: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop",
  },
  {
    number: 2,
    title: "Where Elite Teams Come to Evolve.",
    body: "From the boardroom to the pitch, this is where high-performance leaders and organisations grow stronger together.",
    accent: true,
    bg: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop",
  },
  {
    number: 3,
    title: "Experiment.\nExplore.\nEvolve.",
    body: "Insights, roundtables, and forums where performance meets perspective and execution meets evidence.",
    accent: false,
    bg: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=800&auto=format&fit=crop",
  },
  {
    number: 4,
    title: "Guiding Growth with Intelligence.",
    body: "Our intelligent matching platform connects leaders with execution-ready coaches through data-driven insight.",
    accent: false,
    bg: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800&auto=format&fit=crop",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-zinc-950">
      <div className="container-wide">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white uppercase">
            How It{" "}
            <span className="text-primary">Works</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative overflow-hidden rounded-2xl min-h-[380px] flex flex-col justify-end"
            >
              {/* Background image */}
              <img
                src={step.bg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

              {/* Content */}
              <div className="relative z-10 p-6">
                <h3
                  className={`text-xl md:text-2xl font-black uppercase leading-tight mb-3 whitespace-pre-line ${
                    step.accent ? "text-primary" : "text-white"
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  {step.body}
                </p>
                <Zap className="h-5 w-5 text-primary" />
              </div>
            </div>
          ))}
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mt-10">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 border-primary text-primary bg-zinc-950">
                {step.number}
              </div>
              {i < steps.length - 1 && (
                <div className="w-16 md:w-24 h-px bg-zinc-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
