import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  Target,
  Brain,
  MessageCircle,
  Shield,
  TrendingUp,
} from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Operators Learning from Operators",
    description:
      "Every member has been at the level you're operating at. Conversations go deeper because context is shared — not explained.",
  },
  {
    icon: Shield,
    title: "A Confidential Sounding Board",
    description:
      "Challenges you can't bring to your board, your team, or your investors. A circle gives you experienced peers who have no agenda except your performance.",
  },
  {
    icon: Brain,
    title: "Pressure-Tested Perspectives",
    description:
      "Cross-industry, cross-context insight from leaders who have navigated similar constraints. Not theory — experience.",
  },
  {
    icon: MessageCircle,
    title: "Real Accountability",
    description:
      "Commit to decisions and actions in front of peers who will ask you what happened. The kind of accountability that actually changes behaviour.",
  },
  {
    icon: TrendingUp,
    title: "Compounding Over Time",
    description:
      "Monthly sessions build a shared operating history with your circle. The depth of conversation in month eight is not possible in month one.",
  },
  {
    icon: Target,
    title: "Structured Problem-Solving",
    description:
      "Facilitated hot seat sessions bring your actual challenges to a group of people who have solved similar ones. You leave with a clearer path forward.",
  },
];

const circleTypes = [
  {
    title: "Executive Circle",
    level: "C-Suite & Senior Leaders",
    size: "8–12 members",
    description:
      "For senior executives operating at the top of complex organisations — navigating board relationships, strategic transformation, and the weight of decisions that affect hundreds of people.",
    topics: [
      "Execution under pressure",
      "Organisational alignment",
      "Board and stakeholder dynamics",
      "Leadership succession",
    ],
  },
  {
    title: "Rising Leaders Circle",
    level: "Directors & VPs",
    size: "10–14 members",
    description:
      "For high-potential leaders stepping into expanded accountability — developing the executive presence, cross-functional authority, and decision discipline their next role demands.",
    topics: [
      "Executive presence",
      "Influence without authority",
      "Managing upward",
      "Career acceleration",
    ],
  },
  {
    title: "Founder Circle",
    level: "Founders & CEOs",
    size: "8–10 members",
    description:
      "For founders who have moved past early stage and are navigating the harder problems — scaling teams, commercial pressure, and the personal cost of building something significant.",
    topics: [
      "Scaling without losing culture",
      "Commercial execution",
      "Leadership under scrutiny",
      "Founder performance",
    ],
  },
];

export default function LeadershipCircles() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-zinc-950">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.10),transparent_55%)]" />

        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              Galoras — Peer-Led Development
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase mb-6">
              Leadership{" "}
              <span className="text-gradient">Circles</span>
            </h1>
            <p className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto mb-4">
              The best operators learn from each other. Leadership Circles bring together executives who have operated at similar levels — for honest conversation, shared accountability, and cross-pollination of real experience.
            </p>
            <p className="text-zinc-500 text-base max-w-xl mx-auto mb-10">
              Monthly facilitated sessions. Small groups. People who understand what you're navigating because they've been there.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold">
                Apply to Join a Circle
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              What a Circle Gives <span className="text-gradient">You</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Not another network. Not another programme. A small group of people who hold you to a higher standard.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <Card key={i} className="group hover:border-primary/50 transition-all card-hover">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Circle Types */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Find Your <span className="text-gradient">Circle</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Circles are matched by operating level and context — so every conversation in the room is relevant to every person in it.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {circleTypes.map((circle, i) => (
              <Card key={i} className="hover:border-primary/50 transition-all">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm text-primary font-semibold">{circle.level}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{circle.size}</span>
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-3">{circle.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{circle.description}</p>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Typical focus areas</p>
                    <div className="flex flex-wrap gap-2">
                      {circle.topics.map((topic, j) => (
                        <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
              How Circles <span className="text-gradient">Work</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  step: 1,
                  title: "Apply & Match",
                  desc: "Tell us your operating level and context. We match you with a circle where your experience is both relevant and challenged.",
                },
                {
                  step: 2,
                  title: "Monthly Sessions",
                  desc: "Two-hour facilitated sessions with your peer group. Structured agenda. Real conversations. No PowerPoint.",
                },
                {
                  step: 3,
                  title: "Hot Seat Rotations",
                  desc: "Bring a real challenge to the group. Receive structured input from peers who have navigated similar terrain.",
                },
                {
                  step: 4,
                  title: "Accountability Between Sessions",
                  desc: "Commit to specific decisions and actions. Your circle follows up. The accountability is what makes it real.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-zinc-950 font-bold shrink-0 text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
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
            The People in the Room <span className="text-gradient">Matter</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Circles are small by design. Spots are limited. Tell us where you are and we'll find the right fit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold">
                Apply Now
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
