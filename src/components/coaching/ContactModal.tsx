import { useState } from "react";
import { X, Send } from "lucide-react";

type Props = {
  coachId: string;
  coachName: string;
  onClose: () => void;
};

export function ContactModal({ coachId, coachName, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://qbjuomsmnrclsjhdsjcz.supabase.co"}/functions/v1/send-contact-message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coachId,
            senderName: name,
            senderEmail: email,
            message,
          }),
        },
      );
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Send a message to</p>
            <h3 className="text-white font-bold text-lg leading-tight">{coachName}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === "sent" ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <p className="text-white font-semibold mb-1">Message sent!</p>
            <p className="text-zinc-400 text-sm">{coachName} will be in touch with you soon.</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Your name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the coach what you're looking to work on..."
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold rounded-lg py-2.5 text-sm transition-colors"
            >
              <Send className="h-4 w-4" />
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
