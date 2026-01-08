import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowRight, 
  Award, 
  Users, 
  Globe,
  Zap,
  CheckCircle,
  Send
} from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Curated Client Base",
    description: "Connect with motivated individuals and organizations actively seeking coaching.",
  },
  {
    icon: Zap,
    title: "AI-Powered Matching",
    description: "Get matched with clients who are the right fit for your style and expertise.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Access clients from around the world through our digital platform.",
  },
  {
    icon: Award,
    title: "Professional Development",
    description: "Access exclusive training, resources, and community for continuous growth.",
  },
];

const specialtyOptions = [
  "Leadership Development",
  "Executive Coaching",
  "Career Transitions",
  "Performance Optimization",
  "Work-Life Balance",
  "Communication Skills",
  "Team Dynamics",
  "Entrepreneurship",
  "Mindset & Resilience",
  "Health & Wellness",
];

export default function Apply() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    linkedin_url: "",
    website_url: "",
    experience_years: "",
    certifications: "",
    specialties: [] as string[],
    bio: "",
    why_galoras: "",
  });

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, specialties: [...formData.specialties, specialty] });
    } else {
      setFormData({ ...formData, specialties: formData.specialties.filter(s => s !== specialty) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("coach_applications").insert({
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
      });

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: "We'll review your application and get back to you within 5 business days.",
      });

      setFormData({
        full_name: "",
        email: "",
        phone: "",
        linkedin_url: "",
        website_url: "",
        experience_years: "",
        certifications: "",
        specialties: [],
        bio: "",
        why_galoras: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 hero-gradient overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Award className="h-4 w-4" />
              Join Our Coaching Network
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Become a <span className="text-gradient">Galoras Coach</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Join an elite network of vetted coaches making a real impact on people's lives and careers.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-display font-bold mb-2">Coach Application</h2>
                <p className="text-muted-foreground mb-8">
                  Tell us about yourself and your coaching practice. Applications are reviewed within 5 business days.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-semibold">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Jane Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jane@coaching.com"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <Input
                          id="linkedin"
                          type="url"
                          value={formData.linkedin_url}
                          onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website / Portfolio</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  {/* Professional Background */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-semibold">Professional Background</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Coaching Experience *</Label>
                        <Input
                          id="experience"
                          type="number"
                          required
                          min="0"
                          value={formData.experience_years}
                          onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                          placeholder="5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="certifications">Certifications</Label>
                        <Input
                          id="certifications"
                          value={formData.certifications}
                          onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                          placeholder="ICF PCC, CTI, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-semibold">Specialties</h3>
                    <p className="text-sm text-muted-foreground">Select all areas where you have expertise:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {specialtyOptions.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={specialty}
                            checked={formData.specialties.includes(specialty)}
                            onCheckedChange={(checked) => handleSpecialtyChange(specialty, checked as boolean)}
                          />
                          <Label htmlFor={specialty} className="text-sm cursor-pointer">
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-semibold">About You</h3>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio *</Label>
                      <Textarea
                        id="bio"
                        required
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about your coaching philosophy, background, and what makes you unique..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="why">Why Galoras?</Label>
                      <Textarea
                        id="why"
                        rows={3}
                        value={formData.why_galoras}
                        onChange={(e) => setFormData({ ...formData, why_galoras: e.target.value })}
                        placeholder="What attracted you to Galoras and why do you want to join our network?"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              What Happens Next?
            </h2>
            <div className="space-y-4">
              {[
                { step: 1, title: "Application Review", description: "Our team reviews your application within 5 business days." },
                { step: 2, title: "Discovery Call", description: "If selected, we'll schedule a 30-minute call to learn more about you." },
                { step: 3, title: "Onboarding", description: "Complete your profile, set up your schedule, and join our coach community." },
                { step: 4, title: "Start Coaching", description: "Begin receiving client matches through our AI-powered platform." },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
