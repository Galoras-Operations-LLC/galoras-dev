import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  FlaskConical, 
  Brain, 
  Target, 
  Zap,
  BarChart3,
  Clock,
  Users,
  Lightbulb,
  Rocket
} from "lucide-react";

const programs = [
  {
    icon: Zap,
    title: "Peak Performance Lab",
    duration: "8 weeks",
    description: "Intensive program for executives and high-performers looking to break through plateaus and reach new heights.",
    highlights: ["Weekly 1:1 coaching", "Performance assessments", "Personalized action plans", "Peer accountability groups"],
  },
  {
    icon: Brain,
    title: "Leadership Accelerator",
    duration: "12 weeks",
    description: "Develop the mindset and skills of world-class leaders through immersive coaching and real-world application.",
    highlights: ["360° leadership assessment", "Executive coaching", "Leadership simulations", "Strategic thinking workshops"],
  },
  {
    icon: Target,
    title: "Career Catalyst",
    duration: "6 weeks",
    description: "Fast-track your career transition or advancement with focused coaching and strategic career planning.",
    highlights: ["Career clarity sessions", "Personal branding", "Interview mastery", "Negotiation coaching"],
  },
  {
    icon: Lightbulb,
    title: "Founder's Mindset",
    duration: "10 weeks",
    description: "Build the mental resilience and strategic clarity needed to scale your startup and lead through uncertainty.",
    highlights: ["Founder coaching", "Decision-making frameworks", "Stress management", "Vision alignment"],
  },
];

const methodology = [
  {
    icon: BarChart3,
    title: "Diagnostic Assessment",
    description: "We start with comprehensive assessments to understand your current state and identify growth opportunities.",
  },
  {
    icon: Target,
    title: "Goal Architecture",
    description: "Design a clear roadmap with measurable milestones tailored to your unique objectives.",
  },
  {
    icon: Users,
    title: "Expert Coaching",
    description: "Work with elite coaches who specialize in high-performance development.",
  },
  {
    icon: Rocket,
    title: "Sustained Transformation",
    description: "Build lasting habits and systems that continue to drive growth long after the program ends.",
  },
];

export default function Labs() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?q=80&w=1920&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <FlaskConical className="h-4 w-4" />
              Intensive Transformation Programs
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              <span className="text-gradient">Performance Labs</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Structured, intensive coaching programs designed to accelerate your growth and deliver measurable transformation in weeks, not years.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/apply">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                  Apply to a Program
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Our Programs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the intensive that matches your growth goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all card-hover">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <program.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {program.duration}
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-2">{program.title}</h3>
                  <p className="text-muted-foreground mb-6">{program.description}</p>
                  <ul className="space-y-2 mb-6">
                    {program.highlights.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Zap className="h-3 w-3 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/apply">
                    <Button variant="outline" className="w-full border-primary/50 hover:bg-primary/10">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Our Methodology
            </h2>
            <p className="text-muted-foreground text-lg">
              A proven framework for accelerated transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {methodology.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding hero-gradient">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready for Transformation?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Apply today and start your journey toward peak performance.
          </p>
          <Link to="/apply">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
