import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, BookOpen, Timer, Users } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  date: Date;
  time: string;
  location: string;
  lessonsCount?: number;
  duration?: string;
  studentsCount?: number;
  coachName?: string;
  coachAvatar?: string;
}

export function CourseCard({
  id,
  title,
  description,
  category,
  imageUrl,
  date,
  time,
  location,
  lessonsCount = 10,
  duration = "8h 30m",
  studentsCount = 20,
  coachName,
  coachAvatar,
}: CourseCardProps) {
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all card-hover group">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Date Badge */}
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-center px-4 py-2 rounded-lg shadow-lg">
          <div className="text-2xl font-bold">{day}</div>
          <div className="text-xs">
            {month}, {year}
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary">
            {category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-primary" />
            {time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-primary" />
            {location}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Lesson {lessonsCount}
          </span>
          <span className="flex items-center gap-1">
            <Timer className="h-4 w-4" />
            {duration}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Students {studentsCount}+
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {coachName && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                {coachAvatar ? (
                  <img
                    src={coachAvatar}
                    alt={coachName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {coachName.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">{coachName}</span>
            </div>
          )}
          <Link to={`/labs/${id}`}>
            <Button variant="link" className="text-primary font-semibold p-0">
              EXPLORE MORE →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}