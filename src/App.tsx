import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CoachingDirectory, CoachProfile, CoachMatching, WhyCoaching } from "./pages/coaching";
import CoachDashboard from "./pages/coaching/CoachDashboard";
import CoachProfileEdit from "./pages/coaching/CoachProfileEdit";
import CoachOnboarding from "./pages/coaching/CoachOnboarding";
import OnboardRedirect from "./pages/coaching/OnboardRedirect";
import { Business, SportOfBusiness, LeadershipCircles, Workshops, Diagnostics } from "./pages/business";
import Compass from "./pages/Compass";
import Labs from "./pages/Labs";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Apply from "./pages/Apply";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ImageGenerator from "./pages/admin/ImageGenerator";
import CoachCutoutManager from "./pages/admin/CoachCutoutManager";
import Applicants from "./pages/admin/Applicants";

const queryClient = new QueryClient();

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
          <Route path="/" element={<Index />} />
          {/* B2C Routes */}
          <Route path="/coaching" element={<CoachingDirectory />} />
          <Route path="/coaching/:coachId" element={<CoachProfile />} />
          <Route path="/coach/:slug" element={<CoachProfile />} />
          <Route path="/coaching/matching" element={<CoachMatching />} />
          <Route path="/coaching/why" element={<WhyCoaching />} />
          <Route path="/coaching/onboarding" element={<CoachOnboarding />} />
          <Route path="/coach/onboarding" element={<CoachOnboardingRedirect />} />
          <Route path="/onboard/:shortId" element={<OnboardRedirect />} />
          {/* B2B Routes */}
          <Route path="/business" element={<Business />} />
          <Route path="/business/sport-of-business" element={<SportOfBusiness />} />
          <Route path="/business/leadership-circles" element={<LeadershipCircles />} />
          <Route path="/business/workshops" element={<Workshops />} />
          <Route path="/business/diagnostics" element={<Diagnostics />} />
          {/* Other Routes */}
          <Route path="/compass" element={<Compass />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coach-dashboard" element={<CoachDashboard />} />
          <Route path="/coach-dashboard/edit" element={<CoachProfileEdit />} />
          {/* Admin Routes */}
          <Route path="/admin/images" element={<ImageGenerator />} />
          <Route path="/admin/coach-cutouts" element={<CoachCutoutManager />} />
          <Route path="/admin/applicants" element={<Applicants />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
