import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  BarChart3, 
  Target, 
  Users,
  Zap,
  Brain,
  TrendingUp,
  Shield,
  FileText
} from "lucide-react";

const assessments = [
  {
    icon: Users,
    title: "Culture Assessment",
    description: "Measure your organization's culture across key dimensions and identify gaps between current and desired state.",
    deliverables: ["Culture survey", "Focus groups", "Gap analysis report", "Action recommendations"],
  },
  {
    icon: Target,
    title: "Leadership 360",
    description: "Comprehensive multi-rater feedback for individual leaders with coaching to drive development.",
    deliverables: ["360 feedback survey", "Detailed report", "Debrief session", "Development plan"],
  },
  {
    icon: Brain,
    title: "Team Effectiveness",
    description: "Assess how well your team functions and identify specific behaviors to strengthen performance.",
    deliverables: ["Team survey", "Team debrief session", "Strength mapping", "Improvement roadmap"],
  },
  {
    icon: TrendingUp,
    title: "Engagement Pulse",
    description: "Quick, regular check-ins on employee engagement to track trends and address issues early.",
    deliverables: ["Pulse surveys", "Trend dashboards", "Manager reports", "Action planning"],
  },
  {
    icon: Shield,
    title: "Psychological Safety",
    description: "Measure the level of psychological safety in teams and develop strategies to increase it.",
    deliverables: ["Safety assessment", "Team workshops", "Leadership coaching", "Progress tracking"],
  },
  {
    icon: FileText,
    title: "Skills Gap Analysis",
    description: "Identify capability gaps across your organization and prioritize learning investments.",
    deliverables: ["Skills inventory", "Gap analysis", "Learning roadmap", "ROI projections"],
  },
];

const process = [
  {
    step: 1,
    title: "Scope & Design",
    description: "We work with you to define objectives, select instruments, and customize for your context.",
  },
  {
    step: 2,
    title: "Data Collection",
    description: "Deploy surveys, conduct interviews, and gather qualitative insights from key stakeholders.",
  },
  {
    step: 3,
    title: "Analysis & Insights",
    description: "Our experts analyze the data to identify patterns, strengths, and opportunities.",
  },
  {
    step: 4,
    title: "Recommendations",
    description: "Receive a detailed report with prioritized, actionable recommendations.",
  },
  {
    step: 5,
    title: "Action Planning",
    description: "Work with our team to develop and implement your improvement roadmap.",
  },
];

export default function Diagnostics() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <BarChart3 className="h-4 w-4" />
              Data-Driven Insights
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Organizational <span className="text-gradient">Diagnostics</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Evidence-based assessments that reveal what's working, what's not, 
              and where to focus for maximum impact.
            </p>
            <Link to="/contact">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Start Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Diagnostics */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Measure?
            </h2>
            <p className="text-muted-foreground text-lg">
              You can't improve what you don't measure. Our diagnostics give you the 
              clarity and data you need to make informed decisions about where to invest 
              in your people and culture.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Target, title: "Focus", description: "Know exactly where to direct limited resources for maximum impact." },
              { icon: TrendingUp, title: "Track", description: "Measure progress over time and demonstrate ROI on your investments." },
              { icon: Zap, title: "Act", description: "Move from hunches to data-driven action plans that get results." },
            ].map((item, index) => (
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

      {/* Assessment Types */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Our Assessments
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Validated instruments and methodologies tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assessments.map((assessment, index) => (
              <Card key={index} className="group hover:border-primary/50 transition-all card-hover">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <assessment.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">{assessment.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{assessment.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Includes:</p>
                    {assessment.deliverables.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Zap className="h-3 w-3 text-primary shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
              Our Process
            </h2>
            <div className="space-y-6">
              {process.map((item, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                    {item.step}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-lg font-display font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding hero-gradient">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready for Clarity?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Start with a conversation about your organization's needs.
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
