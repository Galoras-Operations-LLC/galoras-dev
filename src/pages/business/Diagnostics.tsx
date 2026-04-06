import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  Target,
  Users,
  Zap,
  Brain,
  TrendingUp,
  Search
} from "lucide-react";

const diagnostics = [
  {
    icon: Target,
    title: "Alignment Diagnostic",
    description:
      "Reveals where your leadership team is genuinely aligned and where surface agreement is masking real divergence. The starting point for every Sport of Business engagement.",
    deliverables: [
      "Priority alignment map",
      "Hidden conflict identification",
      "Decision rights clarity",
      "Facilitated debrief session",
    ],
  },
  {
    icon: Brain,
    title: "Decision Quality Assessment",
    description:
      "Measures how your team makes decisions: speed, quality, who's involved, and where decisions stall. Identifies the specific patterns that slow execution.",
    deliverables: [
      "Decision velocity analysis",
      "Bottleneck identification",
      "Escalation pattern review",
      "Improvement recommendations",
    ],
  },
  {
    icon: Zap,
    title: "Execution Audit",
    description:
      "Examines the gap between what your organisation decides and what it actually delivers. Identifies where accountability breaks down and why.",
    deliverables: [
      "Commitment follow-through analysis",
      "Accountability gap mapping",
      "Execution pattern report",
      "Prioritised intervention plan",
    ],
  },
  {
    icon: Users,
    title: "Leadership Team Effectiveness",
    description:
      "A comprehensive assessment of how your senior team functions as a unit: trust, candour, collective accountability, and operating discipline.",
    deliverables: [
      "Team dynamics assessment",
      "Candour and trust index",
      "Role and accountability clarity",
      "Team debrief and action session",
    ],
  },
  {
    icon: Search,
    title: "Leadership 360",
    description:
      "Multi-rater feedback for individual leaders, structured around execution capability and not just behavioural competencies. Paired with coaching to turn insight into action.",
    deliverables: [
      "Structured 360 feedback",
      "Execution capability profile",
      "Individual debrief session",
      "Development focus areas",
    ],
  },
  {
    icon: TrendingUp,
    title: "Organisational Performance Scan",
    description:
      "A broader view of where the organisation is gaining or losing performance across teams, functions, and leadership layers. Used to prioritise where to intervene.",
    deliverables: [
      "Cross-team performance mapping",
      "Bottleneck identification",
      "Priority intervention sequence",
      "Executive summary report",
    ],
  },
];

const process = [
  {
    step: 1,
    title: "Scope & Context",
    description:
      "We start with a conversation about what's actually happening and not just what the diagnostic is. Understanding the context determines what we measure and how.",
  },
  {
    step: 2,
    title: "Data Collection",
    description:
      "Structured surveys, stakeholder interviews, and direct observation, calibrated to surface what's really going on and not what people say in front of their managers.",
  },
  {
    step: 3,
    title: "Analysis",
    description:
      "We identify patterns, gaps, and the underlying causes and not just symptoms. The analysis is done by people who have led organisations, not just measured them.",
  },
  {
    step: 4,
    title: "Findings & Recommendations",
    description:
      "A clear report with prioritised, actionable findings. No padding. No 40-page decks. What's true, what it means, and what to do about it.",
  },
  {
    step: 5,
    title: "Action & Follow-Through",
    description:
      "We don't hand over a report and leave. We work with you to sequence and implement the interventions and track whether they're working.",
  },
];

export default function Diagnostics() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-zinc-950">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.10),transparent_55%)]" />

        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <BarChart3 className="h-4 w-4" />
              Execution Diagnostics
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase mb-6">
              Organisational{" "}
              <span className="text-primary">Diagnostics</span>
            </h1>
            <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto mb-4">
              You can't fix what you haven't properly diagnosed. Galoras diagnostics reveal the specific execution gaps — alignment, decision-making, and accountability — that are limiting your organisation's performance.
            </p>
            <p className="text-zinc-500 text-base max-w-xl mx-auto mb-10">
              Evidence-based. Grounded in real operating experience. Designed to drive action and not produce reports that sit on a shelf.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold">
                Start the Conversation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Diagnose First */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Diagnose Before You Intervene
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Most organisations jump to solutions before they've understood the problem. Leadership programmes get deployed without knowing whether the issue is capability, alignment, or accountability. The result is investment without impact. Galoras diagnostics exist to make sure every intervention is aimed at the right target.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                icon: Target,
                title: "Focus Intervention",
                description: "Know exactly where the performance gap is before deciding what to do about it.",
              },
              {
                icon: TrendingUp,
                title: "Measure Progress",
                description: "Establish a baseline so improvements are visible and demonstrable over time.",
              },
              {
                icon: Zap,
                title: "Drive Action",
                description: "Findings are sequenced and prioritised so you know what to address first.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diagnostic Types */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Our Diagnostics
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each diagnostic is focused on execution capability and not generic culture or engagement metrics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diagnostics.map((item, i) => (
              <Card key={i} className="group hover:border-primary/50 transition-all card-hover">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{item.description}</p>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Includes</p>
                    {item.deliverables.map((d, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <Zap className="h-3 w-3 text-primary shrink-0" />
                        {d}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="space-y-8">
              {process.map((item, i) => (
                <div key={i} className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-zinc-950 font-bold shrink-0">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-lg font-display font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-zinc-950">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Know What's Actually Holding You Back
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Start with a conversation. We'll help you identify the right diagnostic for your organisation's situation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold">
                Book a Consultation
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
