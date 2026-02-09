import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, User, FileText, Target, Linkedin, Image } from "lucide-react";

interface CoachApplication {
  id: string;
  full_name: string;
  email: string;
  bio: string | null;
  specialties: string[] | null;
  linkedin_url: string | null;
  avatar_url: string | null;
}

export default function CoachOnboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [state, setState] = useState<"loading" | "invalid" | "form" | "submitting" | "success">("loading");
  const [application, setApplication] = useState<CoachApplication | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [coachingFocus, setCoachingFocus] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("validate-onboarding-token", {
        body: { token },
      });

      if (error || data?.error) {
        setState("invalid");
        return;
      }

      const app = data.application;
      setApplication(app);
      setFullName(app.full_name || "");
      setBio(app.bio || "");
      setCoachingFocus(app.specialties?.join(", ") || "");
      setLinkedinUrl(app.linkedin_url || "");
      setAvatarUrl(app.avatar_url || "");
      setState("form");
    } catch (error) {
      console.error("Validation error:", error);
      setState("invalid");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !bio.trim() || !coachingFocus.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setState("submitting");

    try {
      const { data, error } = await supabase.functions.invoke("complete-onboarding", {
        body: {
          token,
          fullName: fullName.trim(),
          bio: bio.trim(),
          coachingFocus: coachingFocus.trim(),
          linkedinUrl: linkedinUrl.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || "Failed to complete onboarding");
      }

      setState("success");
      toast({
        title: "Profile completed!",
        description: "Your coach profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Submit error:", error);
      setState("form");
      toast({
        title: "Submission failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (state === "loading") {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Validating your invitation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Invalid token state
  if (state === "invalid") {
    return (
      <Layout>
        <section className="py-16">
          <div className="container-wide max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold mb-2">Invalid or Expired Link</h1>
                    <p className="text-muted-foreground">
                      This onboarding link is no longer valid. It may have already been used or has expired.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Return to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  // Success state
  if (state === "success") {
    return (
      <Layout>
        <section className="py-16">
          <div className="container-wide max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold mb-2">Welcome to Galoras!</h1>
                    <p className="text-muted-foreground">
                      Your coach profile has been completed. You can now sign in to access your dashboard.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/login")}>
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  // Form state
  return (
    <Layout>
      <section className="py-16">
        <div className="container-wide max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Complete Your Coach Profile</h1>
            <p className="text-muted-foreground mt-2">
              Welcome, {application?.full_name}! Please complete your profile to get started.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                This information will be visible on your public coach profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bio <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell clients about yourself, your experience, and your coaching approach..."
                    rows={5}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    This will appear on your public profile page.
                  </p>
                </div>

                {/* Coaching Focus */}
                <div className="space-y-2">
                  <Label htmlFor="coachingFocus" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Coaching Focus Areas <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="coachingFocus"
                    value={coachingFocus}
                    onChange={(e) => setCoachingFocus(e.target.value)}
                    placeholder="e.g., Leadership, Career Transitions, Executive Coaching"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate multiple areas with commas.
                  </p>
                </div>

                {/* LinkedIn URL */}
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                {/* Profile Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Profile Image URL
                  </Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter a URL to your professional photo (optional).
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={state === "submitting"}
                >
                  {state === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Complete Profile"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
