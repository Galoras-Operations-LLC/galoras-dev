import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  ArrowRight,
  Sparkles,
  Users,
  Target,
  TrendingUp,
  Zap,
  Brain,
  MessageCircle,
  Compass
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const categoryIcons: Record<string, typeof Target> = {
  leadership: Target,
  career: TrendingUp,
  performance: Zap,
  mindset: Brain,
  communication: MessageCircle,
  transitions: Compass,
};

const categories = [
  { id: "all", name: "All Categories", slug: "all" },
  { id: "leadership", name: "Leadership", slug: "leadership" },
  { id: "career", name: "Career", slug: "career" },
  { id: "performance", name: "Performance", slug: "performance" },
  { id: "mindset", name: "Mindset", slug: "mindset" },
  { id: "communication", name: "Communication", slug: "communication" },
  { id: "transitions", name: "Transitions", slug: "transitions" },
];

export default function CoachingDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const selectedCategory = searchParams.get("category") || "all";

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["coaches", selectedCategory],
    queryFn: async () => {
      // First get coaches
      const { data: coachData, error: coachError } = await supabase
        .from("coaches")
        .select("*")
        .eq("status", "approved")
        .order("is_featured", { ascending: false });
      
      if (coachError) throw coachError;
      
      // Then get profiles for those coaches
      const userIds = coachData?.map(c => c.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);
      
      // Merge the data
      return coachData?.map(coach => ({
        ...coach,
        profile: profiles?.find(p => p.user_id === coach.user_id)
      })) || [];
    },
  });

  const { data: dbCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    setSearchParams(searchParams);
  };

  const filteredCoaches = coaches?.filter((coach) => {
    if (!searchQuery) return true;
    const name = coach.profile?.full_name?.toLowerCase() || "";
    const headline = coach.headline?.toLowerCase() || "";
    const specialties = coach.specialties?.join(" ").toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || headline.includes(query) || specialties.includes(query);
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              Coaching Exchange
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Find Your <span className="text-gradient">Elite Coach</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Browse our network of vetted, world-class coaches. Each has been carefully selected for their expertise, experience, and results.
            </p>
            
            <Link to="/coaching/matching">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                <Sparkles className="mr-2 h-5 w-5" />
                Get AI-Matched Instead
              </Button>
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialty, or keyword..."
                  className="pl-10 h-12 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full md:w-[200px] h-12">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-6 bg-muted/30 border-b border-border">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const Icon = categoryIcons[category.slug] || Target;
              const isActive = selectedCategory === category.slug;
              return (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  {category.slug !== "all" && <Icon className="h-4 w-4" />}
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coaches Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-16 bg-muted rounded mb-4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded-full w-20" />
                    <div className="h-6 bg-muted rounded-full w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCoaches && filteredCoaches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoaches.map((coach) => (
                <Link
                  key={coach.id}
                  to={`/coaching/${coach.id}`}
                  className="group bg-card rounded-2xl border border-border hover:border-primary/50 p-6 transition-all card-hover"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                        {coach.profile?.avatar_url ? (
                          <img 
                            src={coach.profile.avatar_url} 
                            alt={coach.profile?.full_name || "Coach"} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-primary">
                            {coach.profile?.full_name?.charAt(0) || "C"}
                          </span>
                        )}
                      </div>
                      {coach.is_featured && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Star className="h-3 w-3 text-primary-foreground fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {coach.profile?.full_name || "Coach"}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {coach.headline || "Executive Coach"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {coach.bio || "Helping leaders and professionals achieve peak performance."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {coach.specialties?.slice(0, 3).map((specialty, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      {coach.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {coach.location}
                        </span>
                      )}
                      {coach.experience_years && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {coach.experience_years}+ yrs
                        </span>
                      )}
                    </div>
                    {coach.rating && coach.rating > 0 && (
                      <span className="flex items-center gap-1 text-primary">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {Number(coach.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">No Coaches Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? "Try adjusting your search terms or clearing filters."
                  : "We're building our coach network. Check back soon!"}
              </p>
              <Link to="/coaching/matching">
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try AI Matching
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Not Sure Who's Right for You?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Let Compass AI analyze your goals, preferences, and style to match you with coaches who'll help you thrive.
            </p>
            <Link to="/coaching/matching">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Start AI Matching
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}