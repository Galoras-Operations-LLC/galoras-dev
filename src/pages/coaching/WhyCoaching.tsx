import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Target, 
  TrendingUp, 
  Brain, 
  Users, 
  Zap,
  CheckCircle,
  Quote,
  BarChart3,
  Lightbulb,
  Heart
} from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Clarity & Focus",
    description: "Cut through the noise and identify what truly matters. A coach helps you define clear goals and create actionable plans.",
  },
  {
    icon: TrendingUp,
    title: "Accelerated Growth",
    description: "Research shows coaching can accelerate professional development by 70%. Don't leave your growth to chance.",
  },
  {
    icon: Brain,
    title: "New Perspectives",
    description: "Break free from limiting beliefs and blind spots. A coach offers objective insights you can't get from within.",
  },
  {
    icon: Users,
    title: "Accountability Partner",
    description: "Stay committed to your goals with someone invested in your success. Regular check-ins keep you on track.",
  },
  {
    icon: Zap,
    title: "Peak Performance",
    description: "Like elite athletes, top performers have coaches. Unlock your full potential with expert guidance.",
  },
  {
    icon: Heart,
    title: "Work-Life Integration",
    description: "Achieve sustainable success without burning out. Find the balance that works for your whole life.",
  },
];

const stats = [
  { value: "86%", label: "of companies report positive ROI from coaching" },
  { value: "70%", label: "improvement in work performance" },
  { value: "80%", label: "boost in self-confidence" },
  { value: "73%", label: "improvement in relationships" },
];

const testimonials = [
  {
    quote: "Working with a coach transformed how I lead. I went from reactive to strategic in just three months.",
    author: "Sarah K.",
    role: "VP of Engineering",
  },
  {
    quote: "I was skeptical at first, but coaching helped me land my dream job and negotiate a 40% salary increase.",
    author: "Michael T.",
    role: "Product Manager",
  },
  {
    quote: "My coach helped me see patterns I'd been blind to for years. It was like finally having the right glasses.",
    author: "Elena R.",
    role: "Founder & CEO",
  },
];

export default function WhyCoaching() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Why <span className="text-gradient">Coaching</span> Works
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              The world's most successful people have coaches. Here's why investing in coaching 
              is the smartest decision you can make for your career and life.
            </p>
            <Link to="/coaching/matching">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Find Your Coach
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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

      {/* Benefits Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              The Coaching Advantage
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Coaching isn't therapy, consulting, or mentoring. It's a unique partnership designed to unlock your potential.
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

      {/* What Coaching Is / Isn't */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
              What Coaching Is & Isn't
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="p-6">
                  <h3 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Coaching IS
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "A partnership focused on your goals",
                      "Forward-looking and action-oriented",
                      "About unlocking YOUR answers",
                      "Structured with accountability",
                      "Confidential and judgment-free",
                      "Tailored to your unique situation",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="p-6">
                  <h3 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 text-xs font-bold">✕</span>
                    Coaching is NOT
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Therapy or mental health treatment",
                      "Someone telling you what to do",
                      "A quick fix or magic solution",
                      "Only for people who are struggling",
                      "About the coach's agenda",
                      "A one-size-fits-all approach",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-4 h-4 rounded-full border border-red-500/50 flex items-center justify-center text-red-500 text-xs mt-0.5 shrink-0">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Real Results, Real People
            </h2>
            <p className="text-muted-foreground text-lg">
              Hear from people who've transformed their lives through coaching.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-6 pt-8">
                  <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/20" />
                  <p className="text-muted-foreground italic mb-6 relative z-10">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
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
              How Galoras Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Finding the right coach is simple with our AI-powered matching.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: 1,
                  icon: Lightbulb,
                  title: "Share Your Goals",
                  description: "Tell us what you want to achieve. Our matching questionnaire takes just 5 minutes.",
                },
                {
                  step: 2,
                  icon: BarChart3,
                  title: "Get Matched",
                  description: "Compass AI analyzes your needs and matches you with coaches who fit your style and goals.",
                },
                {
                  step: 3,
                  icon: Zap,
                  title: "Start Growing",
                  description: "Book a chemistry call, then begin your transformation with regular coaching sessions.",
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding hero-gradient">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Invest in Yourself?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join thousands of professionals who've accelerated their growth with the right coach.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/coaching/matching">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Find My Coach Match
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/coaching">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                Browse All Coaches
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}