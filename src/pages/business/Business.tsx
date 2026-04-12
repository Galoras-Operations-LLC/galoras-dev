import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Building2, 
  Trophy, 
  Users, 
  Target,
  BarChart3,
  Lightbulb,
  Zap,
  Brain
} from "lucide-react";

const offerings = [
  {
    icon: Trophy,
    title: "Sport of Business",
    description: "Apply elite athlete mindset and performance principles to your business culture.",
    href: "/business/sport-of-business",
    highlights: ["Mental performance training", "Competitive advantage frameworks", "Team cohesion strategies"],
  },
  {
    icon: Users,
    title: "Leadership Circles",
    description: "Peer-based leadership development for executives and emerging leaders.",
    href: "/business/leadership-circles",
    highlights: ["Monthly peer sessions", "Executive facilitation", "Cross-industry insights"],
  },
  {
    icon: Lightbulb,
    title: "Workshops & Training",
    description: "Interactive workshops on leadership, communication, and performance.",
    href: "/business/workshops",
    highlights: ["Half-day to multi-day formats", "Custom content design", "Follow-up coaching"],
  },
  {
    icon: BarChart3,
    title: "Organizational Diagnostics",
    description: "Data-driven assessments to identify growth opportunities and challenges.",
    href: "/business/diagnostics",
    highlights: ["Culture assessments", "Leadership 360s", "Team effectiveness surveys"],
  },
];

const stats = [
  { value: "B2B", label: "Enterprise-First Focus" },
  { value: "C-Suite", label: "Leadership Audience" },
  { value: "Real", label: "Vetted Coaches Only" },
  { value: "Data", label: "Performance-Driven" },
];

const logos: string[] = [];

export default function Business() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=1920&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Building2 className="h-4 w-4" />
              Enterprise Solutions
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Galoras for <span className="text-gradient">Business</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground font-medium mb-4">
              The Sport of Business is Galoras' flagship performance framework — helping leadership teams align, decide, and execute under pressure.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Bring the clarity and discipline of elite sport into your organization. 
              Build high-performance teams, develop exceptional leaders, and create winning cultures.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                  Book a Business Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/business/sport-of-business">
                <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                  Explore Programs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Sport of Business Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              The Sport of Business
            </h2>
            <p className="text-lg text-muted-foreground">
              The Sport of Business applies elite performance principles from sport to leadership teams.
              Rather than focusing on individuals, it measures and improves how teams align, decide, and execute together.
            </p>
          </div>
          
          {/* Visual: Alignment → Decision-Making → Execution */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Target className="h-6 w-6 text-primary" />
              <span className="font-display font-semibold">Alignment</span>
            </div>
            <ArrowRight className="h-5 w-5 text-primary hidden md:block" />
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-display font-semibold">Decision-Making</span>
            </div>
            <ArrowRight className="h-5 w-5 text-primary hidden md:block" />
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-display font-semibold">Execution Under Pressure</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offerings Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Our Solutions
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive programs designed to transform organizations and develop exceptional leaders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {offerings.map((offering, index) => (
              <Link key={index} to={offering.href}>
                <Card className="h-full group hover:border-primary/50 transition-all card-hover">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <offering.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-display font-semibold mb-3">{offering.title}</h3>
                    <p className="text-muted-foreground mb-6">{offering.description}</p>
                    <ul className="space-y-2 mb-6">
                      {offering.highlights.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Zap className="h-3 w-3 text-primary shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <span className="inline-flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                      Learn More
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
                A Proven Performance Methodology. Not Guesswork.
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Powered by a data-driven team performance methodology used by enterprise leadership teams globally.
                This methodology underpins Leadership Labs, executive coaching, and enterprise engagements and delivers measurable improvements in speed, clarity, and accountability.
              </p>
              <ul className="space-y-4">
                {[
                  "Team diagnostics that reveal alignment and execution gaps",
                  "Sequenced interventions based on real team data",
                  "Benchmarked insights across teams and organizations",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div 
                className="aspect-square rounded-2xl bg-cover bg-center overflow-hidden"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop')" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Labs Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-lg text-primary font-medium mb-4">
              Leadership Labs are the primary way organizations experience The Sport of Business in practice.
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Leadership Labs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Immersive, facilitated working sessions designed to install alignment, clarity, and execution discipline across your leadership team.
            </p>
          </div>
          <div className="text-center">
            <Link to="/labs">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                Explore Leadership Labs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="section-padding hero-gradient">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Let's discuss how Galoras can help you build a high-performance culture.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
              Book a Business Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
