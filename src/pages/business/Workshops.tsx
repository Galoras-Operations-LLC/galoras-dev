import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Lightbulb, 
  Target, 
  MessageCircle,
  Zap,
  Users,
  Clock,
  Brain,
  TrendingUp
} from "lucide-react";

const workshops = [
  {
    icon: MessageCircle,
    title: "Executive Communication",
    duration: "Half-day",
    description: "Master the art of clear, compelling communication that inspires action and builds trust.",
    outcomes: ["Craft compelling narratives", "Present with confidence", "Navigate difficult conversations"],
  },
  {
    icon: Brain,
    title: "Strategic Thinking",
    duration: "Full-day",
    description: "Develop the mental models and frameworks used by world-class strategists.",
    outcomes: ["Systems thinking", "Scenario planning", "Decision-making under uncertainty"],
  },
  {
    icon: Users,
    title: "Team Dynamics",
    duration: "Full-day",
    description: "Build trust, improve collaboration, and create psychological safety within your team.",
    outcomes: ["Trust-building exercises", "Conflict resolution", "Feedback cultures"],
  },
  {
    icon: Target,
    title: "Goal Setting & OKRs",
    duration: "Half-day",
    description: "Implement effective goal-setting systems that drive alignment and accountability.",
    outcomes: ["OKR methodology", "Cascading goals", "Progress tracking"],
  },
  {
    icon: Zap,
    title: "High-Performance Habits",
    duration: "Full-day",
    description: "Build the daily routines and practices that sustain excellence over time.",
    outcomes: ["Energy management", "Focus techniques", "Recovery strategies"],
  },
  {
    icon: TrendingUp,
    title: "Change Leadership",
    duration: "Two-day",
    description: "Lead organizational change with confidence and bring your people along.",
    outcomes: ["Change frameworks", "Stakeholder management", "Resistance handling"],
  },
];

const formats = [
  {
    title: "In-Person",
    description: "Immersive, hands-on experience at your location or our partner venues.",
    features: ["Interactive exercises", "Team bonding", "Immediate application"],
  },
  {
    title: "Virtual",
    description: "Engaging online sessions designed for distributed teams.",
    features: ["Breakout rooms", "Digital whiteboards", "Flexible scheduling"],
  },
  {
    title: "Hybrid",
    description: "Combine in-person and virtual participants seamlessly.",
    features: ["Inclusive experience", "Tech-enabled facilitation", "Global reach"],
  },
];

export default function Workshops() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=80"
            alt="Interactive workshop session"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-background/80" />
        </div>
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Lightbulb className="h-4 w-4" />
              Interactive Learning
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              <span className="text-gradient">Workshops & Training</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Engaging, practical workshops that build capabilities and drive immediate impact. 
              Customized for your team's specific needs and challenges.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Request Workshop
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Workshop Catalog */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Workshop Catalog
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose from our proven programs or work with us to create something custom.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {workshops.map((workshop, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <workshop.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {workshop.duration}
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">{workshop.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{workshop.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Key outcomes:</p>
                    {workshop.outcomes.map((outcome, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Zap className="h-3 w-3 text-primary shrink-0" />
                        {outcome}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Formats */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Flexible Delivery
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We meet your team where they are with multiple delivery options.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {formats.map((format, index) => (
              <Card key={index}>
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-display font-semibold mb-3">{format.title}</h3>
                  <p className="text-muted-foreground mb-6">{format.description}</p>
                  <ul className="space-y-2">
                    {format.features.map((feature, i) => (
                      <li key={i} className="flex items-center justify-center gap-2 text-sm">
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

      {/* Custom Workshops */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Custom Workshops
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Don't see exactly what you need? We specialize in designing custom workshops 
                  tailored to your organization's specific challenges and culture.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Needs assessment to understand your goals",
                    "Custom content design by expert facilitators",
                    "Branded materials and frameworks",
                    "Follow-up coaching and reinforcement",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Discuss Custom Workshop
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=600&q=80"
                  alt="Custom workshop facilitation"
                  className="aspect-square rounded-2xl object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding hero-gradient">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Invest in Your Team's Growth
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Let's design a workshop experience that drives real results.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Request Workshop
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/business">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                View All Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
