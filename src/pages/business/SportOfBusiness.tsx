import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { 
  ArrowRight, 
  Trophy, 
  Target, 
  Brain,
  Zap,
  Users,
  Clock,
  BarChart3,
  Shield
} from "lucide-react";

const principles = [
  {
    icon: Brain,
    title: "Mental Performance",
    description: "Train your mind like elite athletes. Develop focus, resilience, and the ability to perform under pressure.",
  },
  {
    icon: Target,
    title: "Goal Architecture",
    description: "Create clear, measurable objectives with the same precision used in Olympic training programs.",
  },
  {
    icon: Users,
    title: "Team Cohesion",
    description: "Build the trust and communication that championship teams rely on to achieve the impossible.",
  },
  {
    icon: Zap,
    title: "Peak State Management",
    description: "Learn to access your optimal performance state on demand, just like elite performers.",
  },
  {
    icon: Shield,
    title: "Competitive Advantage",
    description: "Develop the strategic thinking and execution discipline that separates winners from the rest.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Use data-driven insights to track progress and optimize performance continuously.",
  },
];

const formats = [
  {
    title: "Executive Intensive",
    duration: "2-Day Program",
    description: "Deep-dive experience for senior leaders seeking transformational growth.",
    features: ["360° assessment", "1:1 coaching", "Personalized playbook", "90-day follow-up"],
  },
  {
    title: "Team Accelerator",
    duration: "6-Week Program",
    description: "Transform your leadership team into a high-performing unit.",
    features: ["Weekly team sessions", "Individual coaching", "Team challenges", "Performance metrics"],
  },
  {
    title: "Organization-Wide",
    duration: "Custom Duration",
    description: "Scale the Sport of Business mindset across your entire company.",
    features: ["Train-the-trainer", "Custom curriculum", "Culture integration", "Ongoing support"],
  },
];

export default function SportOfBusiness() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <OptimizedImage
            src="https://images.unsplash.com/photo-1461896836934- voices-db48f1d?w=1920&q=80"
            alt="Athletic performance and focus"
            className="w-full h-full"
            overlay
          />
          <div className="absolute inset-0 bg-background/75" />
        </div>
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Trophy className="h-4 w-4" />
              Flagship Program
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              The <span className="text-gradient">Sport of Business</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Apply the mindset, discipline, and performance principles of elite athletes 
              to build winning business teams and cultures.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Request Program Details
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              What Elite Athletes Know
            </h2>
            <p className="text-muted-foreground text-lg">
              The world's best athletes don't just train harder—they train smarter. 
              They've mastered the mental game, team dynamics, and performance optimization 
              that most business leaders never learn. Until now.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {principles.map((principle, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all card-hover">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <principle.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">{principle.title}</h3>
                  <p className="text-muted-foreground">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Program Formats */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Program Formats
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the format that fits your organization's needs and timeline.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {formats.map((format, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 text-sm text-primary mb-4">
                    <Clock className="h-4 w-4" />
                    {format.duration}
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-3">{format.title}</h3>
                  <p className="text-muted-foreground mb-6">{format.description}</p>
                  <ul className="space-y-2">
                    {format.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
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

      {/* Results */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Results That Speak
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Organizations that embrace the Sport of Business methodology see measurable improvements across key performance indicators.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "47%", label: "Increase in team performance" },
                  { value: "62%", label: "Improvement in decision-making speed" },
                  { value: "38%", label: "Reduction in leadership turnover" },
                  { value: "89%", label: "Participant satisfaction rate" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl font-display font-bold text-primary">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <OptimizedImage
                src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80"
                alt="Athletes celebrating victory"
                aspectRatio="video"
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding hero-gradient">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Play at the Highest Level?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Let's discuss how the Sport of Business can transform your organization.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Schedule Consultation
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
