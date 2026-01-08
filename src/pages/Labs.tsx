import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/labs/CourseCard";
import { 
  ArrowRight, 
  FlaskConical, 
  Target, 
  BarChart3,
  Users,
  Rocket,
  Calendar
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

// Performance Labs data
const performanceLabs = [
  {
    id: "perf-1",
    title: "Peak Performance Training",
    category: "Performance",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-02-18"),
    time: "9:00am - 5:00pm",
    location: "Virtual",
    lessonsCount: 12,
    duration: "24h 00m",
    studentsCount: 20,
    coachName: "Coach Marcus",
    coachAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
  {
    id: "perf-2",
    title: "Mental Resilience & Mindset Mastery",
    category: "Performance",
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-03-05"),
    time: "10:00am - 4:00pm",
    location: "Los Angeles",
    lessonsCount: 8,
    duration: "18h 00m",
    studentsCount: 15,
    coachName: "Coach Aisha",
    coachAvatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
  },
  {
    id: "perf-3",
    title: "Athletic Mindset for Business Leaders",
    category: "Performance",
    imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-03-12"),
    time: "11:00am - 3:00pm",
    location: "New York",
    lessonsCount: 6,
    duration: "12h 00m",
    studentsCount: 25,
    coachName: "Coach David",
    coachAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
  },
];

// Executive Labs data
const executiveLabs = [
  {
    id: "exec-1",
    title: "C-Suite Leadership Accelerator",
    category: "Executive",
    imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-02-25"),
    time: "9:00am - 4:00pm",
    location: "Virtual",
    lessonsCount: 10,
    duration: "20h 00m",
    studentsCount: 12,
    coachName: "Coach Elena",
    coachAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
  },
  {
    id: "exec-2",
    title: "Strategic Decision Making Under Pressure",
    category: "Executive",
    imageUrl: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-03-10"),
    time: "10:00am - 2:00pm",
    location: "Chicago",
    lessonsCount: 8,
    duration: "16h 00m",
    studentsCount: 18,
    coachName: "Coach James",
    coachAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
  },
  {
    id: "exec-3",
    title: "Executive Presence & Communication",
    category: "Executive",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-03-20"),
    time: "1:00pm - 5:00pm",
    location: "Virtual",
    lessonsCount: 6,
    duration: "12h 00m",
    studentsCount: 20,
    coachName: "Coach Sarah",
    coachAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
  },
];

// Team Labs data
const teamLabs = [
  {
    id: "team-1",
    title: "High-Performance Team Dynamics",
    category: "Team",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-02-28"),
    time: "9:00am - 3:00pm",
    location: "Virtual",
    lessonsCount: 8,
    duration: "16h 00m",
    studentsCount: 30,
    coachName: "Coach Elena",
    coachAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
  },
  {
    id: "team-2",
    title: "Conflict Resolution & Collaboration",
    category: "Team",
    imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-03-15"),
    time: "10:00am - 4:00pm",
    location: "New York",
    lessonsCount: 6,
    duration: "12h 00m",
    studentsCount: 25,
    coachName: "Coach Marcus",
    coachAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
  {
    id: "team-3",
    title: "Building Trust & Psychological Safety",
    category: "Team",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
    date: new Date("2026-03-25"),
    time: "11:00am - 3:00pm",
    location: "Virtual",
    lessonsCount: 5,
    duration: "10h 00m",
    studentsCount: 22,
    coachName: "Coach Aisha",
    coachAvatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80",
  },
];

export default function Labs() {
  const location = useLocation();

  // Scroll to hash section on load or hash change
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location.hash]);

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

      {/* Events Section */}
      <section id="events" className="section-padding bg-background">
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

      {/* Performance Labs */}
      <section id="performance" className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Target className="h-4 w-4" />
              PERFORMANCE LABS
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Peak Performance Training
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Unlock your full potential with programs designed to build mental resilience, focus, and sustainable high performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {performanceLabs.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>

      {/* Executive Labs */}
      <section id="executive" className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <BarChart3 className="h-4 w-4" />
              EXECUTIVE LABS
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Executive Leadership Programs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Accelerate your leadership journey with programs tailored for senior executives and C-suite leaders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {executiveLabs.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>

      {/* Team Labs */}
      <section id="team" className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Users className="h-4 w-4" />
              TEAM LABS
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Team Development Programs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Build cohesive, high-performing teams with our collaborative workshops and team coaching programs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamLabs.map((course) => (
              <CourseCard key={course.id} {...course} />
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