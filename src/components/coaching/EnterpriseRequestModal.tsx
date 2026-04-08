import { useState } from "react";
import { X, Send, Building2, Users, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TEAM_SIZE_OPTIONS = [
  "5–10 leaders",
  "10–25 leaders",
  "25–50 leaders",
  "50–100 leaders",
  "100+ leaders",
];

interface Props {
  coachId: string;
  coachName: string;
  productId?: string;
  productTitle?: string;
  productType?: string;
  onClose: () => void;
}

export function EnterpriseRequestModal({ coachId, coachName, productId, productTitle, productType, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [problem, setProblem] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const { error } = await (supabase as any).from("coaching_requests").insert({
      coach_id: coachId,
      product_id: productId || null,
      request_type: "enterprise",
      requester_name: name,
      requester_email: email,
      requester_phone: phone || null,
      company_name: company,
      team_size: teamSize,
      problem_statement: problem,
      product_title: productTitle || null,
      product_type: productType || null,
      urgency: "high",
    });

    if (error) {
      console.error("Enterprise request error:", error);
      setStatus("error");
      return;
    }

    // Notify coach + admin (Conor)
    try {
      await supabase.functions.invoke("send-booking-notification", {
        body: {
          type: "enterprise_request",
          coachId,
          coachName,
          clientEmail: email,
          clientName: `${name} (${company})`,
          productTitle: productTitle || "Enterprise Engagement",
          notes: `Company: ${company}\nTeam size: ${teamSize}\nProblem: ${problem}\nPhone: ${phone || "N/A"}`,
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
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-orange-400" />
              <p className="text-xs text-orange-400 uppercase tracking-wider font-semibold">Enterprise Request</p>
            </div>
            <h3 className="text-white font-bold text-lg leading-tight">{coachName}</h3>
            {productTitle && (
              <p className="text-zinc-400 text-xs mt-1">{productTitle}</p>
            )}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === "sent" ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-white font-semibold mb-1">Proposal request submitted</p>
            <p className="text-zinc-400 text-sm">Our team will review your requirements and follow up within 24 hours.</p>
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                  <Building2 className="h-3 w-3" /> Company
                </label>
                <input type="text" required value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Phone (optional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                <Users className="h-3 w-3" /> Team size
              </label>
              <select required value={teamSize} onChange={e => setTeamSize(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500">
                <option value="">Select team size...</option>
                {TEAM_SIZE_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                <FileText className="h-3 w-3" /> What problem are you trying to solve?
              </label>
              <textarea required value={problem} onChange={e => setProblem(e.target.value)}
                placeholder="Describe the challenge your team or organisation is facing..."
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 resize-none" />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
            )}

            <button type="submit" disabled={status === "sending"}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-zinc-950 font-semibold rounded-lg py-2.5 text-sm transition-colors">
              <Send className="h-4 w-4" />
              {status === "sending" ? "Submitting..." : "Request Proposal"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
