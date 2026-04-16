import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Target,
  Heart,
  Users,
  Zap,
  Shield,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

const values = [
  {
    icon: TrendingUp,
    title: "Growth",
    description: "We believe growth is a discipline, not a destination. Everyone on the platform — coach and client — is committed to getting better.",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "We are built for people operating under real pressure. Results matter. We measure what actually moves.",
  },
  {
    icon: Shield,
    title: "Trust",
    description: "Every coach on Galoras is vetted. Every engagement is confidential. Trust is the foundation everything else is built on.",
  },
  {
    icon: Heart,
    title: "Connection",
    description: "We make connection a daily habit, not an afterthought. The right relationship between coach and client changes everything.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We use technology to enhance the coaching experience — not replace the human at the centre of it.",
  },
  {
    icon: Users,
    title: "Ambition",
    description: "We back people who want more — more clarity, more capability, more impact. Ambition is not optional here.",
  },
];

const team = [
  {
    name: "Mitesh Kapadia",
    role: "Executive Performance Coach",
    bio: "Coached 1,000+ Directors and VPs at Apple, Google, Cisco, and Fortune 500 companies. Focused on making leadership capability visible, deployable, and career-defining.",
  },
  {
    name: "Barnes Lam",
    role: "Execution Advisor for Founders & CEOs",
    bio: "30+ years across telecom, SaaS, and AI — including APAC Business Development at BlackBerry. Works with founders and CEOs when growth has stalled and the reasons are not obvious.",
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_55%)]" />
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              About Galoras
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white uppercase mb-6">
              One Ecosystem.{" "}
              <span className="text-primary">One Standard.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              To make connection a daily habit, not an afterthought, in the modern workplace.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-zinc-900">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Vision</p>
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-4">
                Why We Exist
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                The most successful people in the world — athletes, executives, founders — all have coaches. Access to that level of support has always been limited to the few. Galoras changes that.
              </p>
              <p className="text-zinc-400 mt-4 leading-relaxed">
                We are building a performance-led coaching exchange where real coaches with proven track records are identified, vetted, and deployed to the people and organisations that need them most.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Mission</p>
              <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight mb-6">
                How We Get There
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">25</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Establish</p>
                    <p className="text-zinc-400 text-sm">Create the foundation, brand, and core community platform.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">26</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Launch</p>
                    <p className="text-zinc-400 text-sm">Bring the platform live with coaching enablement and community features.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">27</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Scale</p>
                    <p className="text-zinc-400 text-sm">Expand reach, grow the user base, and deepen engagement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-zinc-950">
        <div className="container-wide">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">What We Stand For</p>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight mb-4">
              Our Values
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Growth. Performance. Trust. Connection. Innovation. Ambition.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="bg-zinc-900 border-zinc-700 hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-zinc-900">
        <div className="container-wide">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">The People Behind It</p>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight mb-4">
              Leadership
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Experienced operators who have been in the room where it happens.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member) => (
              <Card key={member.name} className="bg-zinc-950 border-zinc-700 text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    <span className="text-xl font-display font-bold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-base font-display font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-xs text-primary mb-3 font-semibold uppercase tracking-wide">{member.role}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-800">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight mb-4">
            Join the Galoras Ecosystem
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Whether you're seeking a coach or ready to become one — the standard is the same.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/coaching">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Find a Coach
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/apply">
              <Button size="lg" variant="outline" className="border-zinc-600 text-white hover:bg-zinc-800">
                Apply as a Coach
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
