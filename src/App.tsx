import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePageTracker } from "@/hooks/usePageTracker";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Coaching
import { CoachingDirectory, CoachProfile, WhyCoaching } from "./pages/coaching";
import CoachMatching from "./pages/coaching/CoachMatching";
import CoachCompare from "./pages/coaching/CoachCompare";
import CoachDashboard from "./pages/coaching/CoachDashboard";
import CoachProfileEdit from "./pages/coaching/CoachProfileEdit";
import CoachOnboarding from "./pages/coaching/CoachOnboarding";
import OnboardRedirect from "./pages/coaching/OnboardRedirect";
import CoachesAdmin from "./pages/admin/Coaches";

// Business
import { Business, SportOfBusiness, LeadershipCircles, Workshops, Diagnostics } from "./pages/business";

// Core pages
import Compass from "./pages/Compass";
import Labs from "./pages/Labs";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Apply from "./pages/Apply";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import BookingSuccess from "./pages/BookingSuccess";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Onboarding from "./pages/Onboarding";
import CoachSignup from "./pages/CoachSignup";

// Admin
import ImageGenerator from "./pages/admin/ImageGenerator";
import CoachCutoutManager from "./pages/admin/CoachCutoutManager";
import Applicants from "./pages/admin/Applicants";
import CoachesList from "./pages/admin/CoachesList";
import CoachEditorDetail from "./pages/admin/CoachEditorDetail";
import Bookings from "@/pages/admin/Bookings";
import ProductManager from "@/pages/admin/ProductManager";
import Portal from "./pages/admin/Portal";
import AgentEvaluation from "./pages/admin/AgentEvaluation";
import Leads from "./pages/admin/Leads";
import CompleteRegistration from "./pages/CompleteRegistration";

// Legal pages
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Payments from "./pages/legal/Payments";
import CoachAgreement from "./pages/legal/CoachAgreement";
import CookiePolicy from "./pages/legal/CookiePolicy";

const queryClient = new QueryClient();

const PAYMENT_GATE = import.meta.env.VITE_PAYMENT_GATE === "true";
const GATE_PW = import.meta.env.VITE_GATE_PASSWORD ?? "";
const GATE_KEY = "glrs_gate";

function PaymentGate({ children }: { children: React.ReactNode }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(() => GATE_PW !== "" && sessionStorage.getItem(GATE_KEY) === GATE_PW);

  if (!PAYMENT_GATE || ok) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (val === GATE_PW) { sessionStorage.setItem(GATE_KEY, GATE_PW); setOk(true); }
    else { setErr(true); setVal(""); }
  };

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#0E0E0E", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem", fontFamily:"sans-serif" }}>
      <div style={{ maxWidth:340, width:"100%", textAlign:"center" }}>
        <p style={{ color:"#59A4E5", fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>Restricted</p>
        <h1 style={{ color:"#fff", fontSize:20, fontWeight:700, marginBottom:6 }}>Access Required</h1>
        <p style={{ color:"#666", fontSize:13, marginBottom:24 }}>Enter your passcode to continue.</p>
        <form onSubmit={submit}>
          <input type="password" value={val} autoFocus placeholder="Passcode"
            onChange={e => { setVal(e.target.value); setErr(false); }}
            style={{ width:"100%", padding:"10px 14px", backgroundColor:"#1a1a1a", border:`1px solid ${err?"#e05555":"#2a2a2a"}`, color:"#fff", fontSize:14, outline:"none", marginBottom:6, boxSizing:"border-box" }} />
          {err && <p style={{ color:"#e05555", fontSize:12, marginBottom:6 }}>Incorrect passcode.</p>}
          <button type="submit" style={{ width:"100%", padding:"10px 0", backgroundColor:"#59A4E5", color:"#fff", fontWeight:700, fontSize:13, border:"none", cursor:"pointer" }}>CONTINUE</button>
        </form>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setState("denied");
        return;
      }
      if (requireAdmin) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setState(data ? "allowed" : "denied");
      } else {
        setState("allowed");
      }
    })();
  }, [requireAdmin]);

  if (state === "loading") return null;
  if (state === "denied") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function CoachOnboardingRedirect() {
  const location = useLocation();
  return <Navigate to={`/coaching/onboarding${location.search}`} replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppRoutes() {
  usePageTracker();
  return (
    <>
    <ScrollToTop />
    <Routes>
          {/* Home */}
          <Route path="/" element={<Index />} />

          {/* B2C Routes — static routes MUST come before dynamic :coachId */}
          <Route path="/coaching" element={<PaymentGate><CoachingDirectory /></PaymentGate>} />
          <Route path="/coaching/matching" element={<PaymentGate><CoachMatching /></PaymentGate>} />
          <Route path="/coaching/compare" element={<PaymentGate><CoachCompare /></PaymentGate>} />
          <Route path="/coaching/why" element={<WhyCoaching />} />
          <Route path="/coaching/onboarding" element={<CoachOnboarding />} />
          <Route path="/coaching/:coachId" element={<CoachProfile />} />
          <Route path="/coach/:slug" element={<CoachProfile />} />
          <Route path="/coach/onboarding" element={<CoachOnboardingRedirect />} />
          <Route path="/onboard/:shortId" element={<OnboardRedirect />} />

          {/* B2B Routes */}
          <Route path="/business" element={<Business />} />
          <Route path="/business/sport-of-business" element={<SportOfBusiness />} />
          <Route path="/business/leadership-circles" element={<LeadershipCircles />} />
          <Route path="/business/workshops" element={<Workshops />} />
          <Route path="/business/diagnostics" element={<Diagnostics />} />

          {/* Core Routes */}
          <Route path="/compass" element={<Compass />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

          {/* Coach signup */}
          <Route path="/coach-signup" element={<CoachSignup />} />

          {/* Payments & Subscriptions */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/complete-registration" element={<CompleteRegistration />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Navigate to="/coach-dashboard" replace />} />
          <Route
            path="/coach-dashboard"
            element={
              <PaymentGate>
                <ProtectedRoute>
                  <CoachDashboard />
                </ProtectedRoute>
              </PaymentGate>
            }
          />
          <Route
            path="/coach-dashboard/edit"
            element={
              <PaymentGate>
                <ProtectedRoute>
                  <CoachProfileEdit />
                </ProtectedRoute>
              </PaymentGate>
            }
          />

          {/* Admin Portal (dev-only guard is inside the component) */}
          <Route
            path="/admin/portal"
            element={
              <PaymentGate>
                <ProtectedRoute requireAdmin>
                  <Portal />
                </ProtectedRoute>
              </PaymentGate>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/images"
            element={
              <PaymentGate>
                <ProtectedRoute requireAdmin>
                  <ImageGenerator />
                </ProtectedRoute>
              </PaymentGate>
            }
          />
          <Route
            path="/admin/coach-cutouts"
            element={
              <PaymentGate>
                <ProtectedRoute requireAdmin>
                  <CoachCutoutManager />
                </ProtectedRoute>
              </PaymentGate>
            }
          />
          <Route
            path="/admin/applicants"
            element={
              <PaymentGate>
                <ProtectedRoute requireAdmin>
                  <Applicants />
                </ProtectedRoute>
              </PaymentGate>
            }
          />
          <Route
            path="/admin/coaches"
            element={
              <PaymentGate>
                <ProtectedRoute requireAdmin>
                  <CoachesList />
                </ProtectedRoute>
              </PaymentGate>
            }
          />
          <Route
            path="/admin/coaches/:id"
            element={
              <PaymentGate>
                <ProtectedRoute requireAdmin>
                  <CoachEditorDetail />
                </ProtectedRoute>
              </PaymentGate>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <PaymentGate>
                <ProtectedRoute requireAdmin>
                  <Bookings />
                </ProtectedRoute>
              </PaymentGate>
            }
          />
          <Route
            path="/admin/products"
            element={
              <PaymentGate>
                <ProtectedRoute requireAdmin>
                  <ProductManager />
                </ProtectedRoute>
              </PaymentGate>
            }
          />
          <Route
            path="/admin/leads"
            element={
              <PaymentGate>
                <ProtectedRoute requireAdmin>
                  <Leads />
                </ProtectedRoute>
              </PaymentGate>
            }
          />
          <Route
            path="/admin/agent-evaluation"
            element={
              <PaymentGate>
                <ProtectedRoute requireAdmin>
                  <AgentEvaluation />
                </ProtectedRoute>
              </PaymentGate>
            }
          />

          {/* Legal Routes */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/legal/payments" element={<Payments />} />
          <Route path="/legal/coach-agreement" element={<CoachAgreement />} />

          {/* Always last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
