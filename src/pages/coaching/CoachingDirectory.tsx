import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoachCard } from "@/components/coaching/CoachCard";
import { FeaturedCoaches } from "@/components/FeaturedCoaches";
import { 
  Search, 
  Filter, 
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

export default function CoachingDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const selectedCategory = searchParams.get("category") || "all";

  // Fetch categories from database
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");
      
      if (error) throw error;
      return [{ id: "all", name: "Show All", slug: "all" }, ...(data || [])];
    },
  });

  // Fetch coaches with category filtering
  const { data: coaches, isLoading } = useQuery({
    queryKey: ["coaches", selectedCategory],
    queryFn: async () => {
      if (selectedCategory === "all") {
        const { data, error } = await supabase
          .from("coaches")
          .select("*")
          .eq("status", "approved")
          .order("is_featured", { ascending: false });
        
        if (error) throw error;
        return data || [];
      }
      
      // Get coach IDs for the selected category
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", selectedCategory)
        .single();
      
      if (!categoryData) return [];
      
      const { data: coachCategories, error: ccError } = await supabase
        .from("coach_categories")
        .select("coach_id")
        .eq("category_id", categoryData.id);
      
      if (ccError) throw ccError;
      
      const coachIds = coachCategories?.map(cc => cc.coach_id) || [];
      if (coachIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("status", "approved")
        .in("id", coachIds)
        .order("is_featured", { ascending: false });
      
      if (error) throw error;
      return data || [];
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
    const name = coach.display_name?.toLowerCase() || "";
    const headline = coach.headline?.toLowerCase() || "";
    const specialties = coach.specialties?.join(" ").toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || headline.includes(query) || specialties.includes(query);
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1920&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              Coaching Exchange
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Explore <span className="text-gradient">Execution-Ready</span> Coaches
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Coaches in this exchange are surfaced based on demonstrated execution experience, deployability, and real-world performance — not visibility or self-promotion.
            </p>
            
            <div className="flex flex-col items-center gap-2">
              <Link to="/coaching/matching">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Begin Performance Context Mapping
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">AI supports the selection process — it does not replace performance evaluation.</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by execution context, challenge, or operating environment..."
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
                  {categories?.map((cat) => (
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
            {categories?.map((category) => {
              const isActive = selectedCategory === category.slug;
              const IconComponent = categoryIcons[category.slug];
              return (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Coaches */}
      <FeaturedCoaches />

      {/* Coaches Grid */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse text-center">
                  <div className="w-32 h-32 mx-auto rounded-full bg-muted mb-4" />
                  <div className="h-6 bg-muted rounded w-2/3 mx-auto mb-2" />
                  <div className="h-6 bg-muted rounded w-1/3 mx-auto mb-3" />
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-4" />
                  <div className="h-10 bg-muted rounded-full w-2/3 mx-auto" />
                </div>
              ))}
            </div>
          ) : filteredCoaches && filteredCoaches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCoaches.map((coach) => (
              <CoachCard
                  key={coach.id}
                  id={coach.id}
                  displayName={coach.display_name}
                  avatarUrl={coach.avatar_url}
                  headline={coach.headline}
                  specialties={coach.specialties}
                  isFeatured={coach.is_featured}
                  isEnterpriseReady={coach.is_enterprise_ready}
                  bio={coach.bio}
                  location={coach.location}
                  currentRole={coach.current_role}
                />
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
              Begin Performance Context Mapping
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Compass AI supports the selection process by mapping your context, constraints, and needs — it does not replace performance evaluation.
            </p>
            <Link to="/coaching/matching">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
                Start Context Mapping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}