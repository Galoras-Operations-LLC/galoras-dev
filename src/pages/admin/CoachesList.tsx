import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, ExternalLink, Search, Star, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";

type CoachRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  headline: string | null;
  tier: string | null;
  lifecycle_status: string | null;
  is_featured: boolean | null;
  featured_rank: number | null;
  created_at: string | null;
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

const TIER_FILTER_OPTIONS = [
  { value: "all",    label: "All Tiers" },
  { value: "master", label: "Master" },
  { value: "elite",  label: "Elite" },
  { value: "pro",    label: "Pro" },
];

type SortField = "name" | "created_at" | "lifecycle_status";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 20;

export default function CoachesList() {
  const [coaches, setCoaches] = useState<CoachRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"roster" | "featured">("roster");

  useEffect(() => { fetchCoaches(); }, []);

  const fetchCoaches = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("coaches")
      .select("id, display_name, email, headline, tier, lifecycle_status, is_featured, featured_rank, created_at")
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

  const logTransition = async (coachId: string, fromStatus: string | null, toStatus: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from("coach_transition_log").insert({
      coach_id: coachId,
      from_status: fromStatus,
      to_status: toStatus,
      actor_id: session?.user?.id ?? null,
      actor_email: session?.user?.email ?? null,
    });
  };

  const setLifecycle = async (id: string, lifecycle_status: string) => {
    const coach = coaches.find(c => c.id === id);
    setSavingId(id);
    const now = new Date().toISOString();
    const extra: Record<string, string | null> = {};
    if (lifecycle_status === "published") { extra.published_at = now; extra.status = "published"; }
    if (lifecycle_status === "approved")  { extra.reviewed_at = now;  extra.status = "approved"; }
    if (lifecycle_status === "draft")     { extra.published_at = null; extra.status = "pending"; }
    await supabase.from("coaches").update({ lifecycle_status, ...extra }).eq("id", id);
    await logTransition(id, coach?.lifecycle_status ?? null, lifecycle_status);
    setSavingId(null);
    fetchCoaches();
  };

  const toggleFeatured = async (coach: CoachRow) => {
    if (coach.lifecycle_status !== "published" && !coach.is_featured) return;
    setSavingId(coach.id);
    await supabase.from("coaches").update({
      is_featured: !coach.is_featured,
      featured_rank: !coach.is_featured ? 0 : null,
    }).eq("id", coach.id);
    setSavingId(null);
    fetchCoaches();
  };

  const updateFeaturedRank = async (id: string, rank: number) => {
    await supabase.from("coaches").update({ featured_rank: rank }).eq("id", id);
    fetchCoaches();
  };

  // Derived data
  const filtered = useMemo(() => {
    let result = coaches;
    if (filter !== "all") result = result.filter(c => c.lifecycle_status === filter);
    if (tierFilter !== "all") result = result.filter(c => c.tier === tierFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => (c.display_name ?? "").toLowerCase().includes(q));
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = (a.display_name ?? "").localeCompare(b.display_name ?? "");
      else if (sortField === "created_at") cmp = new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
      else if (sortField === "lifecycle_status") cmp = (a.lifecycle_status ?? "").localeCompare(b.lifecycle_status ?? "");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [coaches, filter, tierFilter, searchQuery, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safeCurrentPage * PAGE_SIZE, (safeCurrentPage + 1) * PAGE_SIZE);
  const showingFrom = filtered.length > 0 ? safeCurrentPage * PAGE_SIZE + 1 : 0;
  const showingTo = Math.min((safeCurrentPage + 1) * PAGE_SIZE, filtered.length);

  useEffect(() => { setPage(0); }, [filter, tierFilter, searchQuery, sortField, sortDir]);

  const featuredCoaches = useMemo(
    () => coaches.filter(c => c.is_featured).sort((a, b) => (a.featured_rank ?? 99) - (b.featured_rank ?? 99)),
    [coaches],
  );

  const counts = Object.fromEntries(
    ["published", "approved", "under_review", "draft", "revision_required", "rejected"].map(
      (s) => [s, coaches.filter((c) => c.lifecycle_status === s).length]
    )
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir(field === "created_at" ? "desc" : "asc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />;
  };

  return (
    <AdminLayout title="Coaches">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-[#1e2d45]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-wide uppercase">Coach Roster</h2>
            <p className="text-xs text-slate-400">{coaches.length} total coaches</p>
          </div>
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
        {/* Tabs: Roster / Featured */}
        <div className="flex gap-1 mb-4 bg-[#0d1f35] border border-[#1e3a5f] rounded-lg p-1 w-fit">
          {([["roster", "Roster"], ["featured", "Featured"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
                tab === id ? "bg-[#1a2f4a] text-amber-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {label}{id === "featured" && ` (${featuredCoaches.length})`}
            </button>
          ))}
        </div>

        {/* ═══ FEATURED TAB ═══ */}
        {tab === "featured" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Only published coaches can be featured. Set rank to control homepage order (lower = shown first).</p>
            {featuredCoaches.length === 0 ? (
              <div className="rounded-xl border border-[#1e3a5f] bg-[#0d1f35] p-12 text-center">
                <Star className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No featured coaches yet.</p>
                <p className="text-slate-600 text-xs mt-1">Switch to the Roster tab and star published coaches.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#1e3a5f] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e3a5f] bg-[#0d1f35]">
                      {["Rank", "Name", "Tier", "Status", "Unfeatured", ""].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {featuredCoaches.map((coach) => (
                      <tr key={coach.id} className="border-b border-[#1e3a5f] bg-[#0a1628] hover:bg-[#0d1f35] transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            value={coach.featured_rank ?? 0}
                            onChange={(e) => updateFeaturedRank(coach.id, parseInt(e.target.value) || 0)}
                            className="w-16 text-center bg-[#1a2f4a] border border-[#2a4a6f] text-amber-400 font-bold text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-white">{coach.display_name || "Unnamed"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TIER_BADGE[coach.tier ?? ""] ?? "bg-zinc-700/40 text-zinc-400 border-zinc-600"}`}>
                            {coach.tier ?? "unset"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${(LIFECYCLE_BADGE[coach.lifecycle_status ?? "draft"] ?? LIFECYCLE_BADGE.draft).color}`}>
                            {(LIFECYCLE_BADGE[coach.lifecycle_status ?? "draft"] ?? LIFECYCLE_BADGE.draft).label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleFeatured(coach)} className="text-amber-400 hover:text-red-400 transition-colors">
                            <Star className="h-4 w-4 fill-amber-400" />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/admin/coaches/${coach.id}`} className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                            Edit <ExternalLink className="h-3 w-3 inline" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ ROSTER TAB ═══ */}
        {tab === "roster" && (
          <>
            {/* Search + Tier filter bar */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 w-56 bg-[#0d1f35] border border-[#1e3a5f] text-slate-200 text-xs rounded-lg placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {TIER_FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTierFilter(opt.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      tierFilter === opt.value
                        ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                        : "bg-[#0d1f35] border-[#1e3a5f] text-slate-400 hover:text-slate-200 hover:border-[#2a4a6f]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifecycle filter bar */}
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
                <span>Loading coaches...</span>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-[#1e3a5f] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1e3a5f] bg-[#0d1f35]">
                        <th className="w-10 px-3 py-3 text-xs font-semibold text-slate-500">
                          <Star className="h-3.5 w-3.5 text-slate-500 mx-auto" />
                        </th>
                        <th onClick={() => toggleSort("name")} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none">
                          <span className="inline-flex items-center gap-1">Name <SortIcon field="name" /></span>
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Headline</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tier</th>
                        <th onClick={() => toggleSort("lifecycle_status")} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none">
                          <span className="inline-flex items-center gap-1">Lifecycle <SortIcon field="lifecycle_status" /></span>
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        <th onClick={() => toggleSort("created_at")} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 select-none">
                          <span className="inline-flex items-center gap-1">Created <SortIcon field="created_at" /></span>
                        </th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-4 py-12 text-center text-slate-600 text-sm">
                            No coaches match this filter.
                          </td>
                        </tr>
                      )}
                      {paged.map((coach) => {
                        const badge = LIFECYCLE_BADGE[coach.lifecycle_status ?? "draft"] ?? LIFECYCLE_BADGE.draft;
                        const tierColor = TIER_BADGE[coach.tier ?? ""] ?? "bg-zinc-700/40 text-zinc-400 border-zinc-600";
                        const isSaving = savingId === coach.id;
                        const canFeature = coach.lifecycle_status === "published";

                        return (
                          <tr key={coach.id} className="border-b border-[#1e3a5f] bg-[#0a1628] hover:bg-[#0d1f35] transition-colors">
                            <td className="px-3 py-3 text-center">
                              <button
                                onClick={() => toggleFeatured(coach)}
                                disabled={!canFeature && !coach.is_featured}
                                title={!canFeature && !coach.is_featured ? "Only published coaches can be featured" : "Toggle featured"}
                                className={`transition-colors disabled:opacity-20 disabled:cursor-not-allowed ${
                                  coach.is_featured ? "text-amber-400 hover:text-amber-300" : "text-slate-600 hover:text-amber-400"
                                }`}
                              >
                                <Star className={`h-4 w-4 ${coach.is_featured ? "fill-amber-400" : ""}`} />
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">
                              {coach.display_name || "Unnamed"}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">
                              {coach.email || <span className="text-slate-600 italic">no email</span>}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">
                              {coach.headline || <span className="text-slate-600 italic">--</span>}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={coach.tier || ""}
                                onChange={(e) => setTier(coach.id, e.target.value)}
                                disabled={isSaving}
                                className={`text-xs font-semibold rounded-lg border px-2 py-1 bg-[#0d1f35] cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-40 ${tierColor}`}
                              >
                                <option value="" className="bg-[#0d1f35] text-slate-400">-- unset --</option>
                                <option value="pro" className="bg-[#0d1f35] text-emerald-300">Pro</option>
                                <option value="elite" className="bg-[#0d1f35] text-sky-300">Elite</option>
                                <option value="master" className="bg-[#0d1f35] text-amber-300">Master</option>
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
                                  <button onClick={() => setLifecycle(coach.id, "published")} disabled={isSaving}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-700/40 border border-emerald-600/40 text-emerald-300 hover:bg-emerald-600/50 transition-colors disabled:opacity-40">
                                    Publish
                                  </button>
                                )}
                                {coach.lifecycle_status !== "approved" && (
                                  <button onClick={() => setLifecycle(coach.id, "approved")} disabled={isSaving}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-700/40 border border-amber-600/40 text-amber-300 hover:bg-amber-600/50 transition-colors disabled:opacity-40">
                                    Approve
                                  </button>
                                )}
                                {coach.lifecycle_status !== "draft" && (
                                  <button onClick={() => setLifecycle(coach.id, "draft")} disabled={isSaving}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-700/40 border border-zinc-600/40 text-zinc-300 hover:bg-zinc-600/50 transition-colors disabled:opacity-40">
                                    Draft
                                  </button>
                                )}
                                {coach.lifecycle_status !== "rejected" && (
                                  <button onClick={() => setLifecycle(coach.id, "rejected")} disabled={isSaving}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-900/40 border border-red-700/40 text-red-400 hover:bg-red-800/50 transition-colors disabled:opacity-40">
                                    Reject
                                  </button>
                                )}
                                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                              {coach.created_at ? new Date(coach.created_at).toLocaleDateString("en-CA") : "--"}
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

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 px-1">
                  <p className="text-xs text-slate-500">
                    Showing {showingFrom}--{showingTo} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={safeCurrentPage === 0}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-[#0d1f35] border-[#1e3a5f] text-slate-400 hover:text-slate-200 hover:border-[#2a4a6f] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-3 w-3" /> Prev
                    </button>
                    <span className="text-xs text-slate-500">
                      Page {safeCurrentPage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={safeCurrentPage >= totalPages - 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-[#0d1f35] border-[#1e3a5f] text-slate-400 hover:text-slate-200 hover:border-[#2a4a6f] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </AdminLayout>
  );
}
