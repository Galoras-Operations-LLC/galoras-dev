import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Users, 
  Target, 
  Brain,
  Zap,
  MessageCircle,
  Shield,
  TrendingUp,
  Calendar
} from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Peer Learning",
    description: "Learn from leaders facing similar challenges across different industries and contexts.",
  },
  {
    icon: Shield,
    title: "Confidential Space",
    description: "A safe environment to discuss challenges you can't share with your own team.",
  },
  {
    icon: Brain,
    title: "Fresh Perspectives",
    description: "Break out of your bubble with diverse viewpoints and proven strategies.",
  },
  {
    icon: MessageCircle,
    title: "Accountability",
    description: "Commit to action and report back to peers who hold you to your word.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Growth",
    description: "Monthly sessions create consistent momentum in your leadership development.",
  },
  {
    icon: Target,
    title: "Real Solutions",
    description: "Work through actual challenges with facilitated problem-solving frameworks.",
  },
];

const circleTypes = [
  {
    title: "Executive Circle",
    level: "C-Suite & SVPs",
    size: "8-12 members",
    description: "For senior executives navigating strategic decisions and organizational transformation.",
    topics: ["Strategic leadership", "Board dynamics", "Organizational change", "Legacy building"],
  },
  {
    title: "Rising Leaders Circle",
    level: "Directors & VPs",
    size: "10-14 members",
    description: "For high-potential leaders preparing for their next level of responsibility.",
    topics: ["Executive presence", "Cross-functional leadership", "Influence without authority", "Career acceleration"],
  },
  {
    title: "Founder Circle",
    level: "Founders & CEOs",
    size: "8-10 members",
    description: "For entrepreneurs navigating the unique challenges of building and scaling companies.",
    topics: ["Fundraising", "Team building", "Product-market fit", "Founder wellbeing"],
  },
];

export default function LeadershipCircles() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80"
            alt="Executive team in discussion"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-background/80" />
        </div>
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Users className="h-4 w-4" />
              Peer-Based Development
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              <span className="text-gradient">Leadership Circles</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Join a curated group of peers for monthly facilitated sessions 
              that accelerate your growth through shared wisdom and accountability.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Apply to Join a Circle
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Join a Circle?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Leadership can be lonely. Circles provide the community and challenge you need to grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all card-hover">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Circle Types */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Find Your Circle
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We match you with peers at similar stages facing relevant challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {circleTypes.map((circle, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-primary font-medium">{circle.level}</span>
                    <span className="text-xs text-muted-foreground">{circle.size}</span>
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-3">{circle.title}</h3>
                  <p className="text-muted-foreground mb-6">{circle.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Common topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {circle.topics.map((topic, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
              How Circles Work
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">1</div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">Apply & Match</h3>
                    <p className="text-sm text-muted-foreground">Complete your profile and we'll match you with the right circle.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">2</div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">Monthly Sessions</h3>
                    <p className="text-sm text-muted-foreground">Join 2-hour facilitated sessions with your peer group each month.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">3</div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">Hot Seat Rotations</h3>
                    <p className="text-sm text-muted-foreground">Take turns presenting challenges for group problem-solving.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">4</div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">Action & Accountability</h3>
                    <p className="text-sm text-muted-foreground">Commit to specific actions and report back on progress.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding hero-gradient">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Find Your People
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join a community of leaders committed to growth. Limited spots available.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Apply Now
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
