import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2, XCircle, RefreshCw, Clock, User,
  Linkedin, Globe, Mail, Phone, Loader2, AlertTriangle,
} from "lucide-react";

type Application = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  bio: string | null;
  why_galoras: string | null;
  status: string | null;
  review_status: string;
  reviewer_notes: string | null;
  decision_reason: string | null;
  fit_score: number;
  created_at: string | null;
  // joined from profiles via email match
  user_id?: string | null;
};

type PortfolioCount = { tier: string; count: number };

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending:            { label: "Pending",          color: "bg-zinc-700 text-zinc-300" },
  under_review:       { label: "Under Review",     color: "bg-sky-900 text-sky-300" },
  approved:           { label: "Approved",         color: "bg-emerald-900 text-emerald-300" },
  revision_requested: { label: "Needs Revision",   color: "bg-amber-900 text-amber-300" },
  rejected:           { label: "Rejected",         color: "bg-red-900 text-red-300" },
};

function Badge({ status }: { status: string }) {
  const b = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${b.color}`}>
      {b.label}
    </span>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400 w-32 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-zinc-400 w-6 text-right">{value}</span>
    </div>
  );
}

export default function Applicants() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [fitScore, setFitScore] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioCount[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: apps }, { data: coaches }] = await Promise.all([
      supabase
        .from("coach_applications")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("coaches")
        .select("tier")
        .eq("lifecycle_status", "published"),
    ]);

    const rows = (apps as unknown as Application[]) ?? [];
    setApplications(rows);
    if (rows.length > 0 && !selected) {
      setSelected(rows[0]);
      setFitScore(rows[0].fit_score ?? 0);
      setDecisionNotes(rows[0].reviewer_notes ?? "");
    }

    // Portfolio density
    const counts: Record<string, number> = {};
    (coaches ?? []).forEach((c: any) => {
      const t = c.tier ?? "unset";
      counts[t] = (counts[t] ?? 0) + 1;
    });
    setPortfolio(Object.entries(counts).map(([tier, count]) => ({ tier, count })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const selectApp = (app: Application) => {
    setSelected(app);
    setFitScore(app.fit_score ?? 0);
    setDecisionNotes(app.reviewer_notes ?? "");
  };

  // ── Save fit score + notes without making a decision ──────────────────────
  const saveDraft = async () => {
    if (!selected) return;
    setSaving(true);
    await supabase
      .from("coach_applications")
      .update({
        fit_score: fitScore,
        reviewer_notes: decisionNotes,
        review_status: "under_review",
        status: "under_review",
      })
      .eq("id", selected.id);
    toast({ title: "Saved", description: "Notes and score updated." });
    setSaving(false);
    fetchAll();
  };

  // ── Decision handler ───────────────────────────────────────────────────────
  const decide = async (action: "approved" | "revision_requested" | "rejected") => {
    if (!selected) return;
    if (action !== "approved" && !decisionNotes.trim()) {
      toast({
        title: "Notes required",
        description: "Please provide a reason before rejecting or requesting revision.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    // Get the coach's user_id from auth.users via email match
    const { data: authUsers } = await supabase
      .from("profiles")
      .select("id")
      .eq("full_name", selected.full_name ?? "")
      .maybeSingle();

    const { data: { session } } = await supabase.auth.getSession();

    if (action === "approved") {
      // Find the coach's user_id via email in profiles
      const { data: profileByEmail } = await supabase
        .from("profiles")
        .select("id")
        .limit(100);

      // Try to find by coach_registrations email
      const { data: reg } = await supabase
        .from("coach_registrations")
        .select("user_id")
        .eq("email", selected.email)
        .maybeSingle();

      if (!reg?.user_id) {
        toast({
          title: "No registration found",
          description: "This coach hasn't completed the payment setup yet.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const { error: fnError } = await supabase.functions.invoke("approve-coach", {
        body: {
          applicationId: selected.id,
          coachUserId: reg.user_id,
          decisionReason: decisionNotes,
        },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (fnError) {
        toast({ title: "Approval failed", description: fnError.message, variant: "destructive" });
        setSaving(false);
        return;
      }

      toast({ title: "Coach approved!", description: "Subscription activated and coach published." });
    } else {
      // Reject or revision — update application only
      await supabase
        .from("coach_applications")
        .update({
          review_status: action,
          status: action,
          reviewer_notes: decisionNotes,
          decision_reason: decisionNotes,
          fit_score: fitScore,
        })
        .eq("id", selected.id);

      toast({
        title: action === "rejected" ? "Application rejected" : "Revision requested",
        description: "Application status updated.",
      });
    }

    setSaving(false);
    fetchAll();
  };

  const totalCoaches = portfolio.reduce((s, p) => s + p.count, 0);

  return (
    <Layout>
      <section className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
              Admin · Coach Approval
            </p>
            <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">
              Coach Approval Dashboard
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Intelligent selection for the Galoras performance network.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading applications…</span>
            </div>
          ) : (
            <div className="grid grid-cols-[260px_1fr_220px] gap-5">

              {/* ── LEFT: Applicant list ── */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Applications ({applications.length})
                </p>
                {applications.length === 0 && (
                  <p className="text-zinc-600 text-sm">No applications yet.</p>
                )}
                {applications.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => selectApp(app)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                      selected?.id === app.id
                        ? "border-primary bg-primary/10"
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {app.full_name || "Unnamed"}
                        </p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{app.email}</p>
                      </div>
                      {app.fit_score > 0 && (
                        <span className="text-xs font-bold text-primary shrink-0">{app.fit_score}</span>
                      )}
                    </div>
                    <div className="mt-2">
                      <Badge status={app.review_status ?? "pending"} />
                    </div>
                  </button>
                ))}
              </div>

              {/* ── CENTER: Coach snapshot + decision ── */}
              {selected ? (
                <div className="space-y-4">

                  {/* Snapshot card */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">{selected.full_name}</h2>
                        <p className="text-zinc-400 text-sm mt-0.5">
                          Applied {selected.created_at
                            ? new Date(selected.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </p>
                      </div>
                      <Badge status={selected.review_status ?? "pending"} />
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-5">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{selected.email}</span>
                      </div>
                      {selected.phone && (
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{selected.phone}</span>
                        </div>
                      )}
                      {selected.linkedin_url && (
                        <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Linkedin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">LinkedIn</span>
                        </a>
                      )}
                      {selected.website_url && (
                        <a href={selected.website_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Website</span>
                        </a>
                      )}
                    </div>

                    {selected.bio && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Bio</p>
                        <p className="text-sm text-zinc-300 leading-relaxed">{selected.bio}</p>
                      </div>
                    )}
                    {selected.why_galoras && (
                      <div>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Why Galoras</p>
                        <p className="text-sm text-zinc-300 leading-relaxed">{selected.why_galoras}</p>
                      </div>
                    )}
                  </div>

                  {/* Fit Score */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                        Ecosystem Fit Score
                      </h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={fitScore}
                          onChange={(e) => setFitScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-16 text-center bg-zinc-800 border border-zinc-700 text-primary font-bold text-xl rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-zinc-500 text-sm">/ 100</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <ScoreBar label="Expertise Depth" value={Math.round(fitScore * 0.2)} />
                      <ScoreBar label="Differentiation" value={Math.round(fitScore * 0.15)} />
                      <ScoreBar label="Market Demand" value={Math.round(fitScore * 0.2)} />
                      <ScoreBar label="Portfolio Gap" value={Math.round(fitScore * 0.2)} />
                      <ScoreBar label="Enterprise Ready" value={Math.round(fitScore * 0.1)} />
                      <ScoreBar label="Brand Alignment" value={Math.round(fitScore * 0.15)} />
                    </div>
                    <p className="text-xs text-zinc-600 mt-3">
                      AI scoring will auto-populate these dimensions in a future release.
                    </p>
                  </div>

                  {/* Decision Panel */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                      Decision Panel
                    </h3>

                    <div className="mb-4">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
                        Notes / Reason
                        <span className="text-zinc-600 font-normal ml-1">(required for reject or revision)</span>
                      </label>
                      <textarea
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        rows={3}
                        placeholder="Internal notes about this application…"
                        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-xl px-3 py-2.5 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <Button
                        onClick={() => decide("approved")}
                        disabled={saving}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                          <><CheckCircle2 className="h-4 w-4 mr-2" />Approve</>
                        )}
                      </Button>
                      <Button
                        onClick={() => decide("revision_requested")}
                        disabled={saving}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-12"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />Revision
                      </Button>
                      <Button
                        onClick={() => decide("rejected")}
                        disabled={saving}
                        className="bg-red-700 hover:bg-red-600 text-white font-bold h-12"
                      >
                        <XCircle className="h-4 w-4 mr-2" />Reject
                      </Button>
                    </div>

                    <button
                      onClick={saveDraft}
                      disabled={saving}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Save notes without deciding
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center text-zinc-600">
                  <p>Select an application to review.</p>
                </div>
              )}

              {/* ── RIGHT: Portfolio density ── */}
              <div className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                    Portfolio Density
                  </h3>
                  <p className="text-xs text-zinc-500 mb-3">
                    Published coaches: <span className="text-white font-semibold">{totalCoaches}</span>
                  </p>

                  {portfolio.length === 0 ? (
                    <p className="text-xs text-zinc-600">No published coaches yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {["master", "elite", "pro"].map((tier) => {
                        const count = portfolio.find((p) => p.tier === tier)?.count ?? 0;
                        const pct = totalCoaches > 0 ? Math.round((count / totalCoaches) * 100) : 0;
                        const colors: Record<string, string> = {
                          master: "bg-amber-500",
                          elite:  "bg-primary",
                          pro:    "bg-zinc-500",
                        };
                        return (
                          <div key={tier}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-zinc-400 capitalize">{tier}</span>
                              <span className="text-zinc-400">{count} · {pct}%</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${colors[tier]}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick stats */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    Pipeline
                  </h3>
                  {[
                    { label: "Pending",      status: "pending",            icon: Clock },
                    { label: "Under Review", status: "under_review",       icon: User },
                    { label: "Approved",     status: "approved",           icon: CheckCircle2 },
                    { label: "Revision",     status: "revision_requested", icon: RefreshCw },
                    { label: "Rejected",     status: "rejected",           icon: XCircle },
                  ].map(({ label, status, icon: Icon }) => {
                    const count = applications.filter((a) => (a.review_status ?? "pending") === status).length;
                    return (
                      <div key={status} className="flex items-center justify-between py-1.5 border-b border-zinc-800 last:border-0">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-zinc-600" />
                          <span className="text-xs text-zinc-400">{label}</span>
                        </div>
                        <span className="text-xs font-semibold text-white">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {selected?.decision_reason && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Last Decision
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{selected.decision_reason}</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
