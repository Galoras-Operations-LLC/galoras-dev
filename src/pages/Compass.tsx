import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Compass as CompassIcon, 
  Brain, 
  BarChart3, 
  Target, 
  Zap,
  Users,
  TrendingUp,
  Shield,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Advanced algorithms analyze your goals, personality, and preferences to find the perfect coach match.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Visualize your growth with intuitive dashboards that track goals, sessions, and behavioral shifts.",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Define and refine objectives with smart goal frameworks that keep you focused and accountable.",
  },
  {
    icon: Sparkles,
    title: "Behavioral Insights",
    description: "Discover patterns in your thinking and behavior with AI-generated insights after each session.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and protected. You control what's shared and what stays private.",
  },
  {
    icon: TrendingUp,
    title: "Growth Analytics",
    description: "Measure ROI on your coaching investment with quantifiable progress indicators.",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Complete Your Profile",
    description: "Answer questions about your goals, challenges, and preferred coaching style.",
  },
  {
    step: 2,
    title: "Get AI Recommendations",
    description: "Compass analyzes your profile and suggests coaches optimized for your success.",
  },
  {
    step: 3,
    title: "Track Your Journey",
    description: "Log sessions, set milestones, and watch your progress unfold over time.",
  },
  {
    step: 4,
    title: "Refine & Optimize",
    description: "AI learns from your feedback to continuously improve recommendations.",
  },
];

export default function Compass() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.1),transparent_50%)]" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <CompassIcon className="h-4 w-4" />
              AI-Powered Coaching Intelligence
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Meet <span className="text-gradient">Compass AI</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Your intelligent guide to finding the right coach, tracking progress, and maximizing the impact of your coaching journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/coaching/matching">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                  Try Compass Matching
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/coaching">
                <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                  Browse Coaches
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Intelligent Features for Your Growth
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Compass combines cutting-edge AI with proven coaching methodologies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all card-hover">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How Compass Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Four simple steps to AI-enhanced coaching success.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-display font-bold text-primary">{item.step}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Organizations */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Users className="h-4 w-4" />
                For Organizations
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Compass for Enterprise
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Unlock coaching at scale with Compass Enterprise. Manage coaching programs, track team development, and measure organizational ROI.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Centralized coaching program management",
                  "Team-wide progress dashboards",
                  "Custom matching algorithms for your culture",
                  "Integration with HR systems",
                  "Aggregate analytics and reporting",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/business">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Learn About Enterprise
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                <CompassIcon className="h-32 w-32 text-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding hero-gradient">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Start Your AI-Guided Journey
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Let Compass find your perfect coach match in minutes.
          </p>
          <Link to="/coaching/matching">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
              Get Started with Compass
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
