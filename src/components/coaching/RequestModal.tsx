import { useState } from "react";
import { X, Send, Clock, Target, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const URGENCY_OPTIONS = [
  { value: "low", label: "No rush — exploring options" },
  { value: "medium", label: "Within a few weeks" },
  { value: "high", label: "This week" },
  { value: "urgent", label: "Urgent — need help now" },
];

interface Props {
  coachId: string;
  coachName: string;
  productId?: string;
  productTitle?: string;
  productType?: string;
  onClose: () => void;
}

export function RequestModal({ coachId, coachName, productId, productTitle, productType, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const { error } = await (supabase as any).from("coaching_requests").insert({
      coach_id: coachId,
      product_id: productId || null,
      request_type: "request",
      requester_name: name,
      requester_email: email,
      goal,
      context,
      urgency,
      product_title: productTitle || null,
      product_type: productType || null,
    });

    if (error) {
      console.error("Request error:", error);
      setStatus("error");
      return;
    }

    // Notify admin and requester
    try {
      await supabase.functions.invoke("send-admin-alert", {
        body: {
          alertType: "customer_request",
          name, email, coachName,
          product: productTitle || "General enquiry",
          goal, context, urgency,
        },
      });
    } catch (_) { /* non-blocking */ }

    try {
      await supabase.functions.invoke("send-request-confirmation", {
        body: {
          requesterEmail: email,
          name,
          coachName,
          productTitle,
          urgency,
        },
      });
    } catch (_) { /* non-blocking */ }

    setStatus("sent");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Request a session with</p>
            <h3 className="text-white font-bold text-lg leading-tight">{coachName}</h3>
            {productTitle && (
              <p className="text-primary text-xs mt-1">{productTitle}</p>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === "sent" ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <p className="text-white font-semibold mb-1">Request sent!</p>
            <p className="text-zinc-400 text-sm">{coachName} will review your request and get back to you.</p>
            <button onClick={onClose} className="mt-6 px-6 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Your name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                <Target className="h-3 w-3" /> What are you trying to achieve?
              </label>
              <textarea required value={goal} onChange={e => setGoal(e.target.value)}
                placeholder="e.g. I need to get my team aligned on our Q3 priorities..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-primary resize-none" />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                <FileText className="h-3 w-3" /> Context (what's been tried, what's blocking you)
              </label>
              <textarea value={context} onChange={e => setContext(e.target.value)}
                placeholder="Any background that helps the coach understand your situation..."
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-primary resize-none" />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                <Clock className="h-3 w-3" /> How soon do you need this?
              </label>
              <select value={urgency} onChange={e => setUrgency(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary">
                {URGENCY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {status === "error" && (
              <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
            )}

            <button type="submit" disabled={status === "sending"}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold rounded-lg py-2.5 text-sm transition-colors">
              <Send className="h-4 w-4" />
              {status === "sending" ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
