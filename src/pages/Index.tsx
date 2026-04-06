import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { FounderVideoModal } from "@/components/FounderVideoModal";
import { FeaturedCoaches } from "@/components/FeaturedCoaches";
import { HowItWorks } from "@/components/HowItWorks";
import { ArrowRight, Compass, Zap, Target, Brain, MessageCircle, TrendingUp } from "lucide-react";

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
              Remove the Shackles. Unlock{" "}
              <span className="text-gradient">Performance</span>
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

      <FeaturedCoaches />
      <HowItWorks />

      {/* How Galoras Delivers The Sport of Business */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How Galoras Delivers The Sport of Business
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <h3 className="text-xl font-display font-semibold mb-2">The Sport of Business</h3>
              <p className="text-sm text-primary font-medium mb-4">The performance framework</p>
              <p className="text-muted-foreground">
                Treats leadership teams as performance units, not individuals.
              </p>
            </div>
            
            {/* Column 2 */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <h3 className="text-xl font-display font-semibold mb-2">Proven Methodology</h3>
              <p className="text-sm text-primary font-medium mb-4">Under the hood</p>
              <p className="text-muted-foreground">
                Data-driven diagnostics and sequenced interventions grounded in behavioral science.
              </p>
            </div>
            
            {/* Column 3 */}
            <div className="p-8 rounded-2xl bg-card border border-border">
              <h3 className="text-xl font-display font-semibold mb-2">Leadership Labs</h3>
              <p className="text-sm text-primary font-medium mb-4">How teams experience it</p>
              <p className="text-muted-foreground">
                Immersive, facilitated working sessions that install alignment, clarity, and execution discipline.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link to="/business">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Explore Galoras for Business
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Stop Navigating It Alone</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Every high-performer has blind spots. Galoras connects you with a coach who's been in the room — to help you lead with more clarity, confidence, and impact.
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
