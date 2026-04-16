import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Target,
  MessageCircle,
  Zap,
  Bot,
  Brain,
  Globe,
  FlaskConical
} from "lucide-react";

const BARNES_PHOTO = "https://qbjuomsmnrclsjhdsjcz.supabase.co/storage/v1/object/public/coach-images/Barnes_Lam_-Removebg_BusinessPortraits.ca__1_-removebg-preview.png";

const labs = [
  {
    icon: Target,
    title: "Alignment Under Pressure",
    duration: "Full-day",
    highlight: undefined,
    sample: true,
    description:
      "Teams that are misaligned on priorities execute slowly and disagree at the wrong moments. This Lab surfaces and resolves alignment gaps, fast.",
    outcomes: [
      "Shared priority clarity",
      "Decision rights mapped",
      "Conflict resolved in-session",
    ],
  },
  {
    icon: Brain,
    title: "Decision Velocity",
    duration: "Half-day",
    highlight: undefined,
    sample: true,
    description:
      "Most leadership teams make decisions too slowly, too often, and by the wrong people. This Lab installs the structures that accelerate decision quality without sacrificing speed.",
    outcomes: [
      "Decision frameworks installed",
      "Escalation paths defined",
      "Real decisions made live",
    ],
  },
  {
    icon: Zap,
    title: "Execution Discipline",
    duration: "Full-day",
    highlight: undefined,
    sample: true,
    description:
      "Strategy fails in the gap between decision and delivery. This Lab closes that gap by building the accountability structures your team will actually use.",
    outcomes: [
      "Accountability operating model",
      "Follow-through cadence",
      "Progress visibility",
    ],
  },
  {
    icon: MessageCircle,
    title: "Executive Communication",
    duration: "Half-day",
    highlight: undefined,
    sample: true,
    description:
      "How leaders communicate determines how organisations move. This Lab develops the clarity, directness, and precision that high-performance environments demand.",
    outcomes: [
      "Clear, direct communication",
      "Difficult conversations",
      "Influence and persuasion",
    ],
  },
  {
    icon: Bot,
    title: "AI for Executives",
    duration: "1:1 Private",
    highlight: "private",
    sample: false,
    description:
      "Most executives are making AI decisions without truly understanding the technology. This private session gives you the clarity to lead AI conversations, evaluate tools, and ask the right questions of your teams. No technical background required.",
    outcomes: [
      "AI fundamentals for non-technical leaders",
      "How to evaluate AI tools and vendors",
      "Asking the right questions of your team",
    ],
  },
  {
    icon: Globe,
    title: "Digital Presence",
    duration: "Free · 1 Hour",
    highlight: "free",
    sample: false,
    description:
      "Exclusively for Galoras coaches at Elite tier and above. A complimentary private session covering LinkedIn positioning, personal website strategy, and social media, so you attract the right clients and build your coaching practice with confidence.",
    outcomes: [
      "LinkedIn profile and content strategy",
      "Personal website and brand positioning",
      "Social media approach for coaches",
    ],
  },
];

const formats = [
  {
    title: "On-Site",
    description:
      "Facilitated at your location. High-intensity working sessions that use your team's real environment and real challenges.",
    features: ["Your context, your team", "No travel overhead", "Immediate application"],
  },
  {
    title: "Offsite",
    description:
      "Removed from the day-to-day environment, which creates the space for more honest and more difficult conversations.",
    features: ["Neutral environment", "Full team presence", "Deeper engagement"],
  },
  {
    title: "Virtual",
    description:
      "Structured for distributed teams. Designed to achieve the same depth and output as in-person sessions.",
    features: ["Global team access", "Flexible scheduling", "No less rigorous"],
  },
];

export default function Workshops() {
  return (
    <Layout>
      <SEO
        title="Workshops & Leadership Labs"
        description="Galoras Leadership Labs are immersive facilitated sessions for leadership teams — covering alignment, decision velocity, execution discipline, and executive communication."
        canonical="/business/workshops"
      />
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-zinc-950">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.10),transparent_55%)]" />

        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <FlaskConical className="h-4 w-4" />
              Leadership Labs
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase mb-6">
              Workshops &{" "}
              <span className="text-gradient">Offsites</span>
            </h1>
            <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto mb-4">
              Leadership Labs are immersive, facilitated working sessions where teams practise The Sport of Business in real time.
            </p>
            <p className="text-zinc-500 text-base max-w-xl mx-auto mb-10">
              Not training programmes. Not presentations. Working sessions where your team leaves with decisions made, alignment installed, and a clearer path forward.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold">
                Request a Lab
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Labs Catalogue */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Lab <span className="text-gradient">Catalogue</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each Lab is built around a specific execution challenge. Choose the one that fits where your team is — or we design something custom.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {labs.map((lab, i) => (
              <Card
                key={i}
                className={`group relative overflow-hidden transition-all card-hover ${
                  lab.highlight === "free"
                    ? "border-green-500/40 hover:border-green-500/70 bg-green-500/5"
                    : lab.highlight === "private"
                    ? "border-primary/40 hover:border-primary/70"
                    : "hover:border-primary/50"
                }`}
              >
                {/* SAMPLE ribbon — upper-left diagonal */}
                {lab.sample && (
                  <div className="absolute top-[18px] -left-[30px] w-[120px] text-center py-[5px] bg-zinc-600 text-white text-[10px] font-bold tracking-[0.15em] uppercase rotate-[-45deg] z-10 shadow-md">
                    Sample
                  </div>
                )}

                <CardContent className="p-6 text-center">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mx-auto ${
                      lab.highlight === "free" ? "bg-green-500/10" : "bg-primary/10"
                    }`}>
                      <lab.icon className={`h-6 w-6 ${lab.highlight === "free" ? "text-green-500" : "text-primary"}`} />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      lab.highlight === "free"
                        ? "text-green-600 bg-green-500/15 border border-green-500/30"
                        : lab.highlight === "private"
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-muted-foreground bg-muted"
                    }`}>
                      {lab.duration}
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-semibold mb-2">{lab.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{lab.description}</p>

                  <div className="space-y-1.5 mb-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outcomes</p>
                    {lab.outcomes.map((outcome, j) => (
                      <div key={j} className="flex items-center justify-center gap-2 text-sm">
                        <Zap className={`h-3 w-3 shrink-0 ${lab.highlight === "free" ? "text-green-500" : "text-primary"}`} />
                        {outcome}
                      </div>
                    ))}
                  </div>

                  {/* Coach Barnes attribution on sample labs */}
                  {lab.sample && (
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <img
                        src={BARNES_PHOTO}
                        alt="Coach Barnes"
                        className="w-9 h-9 rounded-full object-cover object-top bg-muted shrink-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-tight">Coach Barnes</p>
                        <p className="text-xs text-muted-foreground">Delivering this lab</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Formats */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Delivery <span className="text-gradient">Options</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The format follows the team's needs and not a preference for one delivery model.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {formats.map((format, i) => (
              <Card key={i} className="hover:border-primary/50 transition-all">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-display font-semibold mb-3">{format.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{format.description}</p>
                  <ul className="space-y-2">
                    {format.features.map((feature, j) => (
                      <li key={j} className="flex items-center justify-center gap-2 text-sm">
                        <Zap className="h-3 w-3 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Custom */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Custom <span className="text-gradient">Labs</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  Your team's challenges don't always fit a catalogue. We design custom Labs built around your specific operating environment, team dynamics, and the outcomes that matter most.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Discovery conversation to understand your context",
                    "Lab designed around your actual challenges",
                    "Facilitated by coaches with direct operating experience",
                    "Follow-up coaching available post-session",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact">
                  <Button className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold">
                    Discuss a Custom Lab
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=600&q=80"
                  alt="Facilitated session"
                  className="aspect-square rounded-2xl object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-zinc-950">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Your Team Leaves with Decisions <span className="text-gradient">Made</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Not slides. Not action items. Actual alignment, clarity, and a path forward.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold">
                Request a Lab
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/business">
              <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                View All Programmes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
