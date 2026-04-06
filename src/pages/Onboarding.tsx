import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LegalConsentCheckboxes } from "@/components/legal/LegalConsentCheckboxes";
import { recordAgreements } from "@/lib/legal";
import { Linkedin, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const GOAL_OPTIONS = [
  "Leadership",
  "Career",
  "Performance",
  "Mindset",
  "Communication",
  "Transitions",
  "Executive Presence",
  "Team Management",
  "Work-Life Balance",
  "Confidence",
  "Strategy",
  "Entrepreneurship",
];

const INDUSTRY_OPTIONS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Consulting",
  "Media & Entertainment",
  "Retail",
  "Manufacturing",
  "Government",
  "Non-Profit",
  "Real Estate",
  "Other",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Step 2
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Step 3
  const [challenges, setChallenges] = useState("");

  // Legal consent (step 3)
  const [consentValid, setConsentValid] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const handleConsentChange = useCallback((valid: boolean, marketing: boolean) => {
    setConsentValid(valid);
    setMarketingOptIn(marketing);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/signup");
        return;
      }
      setUserId(session.user.id);
      const meta = session.user.user_metadata;
      if (meta?.full_name) setFullName(meta.full_name);
    });
  }, [navigate]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || undefined,
        user_role: userRole || undefined,
        industry: industry || undefined,
        linkedin_url: linkedinUrl || undefined,
        goals: selectedGoals,
        coaching_areas: selectedGoals, // coaching_areas mirrors goals for matching
        challenges: challenges || undefined,
        onboarding_complete: true,
      })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
      return;
    }

    // Record legal agreements
    const types: import("@/lib/legal").AgreementType[] = ["terms_of_service", "privacy_policy"];
    if (marketingOptIn) types.push("marketing_opt_in");
    await recordAgreements({ context: "onboarding", agreementTypes: types, marketingOptIn });

    toast({ title: "Profile complete!", description: "We'll match you with the right coaches." });
    navigate("/coaching");
  };

  const totalSteps = 3;

  return (
    <Layout>
      <section className="min-h-screen bg-zinc-950 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i + 1 < step
                      ? "bg-primary text-primary-foreground"
                      : i + 1 === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`flex-1 h-0.5 ${i + 1 < step ? "bg-primary" : "bg-zinc-800"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  Step {step} of {totalSteps}
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-white">
                {step === 1 && "Tell us about yourself"}
                {step === 2 && "What do you want from coaching?"}
                {step === 3 && "What are you working on?"}
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                {step === 1 && "This helps us personalise your coaching matches."}
                {step === 2 && "Select all that apply. We'll surface coaches who specialise here."}
                {step === 3 && "A short description helps coaches understand where you're at."}
              </p>
            </div>

            {/* Step 1 — About you */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-zinc-300 text-sm mb-1.5 block">Full name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300 text-sm mb-1.5 block">Your current role</Label>
                  <Input
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    placeholder="VP of Engineering, Founder, etc."
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300 text-sm mb-1.5 block">Industry</Label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-zinc-300 text-sm mb-1.5 block">
                    LinkedIn profile URL
                    <span className="ml-2 text-zinc-500 font-normal">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Goals */}
            {step === 2 && (
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      selectedGoals.includes(goal)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            )}

            {/* Step 3 — Challenges + Legal consent */}
            {step === 3 && (
              <div className="space-y-5">
                <Textarea
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="e.g. I'm transitioning from an individual contributor to a people manager and struggling to build credibility with my new team..."
                  rows={4}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary resize-none"
                />
                <div className="border-t border-zinc-700 pt-4">
                  <LegalConsentCheckboxes
                    context="onboarding"
                    onChange={handleConsentChange}
                    variant="dark"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <button
                  onClick={() => navigate("/coaching")}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Skip for now
                </button>
              )}

              {step < totalSteps ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={step === 2 && selectedGoals.length === 0}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving || !consentValid}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {saving ? "Saving..." : "See my matches"}
                  {!saving && <Sparkles className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
