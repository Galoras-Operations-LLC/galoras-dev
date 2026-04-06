import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, CheckCircle2, Zap, Users, BookOpen, Sparkles, Star, Lock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const EXCHANGE_FEATURES = [
  "Browse all published coaches",
  "View full coach profiles & methodology",
  "Filter by specialty, industry, and goal",
  "See coaches matched to your profile",
  "Message coaches directly",
  "Book discovery sessions",
];

const LAB_INTRO_FEATURES = [
  "Single live session (90 mins)",
  "Introduction to the Galoras performance language",
  "Clarity on your current performance blockers",
  "Actionable takeaways you can apply immediately",
  "Access to session recording & materials",
  "Priority matching to relevant coaches post-session",
];

const LAB_SERIES_FEATURES = [
  "6-session cohort program (small group, max 12)",
  "Build core performance skills over 6 weeks",
  "Shared language and execution framework",
  "Weekly practical tools and reflections",
  "1-on-1 coach matching session included",
  "Access to Galoras community post-series",
  "Certificate of completion",
];

const COACHING_FEATURES = [
  "Everything in the Exchange (free)",
  "Personalised coach recommendations",
  "Priority booking with Elite & Master coaches",
  "Direct messaging with all coaches",
  "Session notes & progress tracking",
  "Monthly coaching check-in prompts",
];

export default function Offerings() {
  const { isLoggedIn } = useAuth();

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_55%)]" />
        <div className="container-wide relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Customer Offerings
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight text-white uppercase mb-5">
            Unshackle Your <span className="text-primary">Performance</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
            From your first conversation with a coach to a structured performance programme — choose the experience that meets you where you are.
          </p>
          {!isLoggedIn && (
            <Link to="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary text-base px-8 h-13">
                Start for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Journey strip */}
      <section className="bg-zinc-900 border-y border-zinc-800 py-5">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 text-sm text-zinc-400">
            {[
              { label: "Browse coaches", icon: "1" },
              { label: "Create your profile", icon: "2" },
              { label: "Get matched", icon: "3" },
              { label: "Book a session", icon: "4" },
              { label: "Join a Lab", icon: "5" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center border border-primary/30">
                  {step.icon}
                </div>
                <span>{step.label}</span>
                {i < arr.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-600 hidden sm:block mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offering cards */}
      <section className="bg-zinc-950 py-20">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">

            {/* ── Coaching Exchange (free) ── */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Coaching Exchange</span>
                </div>
                <div className="mb-1">
                  <span className="text-4xl font-black text-white">Free</span>
                </div>
                <p className="text-zinc-400 text-sm">Browse, match, and connect with coaches at no cost.</p>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <ul className="space-y-3 mb-8 flex-1">
                  {EXCHANGE_FEATURES.map((f, i) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      {i < 4 ? (
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <Lock className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
                      )}
                      <span className={i < 4 ? "text-zinc-200" : "text-zinc-500"}>
                        {f}
                        {i >= 4 && <span className="text-xs text-zinc-600 ml-1">(registered users)</span>}
                      </span>
                    </li>
                  ))}
                </ul>
                {isLoggedIn ? (
                  <Link to="/coaching">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Browse coaches
                    </Button>
                  </Link>
                ) : (
                  <Link to="/signup">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Get started free
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* ── Lab Intro ── */}
            <div className="rounded-2xl border border-primary/40 bg-zinc-900 overflow-hidden flex flex-col relative">
              {/* Popular badge */}
              <div className="absolute top-0 left-0 right-0 flex justify-center">
                <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-b-lg">
                  MOST POPULAR
                </div>
              </div>

              <div className="p-6 pt-9 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Lab Intro</span>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-black text-white">$250</span>
                  <span className="text-zinc-400 text-sm mb-1.5">– $500</span>
                </div>
                <p className="text-zinc-400 text-sm">per participant · single session</p>
                <p className="text-zinc-300 text-sm mt-3">
                  Your entry point into the Galoras performance ecosystem. One powerful session that reframes how you think about execution.
                </p>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <ul className="space-y-3 mb-8 flex-1">
                  {LAB_INTRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-zinc-200">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Book a Lab Intro
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* ── Lab Series ── */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Lab Series</span>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-black text-white">$1,500</span>
                  <span className="text-zinc-400 text-sm mb-1.5">– $3,000</span>
                </div>
                <p className="text-zinc-400 text-sm">per cohort · 6 sessions</p>
                <p className="text-zinc-300 text-sm mt-3">
                  A structured 6-week cohort experience. Build a shared performance language, practical execution tools, and clarity you can act on.
                </p>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <ul className="space-y-3 mb-8 flex-1">
                  {LAB_SERIES_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-zinc-200">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact">
                  <Button variant="outline" className="w-full border-zinc-700 text-white hover:border-primary hover:text-primary">
                    Enquire about the Series
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>

          {/* B2B note */}
          <p className="text-center text-zinc-600 text-sm mt-10">
            Looking for team or enterprise programmes?{" "}
            <Link to="/business" className="text-primary hover:underline">
              Explore Galoras for Business →
            </Link>
          </p>
        </div>
      </section>

      {/* Value props */}
      <section className="bg-zinc-900 border-t border-zinc-800 py-16">
        <div className="container-wide">
          <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase text-center mb-12">
            Why Galoras?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Star,
                title: "Curated coaches only",
                body: "Every coach is vetted against demonstrated performance — not just credentials.",
              },
              {
                icon: Sparkles,
                title: "Matched to your goals",
                body: "Your profile drives intelligent matching so you see the most relevant coaches first.",
              },
              {
                icon: Zap,
                title: "One performance philosophy",
                body: "Clarity, fundamentals, and execution under pressure — a shared standard across the ecosystem.",
              },
              {
                icon: BookOpen,
                title: "Structured experiences",
                body: "From a single session to a full Lab Series — clear pathways designed for real outcomes.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-5 rounded-xl border border-zinc-800 bg-zinc-950">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-zinc-950 border-t border-zinc-800 py-20 text-center">
        <div className="container-wide max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase mb-4">
            Ready to start?
          </h2>
          <p className="text-zinc-400 mb-8">
            Create a free account in under 2 minutes. We'll match you with coaches aligned to your goals the moment you're done.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isLoggedIn ? (
              <Link to="/coaching">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Browse coaches <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Create free account <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-zinc-700 text-white hover:border-primary">
                    Talk to us first
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
