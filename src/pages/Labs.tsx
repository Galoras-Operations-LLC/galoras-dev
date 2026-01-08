import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/labs/CourseCard";
import { 
  ArrowRight, 
  FlaskConical, 
  Brain, 
  Target, 
  Zap,
  BarChart3,
  Users,
  Lightbulb,
  Rocket
} from "lucide-react";

// Sample courses data
const courses = [
  {
    id: "1",
    title: "Executive Leadership Mastery - Building High-Performance Teams",
    category: "Business Coaching",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-02-15"),
    time: "11:00am - 3:00pm",
    location: "Virtual",
    lessonsCount: 10,
    duration: "19h 30m",
    studentsCount: 25,
    coachName: "Coach Elena",
    coachAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
  },
  {
    id: "2",
    title: "Peak Performance Lab - Breaking Through Mental Barriers",
    category: "Performance Coaching",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-02-20"),
    time: "10:00am - 2:00pm",
    location: "New York",
    lessonsCount: 8,
    duration: "16h 00m",
    studentsCount: 20,
    coachName: "Coach Marcus",
    coachAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
  {
    id: "3",
    title: "Career Acceleration Workshop - Navigate Your Next Move",
    category: "Career Coaching",
    imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-03-01"),
    time: "9:00am - 1:00pm",
    location: "Virtual",
    lessonsCount: 6,
    duration: "12h 00m",
    studentsCount: 30,
    coachName: "Coach Sarah",
    coachAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
  },
  {
    id: "4",
    title: "Mindset Transformation - Building Mental Resilience",
    category: "Wellness Coaching",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-03-08"),
    time: "2:00pm - 6:00pm",
    location: "Los Angeles",
    lessonsCount: 12,
    duration: "24h 00m",
    studentsCount: 15,
    coachName: "Coach Aisha",
    coachAvatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
  },
  {
    id: "5",
    title: "Founder's Bootcamp - From Vision to Scale",
    category: "Business Coaching",
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-03-15"),
    time: "10:00am - 4:00pm",
    location: "Virtual",
    lessonsCount: 15,
    duration: "30h 00m",
    studentsCount: 20,
    coachName: "Coach James",
    coachAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
  },
  {
    id: "6",
    title: "Communication Excellence - Executive Presence Workshop",
    category: "Communication",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-03-22"),
    time: "11:00am - 3:00pm",
    location: "Chicago",
    lessonsCount: 8,
    duration: "16h 00m",
    studentsCount: 18,
    coachName: "Coach David",
    coachAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
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
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="container-wide relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <FlaskConical className="h-4 w-4" />
              OUR COURSES
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              <span className="text-gradient">LEADERSHIP</span>{" "}
              <span className="text-primary">LABS</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Multiple event/workshop will be organized from time to time. Find the event that going to happen.
            </p>
            <Link to="#courses">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section id="courses" className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Upcoming Workshops & Events
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join our intensive programs designed to accelerate your growth and deliver measurable transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/apply">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                Apply for a Custom Program
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section id="performance" className="section-padding bg-muted/30">
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