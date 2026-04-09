import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Search, User, Mail, Phone, MessageSquare,
  ChevronDown, CheckSquare, Square, StickyNote, X,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "closed"
  | "pending" | "responded" | "accepted" | "declined" | "completed";

type Lead = {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  request_type: string;
  goal: string | null;
  context: string | null;
  company_name: string | null;
  product_title: string | null;
  status: LeadStatus;
  internal_notes: string | null;
  source: string | null;
  coach_id: string | null;
  created_at: string;
  updated_at: string;
  // joined
  coach_name?: string;
};

// ── Status config ────────────────────────────────────────────────────────────

const PIPELINE_STATUSES: { value: LeadStatus; label: string; color: string; dot: string }[] = [
  { value: "new",       label: "New",       color: "bg-sky-900/60 text-sky-300 border-sky-700",         dot: "bg-sky-400" },
  { value: "pending",   label: "Pending",   color: "bg-zinc-800 text-zinc-300 border-zinc-700",        dot: "bg-zinc-400" },
  { value: "contacted", label: "Contacted", color: "bg-amber-900/60 text-amber-300 border-amber-700",  dot: "bg-amber-400" },
  { value: "responded", label: "Responded", color: "bg-amber-900/60 text-amber-300 border-amber-800",  dot: "bg-amber-500" },
  { value: "qualified", label: "Qualified", color: "bg-purple-900/60 text-purple-300 border-purple-700",dot: "bg-purple-400" },
  { value: "accepted",  label: "Accepted",  color: "bg-emerald-900/60 text-emerald-300 border-emerald-700", dot: "bg-emerald-400" },
  { value: "converted", label: "Converted", color: "bg-emerald-900/60 text-emerald-300 border-emerald-800", dot: "bg-emerald-500" },
  { value: "completed", label: "Completed", color: "bg-emerald-900/60 text-emerald-200 border-emerald-700", dot: "bg-emerald-300" },
  { value: "declined",  label: "Declined",  color: "bg-red-900/60 text-red-400 border-red-800",        dot: "bg-red-400" },
  { value: "closed",    label: "Closed",    color: "bg-zinc-800 text-zinc-400 border-zinc-700",        dot: "bg-zinc-500" },
];

const STATUS_MAP = new Map(PIPELINE_STATUSES.map(s => [s.value, s]));

function StatusBadge({ status }: { status: LeadStatus }) {
  const s = STATUS_MAP.get(status) ?? PIPELINE_STATUSES[0];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// Quick stats pills
const STAT_GROUPS = [
  { statuses: ["new", "pending"], label: "New",       color: "text-sky-400" },
  { statuses: ["contacted", "responded"], label: "Contacted", color: "text-amber-400" },
  { statuses: ["qualified"],      label: "Qualified", color: "text-purple-400" },
  { statuses: ["converted", "accepted", "completed"], label: "Converted", color: "text-emerald-400" },
  { statuses: ["closed", "declined"],    label: "Closed",    color: "text-zinc-400" },
] as const;

// ── Main component ───────────────────────────────────────────────────────────

export default function Leads() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notesOpen, setNotesOpen] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [bulkStatus, setBulkStatus] = useState<LeadStatus | "">("");

  // ── Fetch leads ────────────────────────────────────────────────────────────
  const { data: leads, isLoading, error } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("coaching_requests")
        .select("id, requester_name, requester_email, requester_phone, request_type, goal, context, company_name, product_title, status, internal_notes, source, coach_id, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const rows = (data || []) as Lead[];

      // Batch-fetch coach names
      const coachIds = [...new Set(rows.map(r => r.coach_id).filter(Boolean))] as string[];
      let coachMap = new Map<string, string>();
      if (coachIds.length) {
        const { data: coaches } = await supabase.from("coaches").select("id, display_name").in("id", coachIds);
        (coaches || []).forEach((c: any) => coachMap.set(c.id, c.display_name ?? "Unknown"));
      }
      return rows.map(r => ({ ...r, coach_name: r.coach_id ? coachMap.get(r.coach_id) ?? "—" : undefined }));
    },
  });

  // ── Update status mutation ─────────────────────────────────────────────────
  const updateStatus = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: LeadStatus }) => {
      const { error } = await (supabase as any)
        .from("coaching_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      setSelected(new Set());
      setBulkStatus("");
      toast({ title: "Updated", description: "Lead status updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update lead status.", variant: "destructive" });
    },
  });

  // ── Save notes mutation ────────────────────────────────────────────────────
  const saveNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await (supabase as any)
        .from("coaching_requests")
        .update({ internal_notes: notes, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      setNotesOpen(null);
      toast({ title: "Saved", description: "Internal notes saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save notes.", variant: "destructive" });
    },
  });

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = (leads ?? []).filter(lead => {
    const matchesSearch = !search ||
      lead.requester_name.toLowerCase().includes(search.toLowerCase()) ||
      lead.requester_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(l => l.id)));
    }
  };

  // ── Open notes editor ──────────────────────────────────────────────────────
  const openNotes = (lead: Lead) => {
    setNotesOpen(lead.id);
    setNotesDraft(lead.internal_notes ?? "");
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const allLeads = leads ?? [];
  const statCounts = STAT_GROUPS.map(g => ({
    ...g,
    count: allLeads.filter(l => (g.statuses as readonly string[]).includes(l.status)).length,
  }));

  return (
    <AdminLayout title="Leads & Inquiries">
      <section className="p-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Quick stats ── */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {statCounts.map(({ label, count, color }) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className={`text-2xl font-black ${color}`}>{count}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* ── Toolbar: search + filter + bulk ── */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>

            {/* Status filter pills */}
            <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === "all" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                All
              </button>
              {STAT_GROUPS.map(g => (
                <button
                  key={g.label}
                  onClick={() => setFilterStatus(g.statuses[0])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    (g.statuses as readonly string[]).includes(filterStatus)
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Bulk actions */}
            {selected.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-zinc-400">{selected.size} selected</span>
                <select
                  value={bulkStatus}
                  onChange={e => setBulkStatus(e.target.value as LeadStatus)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="">Move to...</option>
                  {PIPELINE_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => bulkStatus && updateStatus.mutate({ ids: [...selected], status: bulkStatus as LeadStatus })}
                  disabled={!bulkStatus || updateStatus.isPending}
                  className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {updateStatus.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
                </button>
              </div>
            )}
          </div>

          {/* ── Table ── */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 py-20 text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading leads...
              </div>
            ) : error ? (
              <div className="py-20 text-center text-red-400 text-sm">Failed to load leads.</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                <MessageSquare className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">
                  {allLeads.length === 0 ? "No inquiries yet." : "No leads match your filters."}
                </p>
                {allLeads.length === 0 && (
                  <p className="text-zinc-600 text-xs mt-1">
                    Leads appear here when clients submit coaching requests.
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-800">
                    <tr>
                      <th className="px-3 py-3.5 w-10">
                        <button onClick={toggleSelectAll} className="text-zinc-500 hover:text-zinc-300">
                          {selected.size === filtered.length && filtered.length > 0
                            ? <CheckSquare className="h-4 w-4" />
                            : <Square className="h-4 w-4" />}
                        </button>
                      </th>
                      {["Client", "Type", "Message", "Coach", "Status", "Source", "Date", "Notes"].map(h => (
                        <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(lead => (
                      <tr key={lead.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30 transition-colors">
                        {/* Checkbox */}
                        <td className="px-3 py-4">
                          <button onClick={() => toggleSelect(lead.id)} className="text-zinc-500 hover:text-zinc-300">
                            {selected.has(lead.id)
                              ? <CheckSquare className="h-4 w-4 text-primary" />
                              : <Square className="h-4 w-4" />}
                          </button>
                        </td>
                        {/* Client */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                              <User className="h-3.5 w-3.5 text-zinc-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium truncate max-w-[150px]">{lead.requester_name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-zinc-500 text-xs truncate max-w-[120px] flex items-center gap-1">
                                  <Mail className="h-2.5 w-2.5 shrink-0" />{lead.requester_email}
                                </span>
                                {lead.requester_phone && (
                                  <span className="text-zinc-600 text-xs flex items-center gap-1">
                                    <Phone className="h-2.5 w-2.5 shrink-0" />{lead.requester_phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* Type */}
                        <td className="px-4 py-4">
                          <span className="text-xs text-zinc-400 capitalize">{lead.request_type}</span>
                          {lead.company_name && (
                            <p className="text-xs text-zinc-600 mt-0.5 truncate max-w-[100px]">{lead.company_name}</p>
                          )}
                        </td>
                        {/* Message */}
                        <td className="px-4 py-4 max-w-[200px]">
                          <p className="text-zinc-400 text-xs line-clamp-2">
                            {lead.goal || lead.context || lead.product_title || "No message"}
                          </p>
                        </td>
                        {/* Coach */}
                        <td className="px-4 py-4 text-zinc-400 text-xs whitespace-nowrap">
                          {lead.coach_name ?? "—"}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusDropdown
                            currentStatus={lead.status}
                            onStatusChange={(status) => updateStatus.mutate({ ids: [lead.id], status })}
                          />
                        </td>
                        {/* Source */}
                        <td className="px-4 py-4 text-zinc-500 text-xs whitespace-nowrap">
                          {lead.source ?? "website"}
                        </td>
                        {/* Date */}
                        <td className="px-4 py-4 text-zinc-500 text-xs whitespace-nowrap">
                          {format(new Date(lead.created_at), "MMM d, yyyy")}
                        </td>
                        {/* Notes */}
                        <td className="px-4 py-4">
                          <button
                            onClick={() => openNotes(lead)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              lead.internal_notes
                                ? "text-amber-400 hover:text-amber-300"
                                : "text-zinc-600 hover:text-zinc-400"
                            }`}
                          >
                            <StickyNote className="h-3.5 w-3.5" />
                            {lead.internal_notes ? "Edit" : "Add"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Notes Modal ── */}
          {notesOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Internal Notes</h3>
                  <button onClick={() => setNotesOpen(null)} className="text-zinc-500 hover:text-zinc-300">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={notesDraft}
                  onChange={e => setNotesDraft(e.target.value)}
                  rows={5}
                  placeholder="Add internal notes about this lead..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-xl px-3 py-2.5 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setNotesOpen(null)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveNotes.mutate({ id: notesOpen, notes: notesDraft })}
                    disabled={saveNotes.isPending}
                    className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {saveNotes.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save Notes"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </AdminLayout>
  );
}

// ── Status dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({ currentStatus, onStatusChange }: {
  currentStatus: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 group"
      >
        <StatusBadge status={currentStatus} />
        <ChevronDown className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl py-1 min-w-[140px]">
            {PIPELINE_STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => { onStatusChange(s.value); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-zinc-700/60 transition-colors ${
                  s.value === currentStatus ? "text-white font-semibold" : "text-zinc-400"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
