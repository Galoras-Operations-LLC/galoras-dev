import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink } from "lucide-react";

type CoachRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  headline: string | null;
  tier: string | null;
  lifecycle_status: string | null;
};

const LIFECYCLE_BADGE: Record<string, { label: string; color: string }> = {
  draft:             { label: "Draft",            color: "bg-zinc-700/60 text-zinc-300 border-zinc-600" },
  submitted:         { label: "Submitted",        color: "bg-sky-900/60 text-sky-300 border-sky-700" },
  under_review:      { label: "Under Review",     color: "bg-blue-900/60 text-blue-300 border-blue-700" },
  revision_required: { label: "Needs Revision",   color: "bg-orange-900/60 text-orange-300 border-orange-700" },
  approved:          { label: "Approved",         color: "bg-amber-900/60 text-amber-300 border-amber-700" },
  published:         { label: "Published",        color: "bg-emerald-900/60 text-emerald-300 border-emerald-700" },
  rejected:          { label: "Rejected",         color: "bg-red-900/60 text-red-400 border-red-800" },
};

const TIER_BADGE: Record<string, string> = {
  master: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  elite:  "bg-sky-500/20 text-sky-300 border-sky-500/40",
  pro:    "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

const FILTER_OPTIONS = [
  { value: "all",             label: "All" },
  { value: "published",       label: "Published" },
  { value: "approved",        label: "Approved" },
  { value: "under_review",    label: "Under Review" },
  { value: "submitted",       label: "Submitted" },
  { value: "draft",           label: "Draft" },
  { value: "revision_required", label: "Needs Revision" },
  { value: "rejected",        label: "Rejected" },
];

export default function CoachesList() {
  const [coaches, setCoaches] = useState<CoachRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => { fetchCoaches(); }, []);

  const fetchCoaches = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("coaches")
      .select("id, display_name, email, headline, tier, lifecycle_status")
      .order("display_name", { ascending: true });
    setCoaches((data as CoachRow[]) || []);
    setLoading(false);
  };

  const setTier = async (id: string, tier: string) => {
    setSavingId(id);
    await supabase.from("coaches").update({ tier: tier || null }).eq("id", id);
    setSavingId(null);
    fetchCoaches();
  };

  const setLifecycle = async (id: string, lifecycle_status: string) => {
    setSavingId(id);
    const now = new Date().toISOString();
    const extra: Record<string, string | null> = {};
    if (lifecycle_status === "published") { extra.published_at = now; extra.status = "published"; }
    if (lifecycle_status === "approved")  { extra.reviewed_at = now;  extra.status = "approved"; }
    if (lifecycle_status === "draft")     { extra.published_at = null; extra.status = "pending"; }
    await supabase.from("coaches").update({ lifecycle_status, ...extra }).eq("id", id);
    setSavingId(null);
    fetchCoaches();
  };

  const filtered = coaches.filter((c) =>
    filter === "all" ? true : c.lifecycle_status === filter
  );

  const counts = Object.fromEntries(
    ["published", "approved", "under_review", "draft", "revision_required", "rejected"].map(
      (s) => [s, coaches.filter((c) => c.lifecycle_status === s).length]
    )
  );

  return (
    <AdminLayout title="Coaches">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-[#1e2d45]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-wide uppercase">Coach Roster</h2>
            <p className="text-xs text-slate-400">{coaches.length} total coaches</p>
          </div>
          {/* Stats pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "Published", key: "published", color: "text-emerald-400" },
              { label: "Approved",  key: "approved",  color: "text-amber-400" },
              { label: "Review",    key: "under_review", color: "text-blue-400" },
              { label: "Draft",     key: "draft",     color: "text-zinc-400" },
            ].map(({ label, key, color }) => (
              <div key={key} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d1f35] border border-[#1e3a5f]">
                <span className={`text-sm font-black ${color}`}>{counts[key] ?? 0}</span>
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="p-5 bg-[#0a1628] min-h-full">
        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filter === opt.value
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                  : "bg-[#0d1f35] border-[#1e3a5f] text-slate-400 hover:text-slate-200 hover:border-[#2a4a6f]"
              }`}
            >
              {opt.label}
              {opt.value !== "all" && counts[opt.value] != null && (
                <span className="ml-1.5 opacity-60">{counts[opt.value]}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading coaches…</span>
          </div>
        ) : (
          <div className="rounded-xl border border-[#1e3a5f] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e3a5f] bg-[#0d1f35]">
                  {["Name", "Email", "Headline", "Tier", "Lifecycle", "Actions", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-600 text-sm">
                      No coaches match this filter.
                    </td>
                  </tr>
                )}
                {filtered.map((coach) => {
                  const badge = LIFECYCLE_BADGE[coach.lifecycle_status ?? "draft"] ?? LIFECYCLE_BADGE.draft;
                  const tierColor = TIER_BADGE[coach.tier ?? ""] ?? "bg-zinc-700/40 text-zinc-400 border-zinc-600";
                  const isSaving = savingId === coach.id;

                  return (
                    <tr key={coach.id} className="border-b border-[#1e3a5f] bg-[#0a1628] hover:bg-[#0d1f35] transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">
                        {coach.display_name || "Unnamed"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {coach.email || <span className="text-slate-600 italic">no email</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">
                        {coach.headline || <span className="text-slate-600 italic">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={coach.tier || ""}
                          onChange={(e) => setTier(coach.id, e.target.value)}
                          disabled={isSaving}
                          className={`text-xs font-semibold rounded-lg border px-2 py-1 bg-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-40 ${tierColor}`}
                        >
                          <option value="">— unset —</option>
                          <option value="pro">Pro</option>
                          <option value="elite">Elite</option>
                          <option value="master">Master</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {coach.lifecycle_status !== "published" && (
                            <button
                              onClick={() => setLifecycle(coach.id, "published")}
                              disabled={isSaving}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-700/40 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/50 transition-colors disabled:opacity-40"
                            >
                              Publish
                            </button>
                          )}
                          {coach.lifecycle_status !== "approved" && (
                            <button
                              onClick={() => setLifecycle(coach.id, "approved")}
                              disabled={isSaving}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-700/40 border border-amber-600/40 text-amber-300 hover:bg-amber-600/50 transition-colors disabled:opacity-40"
                            >
                              Approve
                            </button>
                          )}
                          {coach.lifecycle_status !== "draft" && (
                            <button
                              onClick={() => setLifecycle(coach.id, "draft")}
                              disabled={isSaving}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-700/40 border border-zinc-600/40 text-zinc-300 hover:bg-zinc-600/50 transition-colors disabled:opacity-40"
                            >
                              Draft
                            </button>
                          )}
                          {coach.lifecycle_status !== "rejected" && (
                            <button
                              onClick={() => setLifecycle(coach.id, "rejected")}
                              disabled={isSaving}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-900/40 border border-red-700/40 text-red-400 hover:bg-red-800/50 transition-colors disabled:opacity-40"
                            >
                              Reject
                            </button>
                          )}
                          {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/coaches/${coach.id}`}
                          className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
                        >
                          Edit <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
