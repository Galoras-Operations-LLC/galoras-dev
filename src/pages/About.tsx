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
  Globe,
  Award,
  Lightbulb
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We hold ourselves and our coaches to the highest standards of quality and professionalism.",
  },
  {
    icon: Heart,
    title: "Authenticity",
    description: "We believe in genuine connections and honest conversations that drive real transformation.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We foster a supportive ecosystem where coaches and clients grow together.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "We operate with transparency and ethical practices in everything we do.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We leverage technology to enhance the coaching experience while preserving the human connection.",
  },
  {
    icon: Globe,
    title: "Impact",
    description: "We measure success by the positive change we create in people's lives and organizations.",
  },
];

const stats = [
  { value: "500+", label: "Vetted Coaches" },
  { value: "10,000+", label: "Clients Served" },
  { value: "50+", label: "Countries" },
  { value: "98%", label: "Satisfaction Rate" },
];

const team = [
  {
    name: "Alexandra Chen",
    role: "Founder & CEO",
    bio: "Former Olympic athlete turned executive coach with 15+ years of experience in high-performance development.",
  },
  {
    name: "Marcus Williams",
    role: "Head of Coaching",
    bio: "ICF Master Certified Coach with expertise in leadership development and organizational psychology.",
  },
  {
    name: "Sarah Martinez",
    role: "VP of Technology",
    bio: "AI researcher and product leader passionate about using technology to scale human potential.",
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              About <span className="text-gradient">Galoras</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              We're on a mission to democratize access to world-class coaching and help people unlock their full potential.
            </p>
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

      {/* Mission */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Our Mission
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Galoras was born from a simple observation: the most successful people in the world—athletes, executives, entrepreneurs—all have coaches. Yet access to quality coaching has traditionally been limited to the privileged few.
                </p>
                <p className="text-muted-foreground">
                  We're changing that. By combining rigorous coach vetting, AI-powered matching, and technology-enabled delivery, we're making elite coaching accessible to everyone who's committed to growth.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                  <Award className="h-32 w-32 text-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all card-hover">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Leadership Team
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experienced leaders committed to transforming the coaching industry.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl font-display font-bold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding hero-gradient">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Join the Galoras Community
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Whether you're seeking a coach or you are one, we'd love to have you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/coaching">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Find a Coach
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/apply">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                Apply as a Coach
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
