import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { FounderVideoModal } from "@/components/FounderVideoModal";
import { FeaturedCoaches } from "@/components/FeaturedCoaches";
import { HowItWorks } from "@/components/HowItWorks";
import { ArrowRight, Compass, Zap, Target, Brain, MessageCircle, TrendingUp } from "lucide-react";

const categories = [
  { icon: Target, name: "Leadership", slug: "leadership" },
  { icon: TrendingUp, name: "Career", slug: "career" },
  { icon: Zap, name: "Performance", slug: "performance" },
  { icon: Brain, name: "Mindset", slug: "mindset" },
  { icon: MessageCircle, name: "Communication", slug: "communication" },
  { icon: Compass, name: "Transitions", slug: "transitions" },
];

const HEADLINES: { parts: { text: string; highlight?: boolean }[]; href: string | null }[] = [
  {
    parts: [
      { text: "Business is a " },
      { text: "team sport.", highlight: true },
      { text: " Most teams never practice." },
    ],
    href: null,
  },
  {
    parts: [
      { text: "Losers have plans. " },
      { text: "Winners", highlight: true },
      { text: " have coaches." },
    ],
    href: "/business/sport-of-business",
  },
  {
    parts: [
      { text: "Your leadership team has never been " },
      { text: "coached.", highlight: true },
      { text: " It shows." },
    ],
    href: "/business/sport-of-business",
  },
  {
    parts: [
      { text: "You're not stuck. You're " },
      { text: "uncoached.", highlight: true },
    ],
    href: "/signup",
  },
  {
    parts: [
      { text: "The gap between you and your potential has a " },
      { text: "name.", highlight: true },
    ],
    href: "/coaching",
  },
];

// Timing constants (ms)
const HOLD_DURATION = 3500;
const EXIT_DURATION = 350;

type Phase = "visible" | "exiting";

function RotatingHero() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("visible");
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const runCycle = (idx: number) => {
    setIndex(idx);
    setPhase("visible");

    timerRef.current = setTimeout(() => {
      setPhase("exiting");

      timerRef.current = setTimeout(() => {
        runCycle((idx + 1) % HEADLINES.length);
      }, EXIT_DURATION);
    }, HOLD_DURATION);
  };

  useEffect(() => {
    if (!paused) {
      runCycle(0);
    }
    return clear;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const headline = HEADLINES[index];

  const handleClick = () => {
    if (headline.href) {
      clear();
      navigate(headline.href);
    }
  };

  return (
    <div
      className="relative overflow-hidden cursor-default"
      onMouseEnter={() => { clear(); setPaused(true); }}
      onMouseLeave={() => { setPaused(false); }}
      style={{ minHeight: "3.5rem" }}
    >
      {/* Headline text */}
      <span
        onClick={handleClick}
        className={[
          "relative z-20 block text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight",
          headline.href ? "cursor-pointer" : "",
          phase === "visible" ? "headline-reveal" : "",
          phase === "exiting" ? "headline-exit" : "",
        ].join(" ")}
      >
        {headline.parts.map((part, i) =>
          part.highlight
            ? <span key={i} className="text-gradient">{part.text}</span>
            : <span key={i} className="text-foreground">{part.text}</span>
        )}
        {headline.href && (
          <ArrowRight className="inline-block ml-3 h-8 w-8 text-accent opacity-70" />
        )}
      </span>
    </div>
  );
}

export default function Index() {
  return (
    <Layout>
      <FounderVideoModal />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <OptimizedImage
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80"
            alt="Professional team collaboration"
            className="w-full h-full"
            overlay
          />
          <div className="absolute inset-0 bg-background/70" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.1),transparent_50%)]" />

        <div className="container-wide relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <RotatingHero />

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-8 mb-10">
              Coaching is not our business. Winning is.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/business/sport-of-business">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary text-lg px-8 h-14">
                  Explore Sport of Business
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/coaching">
                <Button size="lg" variant="outline" className="border-primary/50 text-foreground hover:bg-primary/10 text-lg px-8 h-14">
                  Find Your Coach
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FeaturedCoaches />
      <HowItWorks />

      {/* Categories Preview */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Performance <span className="text-gradient">Domains</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Areas where execution capability has been demonstrated — not just discussed.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/coaching?category=${category.slug}`}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 text-center transition-all card-hover"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding hero-gradient">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Stop Navigating It <span className="text-gradient">Alone</span></h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Every high-performer has blind spots. Galoras connects you with a coach who's been in the room and help you lead with more clarity, confidence, and impact.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Join the Galoras Community
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                Book a Business Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
