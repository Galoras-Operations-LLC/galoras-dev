import { useState, useRef } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Award, 
  Users, 
  Globe,
  Zap,
  Send,
  Upload,
  X
} from "lucide-react";
import {
  COACH_BACKGROUND_OPTIONS,
  BACKGROUND_DETAIL_CONFIG,
  CERTIFICATION_INTEREST_OPTIONS,
  COACHING_EXPERIENCE_OPTIONS,
  LEADERSHIP_EXPERIENCE_OPTIONS,
  COACHING_LEVEL_OPTIONS,
  JOIN_REASON_OPTIONS,
  COMMITMENT_LEVEL_OPTIONS,
  START_TIMELINE_OPTIONS,
  PILLAR_SPECIALTIES,
} from "@/lib/coaching-constants";

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

export default function Apply() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    linkedin_url: "",
    website_url: "",
    bio: "",
    coaching_philosophy: "",
    // Structured fields
    coach_background: "",
    coach_background_detail: "",
    certification_interest: "",
    coaching_experience_years: "",
    leadership_experience_years: "",
    current_role: "",
    coaching_experience_level: "",
    pillar_specialties: [] as string[],
    // Motivation
    primary_join_reason: "",
    commitment_level: "",
    start_timeline: "",
    excitement_note: "",
  });

  const backgroundConfig = formData.coach_background
    ? BACKGROUND_DETAIL_CONFIG[formData.coach_background]
    : null;

  const handleBackgroundChange = (value: string) => {
    setFormData({
      ...formData,
      coach_background: value,
      coach_background_detail: "",
      certification_interest: "",
    });
  };

  const handlePillarChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, pillar_specialties: [...formData.pillar_specialties, specialty] });
    } else {
      setFormData({ ...formData, pillar_specialties: formData.pillar_specialties.filter(s => s !== specialty) });
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image file (JPG, PNG, etc.)", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 5MB", variant: "destructive" });
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let avatarUrl: string | null = null;

      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `applications/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("coach-photos")
          .upload(filePath, photoFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Failed to upload photo");
        }

        const { data: { publicUrl } } = supabase.storage
          .from("coach-photos")
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Clear irrelevant conditional fields
      const coach_background_detail = backgroundConfig?.field === "detail" ? formData.coach_background_detail : null;
      const certification_interest = backgroundConfig?.field === "certification" ? formData.certification_interest : null;

      const { error } = await supabase.from("coach_applications").insert({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        linkedin_url: formData.linkedin_url || null,
        website_url: formData.website_url || null,
        bio: formData.bio,
        avatar_url: avatarUrl,
        // New structured fields
        coach_background: formData.coach_background,
        coach_background_detail,
        certification_interest,
        coaching_experience_years: formData.coaching_experience_years,
        leadership_experience_years: formData.leadership_experience_years,
        current_role: formData.current_role || null,
        coaching_experience_level: formData.coaching_experience_level,
        pillar_specialties: formData.pillar_specialties,
        primary_join_reason: formData.primary_join_reason,
        commitment_level: formData.commitment_level,
        start_timeline: formData.start_timeline,
        excitement_note: formData.excitement_note || null,
        coaching_philosophy: formData.coaching_philosophy || null,
      } as any);

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: "We'll review your application and get back to you within 5 business days.",
      });

      setFormData({
        full_name: "", email: "", phone: "", linkedin_url: "", website_url: "", bio: "",
        coaching_philosophy: "", coach_background: "", coach_background_detail: "",
        certification_interest: "", coaching_experience_years: "", leadership_experience_years: "",
        current_role: "", coaching_experience_level: "", pillar_specialties: [],
        primary_join_reason: "", commitment_level: "", start_timeline: "", excitement_note: "",
      });
      removePhoto();
    } catch (error) {
      console.error("Submit error:", error);
      toast({ title: "Error", description: "Failed to submit application. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1920&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        
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
                  {/* Profile Photo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-semibold">Profile Photo</h3>
                    <p className="text-sm text-muted-foreground">Upload a professional headshot (optional but recommended)</p>
                    
                    <div className="flex items-center gap-6">
                      {photoPreview ? (
                        <div className="relative">
                          <img src={photoPreview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover border-2 border-border" />
                          <button type="button" onClick={removePhoto} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" id="photo-upload" />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          {photoFile ? "Change Photo" : "Upload Photo"}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">JPG, PNG up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-semibold">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Jane Smith" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="jane@coaching.com" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <Input id="linkedin" type="url" value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/yourprofile" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website / Portfolio</Label>
                      <Input id="website" type="url" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} placeholder="https://yourwebsite.com" />
                    </div>
                  </div>

                  {/* Professional Background */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-semibold">Professional Background</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Coach Background *</Label>
                        <Select value={formData.coach_background} onValueChange={handleBackgroundChange} required>
                          <SelectTrigger><SelectValue placeholder="Select background" /></SelectTrigger>
                          <SelectContent>
                            {COACH_BACKGROUND_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Years of Coaching Experience *</Label>
                        <Select value={formData.coaching_experience_years} onValueChange={(v) => setFormData({ ...formData, coaching_experience_years: v })} required>
                          <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                          <SelectContent>
                            {COACHING_EXPERIENCE_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Conditional sub-field */}
                    {backgroundConfig?.field === "detail" && (
                      <div className="space-y-2">
                        <Label>{backgroundConfig.label} *</Label>
                        <Input
                          required
                          value={formData.coach_background_detail}
                          onChange={(e) => setFormData({ ...formData, coach_background_detail: e.target.value })}
                          placeholder={backgroundConfig.label}
                        />
                      </div>
                    )}
                    {backgroundConfig?.field === "certification" && (
                      <div className="space-y-2">
                        <Label>{backgroundConfig.label} *</Label>
                        <Select value={formData.certification_interest} onValueChange={(v) => setFormData({ ...formData, certification_interest: v })} required>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {CERTIFICATION_INTEREST_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Years of Leadership / Professional Experience *</Label>
                      <Select value={formData.leadership_experience_years} onValueChange={(v) => setFormData({ ...formData, leadership_experience_years: v })} required>
                        <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                        <SelectContent>
                          {LEADERSHIP_EXPERIENCE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentRole">Current / Most Recent Role</Label>
                      <Input id="currentRole" value={formData.current_role} onChange={(e) => setFormData({ ...formData, current_role: e.target.value })} placeholder="e.g., VP of Operations, Head Coach" />
                    </div>

                    <div className="space-y-2">
                      <Label>Coaching Experience Level *</Label>
                      <Select value={formData.coaching_experience_level} onValueChange={(v) => setFormData({ ...formData, coaching_experience_level: v })} required>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          {COACHING_LEVEL_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Pillar Specialties */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-semibold">Specialties</h3>
                    <p className="text-sm text-muted-foreground">Select all areas where you have expertise (grouped by pillar):</p>
                    <div className="space-y-6">
                      {Object.entries(PILLAR_SPECIALTIES).map(([pillar, specialties]) => (
                        <div key={pillar}>
                          <p className="text-sm font-semibold text-muted-foreground mb-2">{pillar}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {specialties.map((specialty) => (
                              <div key={specialty} className="flex items-center space-x-2">
                                <Checkbox
                                  id={specialty}
                                  checked={formData.pillar_specialties.includes(specialty)}
                                  onCheckedChange={(checked) => handlePillarChange(specialty, checked as boolean)}
                                />
                                <Label htmlFor={specialty} className="text-sm cursor-pointer">{specialty}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About You */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-semibold">About You</h3>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio *</Label>
                      <Textarea id="bio" required rows={4} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about your coaching background and what makes you unique..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="philosophy">Coaching Philosophy</Label>
                      <Textarea
                        id="philosophy"
                        rows={2}
                        maxLength={300}
                        value={formData.coaching_philosophy}
                        onChange={(e) => setFormData({ ...formData, coaching_philosophy: e.target.value })}
                        placeholder="Your coaching philosophy in a sentence or two..."
                      />
                      <p className="text-xs text-muted-foreground text-right">{formData.coaching_philosophy.length}/300</p>
                    </div>
                  </div>

                  {/* Motivation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-display font-semibold">Motivation</h3>
                    <div className="space-y-2">
                      <Label>Primary Reason for Joining *</Label>
                      <Select value={formData.primary_join_reason} onValueChange={(v) => setFormData({ ...formData, primary_join_reason: v })} required>
                        <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                        <SelectContent>
                          {JOIN_REASON_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Coaching Commitment Level *</Label>
                      <Select value={formData.commitment_level} onValueChange={(v) => setFormData({ ...formData, commitment_level: v })} required>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          {COMMITMENT_LEVEL_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>When Would You Like to Begin? *</Label>
                      <Select value={formData.start_timeline} onValueChange={(v) => setFormData({ ...formData, start_timeline: v })} required>
                        <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
                        <SelectContent>
                          {START_TIMELINE_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="excitement">What excites you most about coaching?</Label>
                      <Textarea
                        id="excitement"
                        rows={2}
                        maxLength={200}
                        value={formData.excitement_note}
                        onChange={(e) => setFormData({ ...formData, excitement_note: e.target.value })}
                        placeholder="Optional — max 200 characters"
                      />
                      <p className="text-xs text-muted-foreground text-right">{formData.excitement_note.length}/200</p>
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
