import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageCoachModal } from "@/components/coaching/MessageCoachModal";
import { BookSessionModal } from "@/components/coaching/BookSessionModal";
import { 
  ArrowLeft,
  Star, 
  MapPin, 
  Clock, 
  Globe,
  Linkedin,
  Calendar,
  MessageCircle,
  CheckCircle,
  Award,
  Users,
  Briefcase
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function CoachProfile() {
  const { coachId } = useParams<{ coachId: string }>();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { data: coach, isLoading } = useQuery({
    queryKey: ["coach", coachId],
    queryFn: async () => {
      const { data: coachData, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", coachId)
        .single();
      if (error) throw error;
      
      // Get profile for this coach
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio")
        .eq("user_id", coachData.user_id)
        .single();
      
      return { ...coachData, profile };
    },
    enabled: !!coachId,
  });

  const { data: testimonials } = useQuery({
    queryKey: ["testimonials", coachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("coach_id", coachId)
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!coachId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-32 pb-16">
          <div className="container-wide">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-32 mb-8" />
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-muted rounded-2xl" />
                  <div className="h-48 bg-muted rounded-2xl" />
                </div>
                <div className="h-96 bg-muted rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!coach) {
    return (
      <Layout>
        <div className="pt-32 pb-16">
          <div className="container-wide text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Coach Not Found</h1>
            <p className="text-muted-foreground mb-6">This coach profile doesn't exist or has been removed.</p>
            <Link to="/coaching">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Directory
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-28 pb-16">
        <div className="container-wide">
          {/* Back Button */}
          <Link 
            to="/coaching" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Coaches
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Header */}
              <Card className="overflow-hidden">
                <div 
                  className="h-32 bg-cover bg-center relative"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1920&auto=format&fit=crop')" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-accent/40 to-primary/30" />
                </div>
                <CardContent className="relative pt-0 pb-6">
                  <div className="flex flex-col sm:flex-row gap-6 -mt-12">
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                        {coach.profile?.avatar_url ? (
                          <img 
                            src={coach.profile.avatar_url} 
                            alt={coach.profile?.full_name || "Coach"} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-bold text-white">
                            {coach.profile?.full_name?.charAt(0) || "C"}
                          </span>
                        )}
                      </div>
                      {coach.is_featured && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Star className="h-4 w-4 text-primary-foreground fill-current" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 pt-4 sm:pt-8">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-display font-bold">
                            {coach.profile?.full_name || "Coach"}
                          </h1>
                          <p className="text-lg text-muted-foreground">
                            {coach.headline || "Executive Coach"}
                          </p>
                        </div>
                        {coach.rating && coach.rating > 0 && (
                          <div className="flex items-center gap-1 text-lg">
                            <Star className="h-5 w-5 text-primary fill-current" />
                            <span className="font-semibold">{Number(coach.rating).toFixed(1)}</span>
                            <span className="text-muted-foreground">
                              ({coach.total_sessions || 0} sessions)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                        {coach.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {coach.location}
                          </span>
                        )}
                        {coach.experience_years && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {coach.experience_years}+ years experience
                          </span>
                        )}
                        {coach.timezone && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {coach.timezone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-display font-semibold mb-4">About</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {coach.bio || coach.profile?.bio || "This coach hasn't added a bio yet."}
                  </p>
                </CardContent>
              </Card>

              {/* Specialties */}
              {coach.specialties && coach.specialties.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-display font-semibold mb-4">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {coach.specialties.map((specialty, i) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Coaching Style & Framework */}
              {(coach.coaching_style || coach.signature_framework) && (
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {coach.coaching_style && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-primary" />
                          Coaching Style
                        </h3>
                        <p className="text-muted-foreground">{coach.coaching_style}</p>
                      </div>
                    )}
                    {coach.signature_framework && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          Signature Framework
                        </h3>
                        <p className="text-muted-foreground">{coach.signature_framework}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Testimonials */}
              {testimonials && testimonials.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-display font-semibold mb-6">Client Testimonials</h2>
                    <div className="space-y-6">
                      {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="relative pl-6 border-l-2 border-primary/30">
                          <p className="text-muted-foreground italic mb-3">"{testimonial.content}"</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {testimonial.client_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{testimonial.client_name}</p>
                              {(testimonial.client_title || testimonial.client_company) && (
                                <p className="text-xs text-muted-foreground">
                                  {[testimonial.client_title, testimonial.client_company].filter(Boolean).join(" at ")}
                                </p>
                              )}
                            </div>
                            {testimonial.rating && (
                              <div className="ml-auto flex items-center gap-1">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-primary fill-current" />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <Card className="sticky top-28">
                <CardContent className="p-6">
                  {coach.hourly_rate && (
                    <div className="text-center mb-6">
                      <span className="text-3xl font-display font-bold">${coach.hourly_rate}</span>
                      <span className="text-muted-foreground">/session</span>
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                      size="lg"
                      onClick={() => setIsBookingModalOpen(true)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book a Session
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={() => setIsMessageModalOpen(true)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  {/* Quick Info */}
                  <div className="space-y-4 text-sm">
                    {coach.languages && coach.languages.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Languages</p>
                          <p className="text-muted-foreground">{coach.languages.join(", ")}</p>
                        </div>
                      </div>
                    )}
                    {coach.total_sessions && coach.total_sessions > 0 && (
                      <div className="flex items-start gap-3">
                        <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Sessions Completed</p>
                          <p className="text-muted-foreground">{coach.total_sessions}+</p>
                        </div>
                      </div>
                    )}
                    {coach.is_enterprise_ready && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Enterprise Ready</p>
                          <p className="text-muted-foreground">Available for corporate engagements</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* External Links */}
                  <div className="flex justify-center gap-4">
                    {coach.linkedin_url && (
                      <a
                        href={coach.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {coach.website_url && (
                      <a
                        href={coach.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Trust Signals */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Why Choose This Coach</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Vetted by Galoras team</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Background verified</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Secure booking & payments</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Satisfaction guaranteed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Message Coach Modal */}
      <MessageCoachModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        coachId={coachId || ""}
        coachName={coach?.display_name || coach?.profile?.full_name || "Coach"}
        coachUserId={coach?.user_id || ""}
      />

      {/* Book Session Modal */}
      <BookSessionModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        coach={{
          id: coach.id,
          display_name: coach.display_name || coach.profile?.full_name || "Coach",
          hourly_rate: coach.hourly_rate,
          user_id: coach.user_id,
        }}
      />
    </Layout>
  );
}