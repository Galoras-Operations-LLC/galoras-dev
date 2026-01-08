import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Target,
  Users,
  Brain,
  Clock,
  CheckCircle,
  Star,
  Zap
} from "lucide-react";

type Step = {
  id: number;
  title: string;
  question: string;
  options: { id: string; label: string; icon?: typeof Target }[];
  multiSelect?: boolean;
};

const steps: Step[] = [
  {
    id: 1,
    title: "Focus Area",
    question: "What area of your life or work do you want to focus on?",
    options: [
      { id: "leadership", label: "Leadership & Management", icon: Target },
      { id: "career", label: "Career Development", icon: Zap },
      { id: "performance", label: "Performance & Productivity", icon: Star },
      { id: "mindset", label: "Mindset & Wellbeing", icon: Brain },
      { id: "communication", label: "Communication Skills", icon: Users },
      { id: "transitions", label: "Life Transitions", icon: ArrowRight },
    ],
    multiSelect: true,
  },
  {
    id: 2,
    title: "Goals",
    question: "What are you hoping to achieve through coaching?",
    options: [
      { id: "clarity", label: "Gain clarity on direction" },
      { id: "confidence", label: "Build confidence" },
      { id: "habits", label: "Develop better habits" },
      { id: "skills", label: "Build specific skills" },
      { id: "balance", label: "Improve work-life balance" },
      { id: "growth", label: "Accelerate career growth" },
    ],
    multiSelect: true,
  },
  {
    id: 3,
    title: "Coaching Style",
    question: "What coaching style resonates with you most?",
    options: [
      { id: "direct", label: "Direct & challenging" },
      { id: "supportive", label: "Supportive & encouraging" },
      { id: "structured", label: "Structured & process-driven" },
      { id: "exploratory", label: "Exploratory & reflective" },
      { id: "action", label: "Action-oriented" },
      { id: "holistic", label: "Holistic & integrative" },
    ],
    multiSelect: false,
  },
  {
    id: 4,
    title: "Experience Level",
    question: "What's your current career stage?",
    options: [
      { id: "early", label: "Early career (0-5 years)" },
      { id: "mid", label: "Mid-career (5-15 years)" },
      { id: "senior", label: "Senior/Executive (15+ years)" },
      { id: "founder", label: "Founder/Entrepreneur" },
      { id: "transition", label: "In career transition" },
    ],
    multiSelect: false,
  },
  {
    id: 5,
    title: "Availability",
    question: "How much time can you commit to coaching?",
    options: [
      { id: "weekly", label: "Weekly sessions" },
      { id: "biweekly", label: "Bi-weekly sessions" },
      { id: "monthly", label: "Monthly check-ins" },
      { id: "intensive", label: "Intensive program (daily/multi-day)" },
      { id: "flexible", label: "Flexible / As needed" },
    ],
    multiSelect: false,
  },
];

export default function CoachMatching() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [additionalContext, setAdditionalContext] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;
  const step = steps[currentStep];

  const handleSelect = (optionId: string) => {
    const currentAnswers = answers[step.id] || [];
    
    if (step.multiSelect) {
      if (currentAnswers.includes(optionId)) {
        setAnswers({ ...answers, [step.id]: currentAnswers.filter(id => id !== optionId) });
      } else {
        setAnswers({ ...answers, [step.id]: [...currentAnswers, optionId] });
      }
    } else {
      setAnswers({ ...answers, [step.id]: [optionId] });
    }
  };

  const isSelected = (optionId: string) => {
    return (answers[step?.id] || []).includes(optionId);
  };

  const canProceed = () => {
    if (!step) return true;
    return (answers[step.id] || []).length > 0;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show additional context step
      setCurrentStep(steps.length);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2000);
  };

  if (isComplete) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center pt-20">
          <div className="container-wide max-w-3xl text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-pulse">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Your Matches Are Ready!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Based on your preferences, we've identified coaches who align perfectly with your goals and style.
            </p>

            {/* Sample Matches Preview */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { match: 95, name: "Sarah Mitchell", specialty: "Executive Leadership" },
                { match: 91, name: "James Chen", specialty: "Career Transitions" },
                { match: 88, name: "Elena Rodriguez", specialty: "Performance Coaching" },
              ].map((coach, i) => (
                <Card key={i} className="text-left">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {coach.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{coach.name}</p>
                        <p className="text-xs text-muted-foreground">{coach.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={coach.match} className="h-2 flex-1" />
                      <span className="text-sm font-semibold text-primary">{coach.match}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/coaching">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  View All Matches
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline">
                  Create Account to Save
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] pt-32 pb-16">
        <div className="container-wide max-w-3xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Compass AI Matching
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Find Your Perfect Coach Match
            </h1>
            <p className="text-muted-foreground">
              Answer a few questions and let our AI match you with coaches who fit your needs.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Step {currentStep + 1} of {steps.length + 1}
              </span>
              <span className="font-medium">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardContent className="p-8">
              {currentStep < steps.length ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{step.title}</Badge>
                    {step.multiSelect && (
                      <span className="text-xs text-muted-foreground">(Select all that apply)</span>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-display font-semibold mb-8">
                    {step.question}
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {step.options.map((option) => {
                      const Icon = option.icon;
                      const selected = isSelected(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelect(option.id)}
                          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                            selected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          {Icon && (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              selected ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                          )}
                          <span className="font-medium">{option.label}</span>
                          {selected && !Icon && (
                            <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="mb-2">Additional Context</Badge>
                  <h2 className="text-xl md:text-2xl font-display font-semibold mb-4">
                    Anything else you'd like us to know?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Share any specific challenges, goals, or preferences that would help us find your ideal coach match.
                  </p>
                  <Textarea
                    placeholder="e.g., I'm preparing for a promotion to VP, dealing with imposter syndrome, looking for someone with tech industry experience..."
                    className="min-h-[150px]"
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={currentStep === 0 ? "invisible" : ""}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Finding Matches...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Find My Matches
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}