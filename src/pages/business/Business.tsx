import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Target, Brain, Zap, CheckCircle2 } from "lucide-react";

const outcomes = [
  {
    statement: "Your team stops transmitting panic and starts containing it.",
    sub: "Pressure travels downward. Composure does too. The Sport of Business installs the latter.",
  },
  {
    statement: "Decisions get made. Not deferred.",
    sub: "Most leadership teams don't have a strategy problem. They have a decision-making problem.",
  },
  {
    statement: "Accountability becomes structural, not aspirational.",
    sub: "When everyone owns everything, no one owns anything. We fix that.",
  },
];

const steps = [
  {
    number: "01",
    icon: Target,
    title: "Diagnostic",
    description:
      "We map exactly where alignment breaks down, where decisions slow, and where execution slips. Not theory — your team's actual patterns under real conditions.",
    cta: null,
  },
  {
    number: "02",
    icon: Brain,
    title: "Programme",
    description:
      "We install the disciplines. Facilitated sessions grounded in The Sport of Business framework — practical, applied, and designed for teams already under pressure.",
    cta: null,
  },
  {
    number: "03",
    icon: Zap,
    title: "Results",
    description:
      "Leadership behaviour changes. Culture follows. Performance compounds. The work shows up in how your team functions when the stakes are high.",
    cta: null,
  },
];

const forYouIf = [
  "Your team is capable. Execution keeps slipping anyway.",
  "You're about to make a significant change. You need the team to hold.",
  "The pressure is increasing. The behaviours aren't adapting.",
  "Trust is quietly eroding and no one is naming it.",
];

export default function Business() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.10),transparent_55%)]" />
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Building2 className="h-4 w-4" />
              Galoras for Business
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase mb-6">
              Your Performance Problem is a{" "}
              <span className="text-gradient">Behaviour</span> Problem.
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 font-medium mb-4 max-w-2xl mx-auto">
              Most leadership failures are not intelligence failures. They are pattern failures.
            </p>
            <p className="text-lg text-zinc-500 mb-10 max-w-xl mx-auto">
              Galoras installs the disciplines that close the gap between how your team intends to perform and how it actually performs under pressure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary text-lg px-8 h-14">
                  Book a Business Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/business/sport-of-business">
                <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-lg px-8 h-14">
                  The Sport of Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Outcome statements — what actually changes */}
      <section className="py-20 bg-zinc-900 border-y border-zinc-800">
        <div className="container-wide">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">What Changes</p>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
              Not What We Do. What You Get.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {outcomes.map((item, i) => (
              <div key={i} className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-primary/40 transition-colors">
                <p className="text-white font-display font-bold text-xl leading-snug mb-4">
                  "{item.statement}"
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Sport of Business — grounded in behaviour science */}
      <section className="py-20 bg-zinc-950">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">The Framework</p>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight mb-6">
              The Sport of Business
            </h2>
            <p className="text-zinc-300 text-lg leading-relaxed mb-4">
              Elite sports teams don't just train harder. They train the behaviours that hold under pressure — consistency, containment, decisive execution.
            </p>
            <p className="text-zinc-500 text-base leading-relaxed mb-10">
              The Sport of Business is the Galoras performance framework for leadership teams. It measures and improves how your team aligns, decides, and executes together — not in a workshop, but in the conditions you actually operate in.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-10">
              {[
                { icon: Target, label: "Alignment" },
                { icon: Brain,  label: "Decision-Making" },
                { icon: Zap,    label: "Execution Under Pressure" },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20">
                  <Icon className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-display font-semibold text-white text-sm">{label}</span>
                  {i < 2 && <ArrowRight className="h-4 w-4 text-primary/40 hidden md:block ml-2" />}
                </div>
              ))}
            </div>
            <Link to="/business/sport-of-business">
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                Explore the Framework
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Step Engagement Path */}
      <section className="py-20 bg-zinc-900 border-t border-zinc-800">
        <div className="container-wide">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">How We Engage</p>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
              Three Steps. No Guesswork.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative p-8 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-primary/40 transition-colors">
                <p className="text-5xl font-display font-black text-primary/20 mb-4">{step.number}</p>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-800">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Is This For You?</p>
              <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
                This Work Is For You If...
              </h2>
            </div>
            <div className="space-y-4 mb-12">
              {forYouIf.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-white font-medium">{item}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-zinc-400 text-lg mb-6">
                If any of these land, the conversation is worth having.
              </p>
              <Link to="/contact">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                  Book a Business Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
