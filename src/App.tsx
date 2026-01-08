import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CoachingDirectory, CoachProfile, CoachMatching, WhyCoaching } from "./pages/coaching";
import Compass from "./pages/Compass";
import Labs from "./pages/Labs";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Apply from "./pages/Apply";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

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
          <Route path="/coaching/matching" element={<CoachMatching />} />
          <Route path="/coaching/why" element={<WhyCoaching />} />
          {/* B2B Routes */}
          <Route path="/business" element={<NotFound />} />
          <Route path="/business/sport-of-business" element={<NotFound />} />
          <Route path="/business/leadership-circles" element={<NotFound />} />
          <Route path="/business/workshops" element={<NotFound />} />
          <Route path="/business/diagnostics" element={<NotFound />} />
          {/* Other Routes */}
          <Route path="/compass" element={<Compass />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
