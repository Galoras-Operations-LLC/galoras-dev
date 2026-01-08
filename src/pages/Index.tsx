import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ArrowRight, Users, Building2, Compass, Zap, Target, Brain, MessageCircle, TrendingUp } from "lucide-react";

const pillars = [
  {
    icon: Users,
    title: "Coaching Exchange",
    description: "Find vetted, elite coaches for leadership, career, performance, and life transitions.",
    href: "/coaching",
    cta: "Find My Coach",
  },
  {
    icon: Building2,
    title: "Galoras for Business",
    description: "Bring the clarity and discipline of elite sport into your organization.",
    href: "/business",
    cta: "Explore Programs",
  },
  {
    icon: Compass,
    title: "Compass AI",
    description: "AI-powered matching, behavioral insights, and progress tracking.",
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              Where Human Potential Meets Elite Performance
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6">
              Find the Coach Who Brings Out the{" "}
              <span className="text-gradient">Strongest Version</span> of You
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Galoras connects people and organizations with coaches, experts, and programs that build clarity, confidence, and high-performance habits — powered by Compass AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/coaching">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary text-lg px-8 h-14">
                  Find My Coach
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
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three integrated pillars designed to serve individuals, coaches, and organizations.
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
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Coaching Categories</h2>
            <p className="text-muted-foreground text-lg">Find your focus area</p>
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
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Grow?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Whether you're an individual seeking clarity or an organization building high-performance culture.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/coaching">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Find My Coach
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
