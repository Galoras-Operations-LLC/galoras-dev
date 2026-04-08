import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useTags } from "@/hooks/useTags";
import { useProductTypes } from "@/hooks/useProductTypes";

// ── Tag pill component ────────────────────────────────────────────────────────
function TagPills({ family, selected, onChange, single = false }: {
  family: string; selected: string[]; onChange: (v: string[]) => void; single?: boolean;
}) {
  const { getTagsByFamily } = useTags();
  const items = getTagsByFamily(family);
  const toggle = (key: string) => {
    if (single) { onChange(selected[0] === key ? [] : [key]); return; }
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
  };
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map(t => (
        <button key={t.tag_key} type="button" onClick={() => toggle(t.tag_key)}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            selected.includes(t.tag_key)
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}>
          {t.tag_label}
        </button>
      ))}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface PendingProduct {
  product_type: string;
  title: string;
  outcome_statement: string;
  price_type: "enquiry" | "fixed" | "range";
  price_cents: number | null;
  price_display: string;
  outcome_tags: string[];
  audience_tags: string[];
  format_tags: string[];
}

export default function CoachOnboarding() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = (location.state as { token?: string } | null)?.token ?? null;

  const [state, setState] = useState<"loading" | "invalid" | "form" | "submitting" | "success">("loading");
  const [step, setStep] = useState(1);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

  // Step 2 — tag keys
  const [specialtyTags, setSpecialtyTags] = useState<string[]>([]);
  const [audienceTags, setAudienceTags] = useState<string[]>([]);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [industryTags, setIndustryTags] = useState<string[]>([]);

  // Step 3
  const [availabilityTag, setAvailabilityTag] = useState<string[]>([]);
  const [enterpriseTags, setEnterpriseTags] = useState<string[]>([]);
  const [credentialTags, setCredentialTags] = useState<string[]>([]);

  // Step 4 — pending product
  const [pendingProduct, setPendingProduct] = useState<PendingProduct>({
    product_type: "",
    title: "",
    outcome_statement: "",
    price_type: "enquiry",
    price_cents: null,
    price_display: "",
    outcome_tags: [],
    audience_tags: [],
    format_tags: [],
  });

  const { types: productTypes } = useProductTypes();

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("validate-onboarding-token", { body: { token } });
      if (error || data?.error) { setState("invalid"); return; }
      const app = data.application;
      setFullName(app.full_name || "");
      setBio(app.bio || "");
      setLinkedinUrl(app.linkedin_url || "");
      setCurrentRole(app.current_role || "");
      setState("form");
    } catch {
      setState("invalid");
    }
  };

  // ── Validation per step ──────────────────────────────────────────────────────
  const validateStep = (): boolean => {
    if (step === 1) {
      if (!fullName.trim()) {
        toast({ title: "Full name is required", variant: "destructive" }); return false;
      }
    }
    if (step === 2) {
      if (specialtyTags.length < 2) {
        toast({ title: "Select at least 2 specialty tags", variant: "destructive" }); return false;
      }
      if (audienceTags.length < 1) {
        toast({ title: "Select at least 1 audience tag", variant: "destructive" }); return false;
      }
    }
    if (step === 4) {
      if (!pendingProduct.product_type) {
        toast({ title: "Select a product type", variant: "destructive" }); return false;
      }
      if (!pendingProduct.title.trim()) {
        toast({ title: "Product title is required", variant: "destructive" }); return false;
      }
      if (pendingProduct.outcome_tags.length < 1) {
        toast({ title: "Select at least 1 outcome tag", variant: "destructive" }); return false;
      }
      if (pendingProduct.audience_tags.length < 1) {
        toast({ title: "Select at least 1 audience tag for the product", variant: "destructive" }); return false;
      }
      if (pendingProduct.format_tags.length < 1) {
        toast({ title: "Select at least 1 format tag", variant: "destructive" }); return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setState("submitting");
    try {
      const { data, error } = await supabase.functions.invoke("complete-onboarding", {
        body: {
          token,
          fullName: fullName.trim(),
          bio: bio.trim(),
          linkedinUrl: linkedinUrl.trim() || null,
          currentRole: currentRole.trim() || null,
          bookingUrl: bookingUrl.trim() || null,
          specialtyTags,
          audienceTags,
          styleTags,
          industryTags,
          availabilityTag: availabilityTag[0] || null,
          enterpriseTags,
          credentialTags,
          pendingProduct,
        },
      });
      if (error || data?.error) throw new Error(data?.error || "Failed to complete onboarding");
      setState("success");
      toast({ title: "Profile completed!", description: "Your coach profile has been saved successfully." });
    } catch (error) {
      console.error("Submit error:", error);
      setState("form");
      toast({ title: "Submission failed", description: "Please try again or contact support.", variant: "destructive" });
    }
  };

  // ── Loading / error / success states ────────────────────────────────────────
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
                    <p className="text-muted-foreground">This onboarding link is no longer valid.</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/")}>Return to Home</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

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
                    <p className="text-muted-foreground">Your coach profile has been completed. You can now sign in to access your dashboard.</p>
                  </div>
                  <Button onClick={() => navigate("/login")}>Sign In</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  const pp = pendingProduct;
  const setPP = (patch: Partial<PendingProduct>) => setPendingProduct(prev => ({ ...prev, ...patch }));

  const stepTitles = [
    "Coach Identity",
    "Positioning",
    "Commercial Readiness",
    "Your First Product",
    "Review & Submit",
  ];

  return (
    <Layout>
      <section className="py-16">
        <div className="container-wide max-w-2xl mx-auto">
          {/* Header & progress */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Complete Your Coach Profile</h1>
            <p className="text-muted-foreground mt-2">Step {step} of 5 — {stepTitles[step - 1]}</p>
          </div>
          <div className="flex gap-1 mb-8">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{stepTitles[step - 1]}</CardTitle>
              {step === 4 && <CardDescription>Add your first coaching product. You can add more from your dashboard.</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-5">

              {/* ── Step 1 ── */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / Positioning Statement</Label>
                    <Textarea id="bio" rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Describe your coaching approach..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentRole">Current Role</Label>
                    <Input id="currentRole" value={currentRole} onChange={e => setCurrentRole(e.target.value)} placeholder="e.g. Executive Coach" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input id="linkedinUrl" type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingUrl">Booking URL (optional)</Label>
                    <Input id="bookingUrl" type="url" value={bookingUrl} onChange={e => setBookingUrl(e.target.value)} placeholder="https://calendly.com/yourname" />
                  </div>
                </>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <>
                  <div className="space-y-1">
                    <Label>Specialty Tags <span className="text-muted-foreground text-xs">(min 2)</span></Label>
                    <TagPills family="specialty" selected={specialtyTags} onChange={setSpecialtyTags} />
                  </div>
                  <div className="space-y-1">
                    <Label>Audience Tags <span className="text-muted-foreground text-xs">(min 1)</span></Label>
                    <TagPills family="audience" selected={audienceTags} onChange={setAudienceTags} />
                  </div>
                  <div className="space-y-1">
                    <Label>Coaching Style</Label>
                    <TagPills family="style" selected={styleTags} onChange={setStyleTags} />
                  </div>
                  <div className="space-y-1">
                    <Label>Industry Focus</Label>
                    <TagPills family="industry" selected={industryTags} onChange={setIndustryTags} />
                  </div>
                </>
              )}

              {/* ── Step 3 ── */}
              {step === 3 && (
                <>
                  <div className="space-y-1">
                    <Label>Availability</Label>
                    <TagPills family="availability" selected={availabilityTag} onChange={setAvailabilityTag} single />
                  </div>
                  <div className="space-y-1">
                    <Label>Enterprise</Label>
                    <TagPills family="enterprise" selected={enterpriseTags} onChange={setEnterpriseTags} />
                  </div>
                  <div className="space-y-1">
                    <Label>Credentials</Label>
                    <TagPills family="credential" selected={credentialTags} onChange={setCredentialTags} />
                  </div>
                </>
              )}

              {/* ── Step 4 ── */}
              {step === 4 && (
                <>
                  <div className="space-y-2">
                    <Label>Product Type *</Label>
                    <Select value={pp.product_type} onValueChange={v => setPP({ product_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {productTypes.map(t => <SelectItem key={t.slug} value={t.slug}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prodTitle">Title *</Label>
                    <Input id="prodTitle" value={pp.title} onChange={e => setPP({ title: e.target.value })} placeholder="e.g. 90-day Leadership Intensive" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outcomeStatement">Outcome Statement</Label>
                    <Textarea id="outcomeStatement" rows={3} value={pp.outcome_statement} onChange={e => setPP({ outcome_statement: e.target.value })} placeholder="What will the client achieve?" />
                  </div>
                  <div className="space-y-1">
                    <Label>Outcome Tags <span className="text-muted-foreground text-xs">(min 1)</span></Label>
                    <TagPills family="outcome" selected={pp.outcome_tags} onChange={v => setPP({ outcome_tags: v })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Audience Tags <span className="text-muted-foreground text-xs">(min 1)</span></Label>
                    <TagPills family="audience" selected={pp.audience_tags} onChange={v => setPP({ audience_tags: v })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Format Tags <span className="text-muted-foreground text-xs">(min 1)</span></Label>
                    <TagPills family="format" selected={pp.format_tags} onChange={v => setPP({ format_tags: v })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Price Type</Label>
                    <div className="flex gap-3">
                      {(["enquiry", "fixed", "range"] as const).map(pt => (
                        <button key={pt} type="button"
                          onClick={() => setPP({ price_type: pt, price_cents: null, price_display: "" })}
                          className={`px-4 py-2 rounded-full border text-sm capitalize transition-colors ${
                            pp.price_type === pt
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}>
                          {pt === "enquiry" ? "Enquiry" : pt === "fixed" ? "Fixed" : "Price Range"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {pp.price_type === "fixed" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priceDollars">Price (USD)</Label>
                        <Input id="priceDollars" type="number" min={0} placeholder="0"
                          value={pp.price_cents !== null ? pp.price_cents / 100 : ""}
                          onChange={e => setPP({ price_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priceDisplay">Display Text</Label>
                        <Input id="priceDisplay" value={pp.price_display} onChange={e => setPP({ price_display: e.target.value })} placeholder="e.g. $2,500" />
                      </div>
                    </div>
                  )}
                  {pp.price_type === "range" && (
                    <div className="space-y-2">
                      <Label htmlFor="rangeDisplay">Price Range Display</Label>
                      <Input id="rangeDisplay" value={pp.price_display} onChange={e => setPP({ price_display: e.target.value })} placeholder="e.g. $2,000 – $5,000" />
                    </div>
                  )}
                </>
              )}

              {/* ── Step 5 — Review ── */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{fullName}</span>
                    </div>
                    {currentRole && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Role</span>
                        <span className="font-medium">{currentRole}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Specialties</span>
                      <span className="font-medium">{specialtyTags.length} selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Audience tags</span>
                      <span className="font-medium">{audienceTags.length} selected</span>
                    </div>
                    {pp.title && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Product</span>
                          <span className="font-medium">{pp.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Product type</span>
                          <span className="font-medium">{pp.product_type}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Review your details above. Click Submit to complete your profile.</p>
                </div>
              )}

              {/* ── Navigation ── */}
              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
                    Back
                  </Button>
                )}
                {step < 5 ? (
                  <Button type="button" onClick={handleNext} className="flex-1">
                    Next
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} className="flex-1" disabled={state === "submitting"}>
                    {state === "submitting" ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : "Submit"}
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
