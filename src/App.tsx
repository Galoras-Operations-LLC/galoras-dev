import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Coaching
import { CoachingDirectory, CoachProfile, WhyCoaching } from "./pages/coaching";
import CoachMatching from "./pages/coaching/CoachMatching";
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

// Admin
import ImageGenerator from "./pages/admin/ImageGenerator";
import CoachCutoutManager from "./pages/admin/CoachCutoutManager";
import Applicants from "./pages/admin/Applicants";
import CoachesList from "./pages/admin/CoachesList";
import CoachEditorDetail from "./pages/admin/CoachEditorDetail";
import Bookings from "@/pages/admin/Bookings";

const queryClient = new QueryClient();

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Index />} />

          {/* B2C Routes — static routes MUST come before dynamic :coachId */}
          <Route path="/coaching" element={<CoachingDirectory />} />
          <Route path="/coaching/matching" element={<CoachMatching />} />
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

          {/* Payments & Subscriptions */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/subscription-success" element={<SubscriptionSuccess />} />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach-dashboard"
            element={
              <ProtectedRoute>
                <CoachDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach-dashboard/edit"
            element={
              <ProtectedRoute>
                <CoachProfileEdit />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/images"
            element={
              <ProtectedRoute requireAdmin>
                <ImageGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coach-cutouts"
            element={
              <ProtectedRoute requireAdmin>
                <CoachCutoutManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applicants"
            element={
              <ProtectedRoute requireAdmin>
                <Applicants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coaches"
            element={
              <ProtectedRoute requireAdmin>
                <CoachesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/coaches/:id"
            element={
              <ProtectedRoute requireAdmin>
                <CoachEditorDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute requireAdmin>
                <Bookings />
              </ProtectedRoute>
            }
          />

          {/* Always last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
