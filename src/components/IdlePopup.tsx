/**
 * IdlePopup — shows a registration prompt after 3 seconds of user inactivity.
 * Only shown to guests (not logged-in users) and only once per session.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const IDLE_MS = 3000;
const SESSION_KEY = "galoras_idle_popup_shown";

export function IdlePopup() {
  const { isLoggedIn, isLoading } = useAuth();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!sessionStorage.getItem(SESSION_KEY)) {
        setVisible(true);
        sessionStorage.setItem(SESSION_KEY, "1");
      }
    }, IDLE_MS);
  };

  useEffect(() => {
    // Don't show if logged in or still loading
    if (isLoading || isLoggedIn) return;
    // Don't show if already shown this session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset(); // start timer immediately on mount

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoggedIn, isLoading]);

  if (!visible) return null;

  const handleRegister = () => {
    setVisible(false);
    navigate("/signup");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setVisible(false)}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary to-sky-400" />

        <div className="p-6">
          <button
            onClick={() => setVisible(false)}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Galoras Coaching Exchange
            </span>
          </div>

          <h2 className="text-xl font-display font-bold text-white mb-2 leading-tight">
            Unlock your personalised coach matches
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Create a free profile and we'll match you with coaches aligned to your goals, industry, and challenges — in seconds.
          </p>

          <div className="space-y-2">
            <button
              onClick={handleRegister}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl py-3 text-sm transition-colors"
            >
              Get started — it's free
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setVisible(false)}
              className="w-full text-zinc-500 hover:text-zinc-300 text-sm py-2 transition-colors"
            >
              Continue browsing
            </button>
          </div>

          <p className="text-zinc-600 text-xs text-center mt-4">
            No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
