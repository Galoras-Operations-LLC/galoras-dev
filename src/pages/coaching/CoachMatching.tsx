import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowRight, UserCircle2, BarChart3, Sparkles, Target, CheckCircle2 } from "lucide-react";

// Maps form answers → coaching directory filter values
const SITUATION_FILTER: Record<string, string> = {
  scaling:     "strategy",
  transition:  "transitions",
  performance: "performance",
  leadership:  "leadership",
};

const OUTCOME_FILTER: Record<string, string> = {
  clarity:    "mindset",
  growth:     "strategy",
  execution:  "performance",
  transition: "transitions",
};

// These values map exactly to goalFilters in CoachingDirectory
const GOAL_FILTER_VALUES = new Set(["transitions", "performance", "leadership", "career", "mindset", "communication"]);

const matchingFactors = [
  {
    icon: UserCircle2,
    title: "Your Profile & Goals",
    description:
      "When you create a Galoras profile, you tell us what you're navigating — your career stage, coaching areas, and the outcomes you're working toward. That context is the foundation of every match.",
  },
  {
    icon: BarChart3,
    title: "Coach Execution Experience",
    description:
      "Every coach on Galoras is assessed on where they have actually performed — not just where they hold credentials. We map your situation against their real operating history, industry context, and demonstrated capability.",
  },
  {
    icon: Sparkles,
    title: "Compass AI Alignment",
    description:
      "Our Compass platform cross-references your profile, stated preferences, and operating context to surface coaches whose background fits your specific environment. The more complete your profile, the sharper the match.",
  },
  {
    icon: Target,
    title: "Contextual Fit — Not Just Compatibility",
    description:
      "We don't match on personality or style alone. Galoras prioritises coaches who have been in situations similar to yours — so you get someone who understands the real constraints, not just the theory.",
  },
];

export default function CoachMatching() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [matched, setMatched] = useState(false);

  const [form, setForm] = useState({
    situation: "",
    stage: "",
    urgency: "",
    outcome: "",
  });

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const goToMatches = () => {
    const filterValue = SITUATION_FILTER[form.situation] || OUTCOME_FILTER[form.outcome] || "";
    const params = new URLSearchParams();
    if (GOAL_FILTER_VALUES.has(filterValue)) {
      params.set("filter", filterValue);
    } else if (filterValue) {
      params.set("category", filterValue);
    }
    params.set("matched", "1");
    // Show brief matched state before navigating
    setMatched(true);
    setTimeout(() => navigate(`/coaching?${params.toString()}`), 900);
  };

  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_55%)]" />
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              Galoras Platform — Coach Matching
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white uppercase mb-5">
              How Matching{" "}
              <span className="text-primary">Works</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Galoras doesn't surface coaches based on popularity or profile polish. We use your goals, context, and operating environment to find someone who has genuinely been where you are.
            </p>
          </div>
        </div>
      </section>

      {/* ── How we use your profile ── */}
      <section className="py-16 bg-zinc-900 border-y border-zinc-800">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
              Using the Galoras Platform to Find Your Best Match
            </h2>
            <p className="text-zinc-400 text-base">
              Every match starts with you. The Galoras platform combines your profile, stated preferences, and current situation to identify coaches whose real-world experience aligns with what you're actually facing — not a generalised version of it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {matchingFactors.map((factor, i) => (
              <div
                key={i}
                className="flex gap-4 p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <factor.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{factor.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Profile nudge */}
          <div className="mt-10 max-w-xl mx-auto text-center">
            <p className="text-sm text-zinc-500 mb-3">
              Don't have a profile yet? Create one free — it only takes two minutes and unlocks personalised matches.
            </p>
            <Link to="/signup?redirect=/coaching/matching">
              <Button size="sm" className="bg-primary text-zinc-950 hover:bg-primary/90 font-bold">
                Create Your Free Profile
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Matching Form ── */}
      <section className="py-16 bg-zinc-950">
        <div className="container-wide">
          <div className="max-w-lg mx-auto">

            <div className="text-center mb-10">
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Map Your Context
              </h2>
              <p className="text-zinc-400 text-sm">
                Answer four quick questions and we'll surface the coaches best matched to your situation.
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      s < step
                        ? "bg-primary text-zinc-950"
                        : s === step
                        ? "bg-primary text-zinc-950 ring-2 ring-primary/30"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-px transition-colors ${s < step ? "bg-primary/50" : "bg-zinc-800"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">What are you dealing with?</h3>
                    <p className="text-sm text-zinc-500">Select the situation that best describes where you are right now.</p>
                  </div>
                  <Select onValueChange={(v) => update("situation", v)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-11">
                      <SelectValue placeholder="Select your situation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scaling">Scaling a business</SelectItem>
                      <SelectItem value="transition">Career transition</SelectItem>
                      <SelectItem value="performance">Performance pressure</SelectItem>
                      <SelectItem value="leadership">Leadership challenge</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setStep(2)} className="w-full bg-primary text-zinc-950 font-bold h-11" disabled={!form.situation}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">What stage are you in?</h3>
                    <p className="text-sm text-zinc-500">This helps us match coaches who've operated at your level.</p>
                  </div>
                  <Select onValueChange={(v) => update("stage", v)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-11">
                      <SelectValue placeholder="Select your stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early">Early stage</SelectItem>
                      <SelectItem value="growth">Growth stage</SelectItem>
                      <SelectItem value="mature">Mature organisation</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-zinc-700 text-zinc-300 h-11">Back</Button>
                    <Button onClick={() => setStep(3)} className="flex-1 bg-primary text-zinc-950 font-bold h-11" disabled={!form.stage}>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">How urgent is this?</h3>
                    <p className="text-sm text-zinc-500">We'll prioritise coaches with immediate availability if needed.</p>
                  </div>
                  <Select onValueChange={(v) => update("urgency", v)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-11">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Exploring options</SelectItem>
                      <SelectItem value="medium">Ready to start soon</SelectItem>
                      <SelectItem value="high">Need support now</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-zinc-700 text-zinc-300 h-11">Back</Button>
                    <Button onClick={() => setStep(4)} className="flex-1 bg-primary text-zinc-950 font-bold h-11" disabled={!form.urgency}>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && !matched && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">What outcome do you want?</h3>
                    <p className="text-sm text-zinc-500">Your goal shapes which coaches are surfaced for you.</p>
                  </div>
                  <Select onValueChange={(v) => update("outcome", v)}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-11">
                      <SelectValue placeholder="Select your desired outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clarity">More clarity and focus</SelectItem>
                      <SelectItem value="growth">Accelerated growth</SelectItem>
                      <SelectItem value="execution">Better execution</SelectItem>
                      <SelectItem value="transition">Successful transition</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(3)} className="flex-1 border-zinc-700 text-zinc-300 h-11">Back</Button>
                    <Button
                      onClick={goToMatches}
                      className="flex-1 bg-primary text-zinc-950 font-bold h-11"
                      disabled={!form.outcome}
                    >
                      See My Matches
                      <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Matched flash */}
              {matched && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  <p className="text-white font-semibold text-lg">Finding your coaches…</p>
                  <p className="text-zinc-500 text-sm">Matched to your context</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
}
