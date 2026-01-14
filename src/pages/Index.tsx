import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { FounderVideoModal } from "@/components/FounderVideoModal";
import { ArrowRight, Users, Building2, Compass, Zap, Target, Brain, MessageCircle, TrendingUp } from "lucide-react";

const pillars = [
  {
    icon: Users,
    title: "Coaching Exchange",
    description: "A performance-led selection system that surfaces coaches with demonstrated execution experience — not just polished profiles.",
    href: "/coaching",
    cta: "Explore the Exchange",
  },
  {
    icon: Building2,
    title: "Galoras for Business",
    description: "Access execution-ready coaches and operators who have performed under real organizational pressure — without relying on reputation or guesswork.",
    href: "/business",
    cta: "Explore Programs",
  },
  {
    icon: Compass,
    title: "Compass AI",
    description: "Decision-support infrastructure that strengthens signal quality, tracks progress, and supports evidence-based coaching deployment.",
    href: "/compass",
    cta: "See How It Works",
  },
];

const categories = [
  { icon: Target, name: "Leadership", slug: "leadership" },
  { icon: TrendingUp, name: "Career", slug: "career" },
  { icon: Zap, name: "Performance", slug: "performance" },
  { icon: Brain, name: "Mindset", slug: "mindset" },
  { icon: MessageCircle, name: "Communication", slug: "communication" },
  { icon: Compass, name: "Transitions", slug: "transitions" },
];

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
          <div className="max-w-4xl mx-auto text-center stagger-children">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Where Coaching Is Evaluated by{" "}
              <span className="text-gradient">Performance</span> Rather Than Reputation
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Galoras connects individuals and organizations with proven performance expertise, quickly, intelligently and at scale.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/coaching">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary text-lg px-8 h-14">
                  Explore the Coaching Exchange
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/business">
                <Button size="lg" variant="outline" className="border-primary/50 text-foreground hover:bg-primary/10 text-lg px-8 h-14">
                  Galoras for Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">The Galoras Ecosystem</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Three integrated pillars designed to identify, validate, and deploy coaching capability across individual, group, and enterprise environments.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <Link
                key={pillar.title}
                to={pillar.href}
                className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <pillar.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-3">{pillar.title}</h3>
                  <p className="text-muted-foreground mb-6">{pillar.description}</p>
                  <span className="inline-flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                    {pillar.cta}
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Performance Domains</h2>
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
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready for Proven Execution Support?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Whether you're an individual navigating complexity or an organization operating under scale and pressure, Galoras is designed to surface coaching capability that performs in real conditions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/coaching">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Explore the Coaching Exchange
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
