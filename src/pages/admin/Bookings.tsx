import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import {
  Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle,
  Loader2, CreditCard, RefreshCcw, ExternalLink,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type PaymentRow = {
  id: string;
  coach_id: string | null;
  product_id: string | null;
  client_id: string | null;
  status: string | null;
  amount_cents: number | null;
  currency: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string | null;
  // joined
  coach_name: string;
  product_title: string;
  client_name: string;
  client_email: string;
};

type SessionRow = {
  id: string;
  coach_id: string | null;
  client_name: string | null;
  client_email: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  duration_minutes: number | null;
  status: string | null;
  created_at: string | null;
  coach_name: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(cents: number | null, currency: string | null) {
  if (!cents) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(cents / 100);
}

const PAYMENT_STATUS: Record<string, { color: string; icon: typeof CheckCircle2; label: string }> = {
  confirmed:       { color: "bg-emerald-900/60 text-emerald-300 border-emerald-800", icon: CheckCircle2,  label: "Confirmed" },
  pending_payment: { color: "bg-amber-900/60 text-amber-300 border-amber-800",       icon: AlertCircle,   label: "Pending" },
  payment_failed:  { color: "bg-red-900/60 text-red-400 border-red-800",             icon: XCircle,       label: "Failed" },
  refunded:        { color: "bg-zinc-800 text-zinc-400 border-zinc-700",             icon: RefreshCcw,    label: "Refunded" },
};

const SESSION_STATUS: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  confirmed: { color: "bg-emerald-900/60 text-emerald-300 border-emerald-800", icon: CheckCircle2 },
  pending:   { color: "bg-zinc-800 text-zinc-300 border-zinc-700",             icon: AlertCircle },
  completed: { color: "bg-sky-900/60 text-sky-300 border-sky-800",             icon: CheckCircle2 },
  cancelled: { color: "bg-red-900/60 text-red-400 border-red-800",             icon: XCircle },
};

function Badge({ status, map }: { status: string | null; map: typeof PAYMENT_STATUS | typeof SESSION_STATUS }) {
  const s = (map as any)[status ?? ""] ?? PAYMENT_STATUS.pending_payment;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
      <Icon className="h-3 w-3" />
      {("label" in s ? s.label : null) ?? status ?? "unknown"}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Bookings() {
  const [tab, setTab] = useState<"payments" | "sessions">("payments");

  // ── Payment log query ──────────────────────────────────────────────────────
  const { data: payments, isLoading: plLoading, error: plError } = useQuery({
    queryKey: ["admin-payment-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, coach_id, product_id, client_id, status, amount_cents, currency, stripe_payment_intent_id, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const rows = (data || []) as Omit<PaymentRow, "coach_name" | "product_title" | "client_name" | "client_email">[];

      // Batch-fetch related names
      const coachIds   = [...new Set(rows.map(r => r.coach_id).filter(Boolean))] as string[];
      const productIds = [...new Set(rows.map(r => r.product_id).filter(Boolean))] as string[];
      const clientIds  = [...new Set(rows.map(r => r.client_id).filter(Boolean))] as string[];

      const [{ data: coaches }, { data: products }, { data: clients }] = await Promise.all([
        coachIds.length   ? supabase.from("coaches").select("id, display_name").in("id", coachIds)         : { data: [] },
        productIds.length ? supabase.from("coach_products").select("id, title").in("id", productIds)       : { data: [] },
        clientIds.length  ? supabase.from("profiles").select("id, full_name, email").in("id", clientIds)   : { data: [] },
      ]);

      const coachMap   = new Map((coaches  || []).map((c: any) => [c.id, c.display_name ?? "Unknown"]));
      const productMap = new Map((products || []).map((p: any) => [p.id, p.title ?? "—"]));
      const clientMap  = new Map((clients  || []).map((u: any) => [u.id, { name: u.full_name ?? "—", email: u.email ?? "—" }]));

      return rows.map(r => ({
        ...r,
        coach_name:    r.coach_id   ? (coachMap.get(r.coach_id)   ?? "—") : "—",
        product_title: r.product_id ? (productMap.get(r.product_id) ?? "—") : "—",
        client_name:   r.client_id  ? (clientMap.get(r.client_id)?.name  ?? "—") : "—",
        client_email:  r.client_id  ? (clientMap.get(r.client_id)?.email ?? "—") : "—",
      })) as PaymentRow[];
    },
  });

  // ── Sessions query ─────────────────────────────────────────────────────────
  const { data: sessions, isLoading: sessLoading, error: sessError } = useQuery({
    queryKey: ["admin-session-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_bookings")
        .select("id, coach_id, client_name, client_email, scheduled_date, scheduled_time, duration_minutes, status, created_at")
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      const rows = (data || []) as Omit<SessionRow, "coach_name">[];
      const coachIds = [...new Set(rows.map(r => r.coach_id).filter(Boolean))] as string[];
      let coachMap = new Map<string, string>();
      if (coachIds.length) {
        const { data: coaches } = await supabase.from("coaches").select("id, display_name").in("id", coachIds);
        (coaches || []).forEach((c: any) => coachMap.set(c.id, c.display_name ?? "Unknown"));
      }
      return rows.map(r => ({ ...r, coach_name: r.coach_id ? (coachMap.get(r.coach_id) ?? "—") : "—" })) as SessionRow[];
    },
  });

  // ── Payment stats ──────────────────────────────────────────────────────────
  const totalRevenue = (payments || [])
    .filter(p => p.status === "confirmed")
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);

  const payStats = {
    revenue:   totalRevenue,
    confirmed: (payments || []).filter(p => p.status === "confirmed").length,
    pending:   (payments || []).filter(p => p.status === "pending_payment").length,
    failed:    (payments || []).filter(p => p.status === "payment_failed").length,
    refunded:  (payments || []).filter(p => p.status === "refunded").length,
  };

  const sessStats = {
    total:     (sessions || []).length,
    confirmed: (sessions || []).filter(s => s.status === "confirmed").length,
    pending:   (sessions || []).filter(s => s.status === "pending").length,
    completed: (sessions || []).filter(s => s.status === "completed").length,
    cancelled: (sessions || []).filter(s => s.status === "cancelled").length,
  };

  return (
    <AdminLayout title="Bookings">
      <section className="p-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Tabs ── */}
          <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
            {(["payments", "sessions"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  tab === t
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {t === "payments" ? "Payment Log" : "Sessions"}
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              PAYMENT LOG TAB
          ══════════════════════════════════════════════════════════════════ */}
          {tab === "payments" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-5 gap-3 mb-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 col-span-1">
                  <p className="text-2xl font-black text-emerald-400">
                    {formatMoney(payStats.revenue, "usd")}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">Revenue confirmed</p>
                </div>
                {[
                  { label: "Confirmed", value: payStats.confirmed, color: "text-emerald-400" },
                  { label: "Pending",   value: payStats.pending,   color: "text-amber-400" },
                  { label: "Failed",    value: payStats.failed,    color: "text-red-400" },
                  { label: "Refunded",  value: payStats.refunded,  color: "text-zinc-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {plLoading ? (
                  <div className="flex items-center justify-center gap-3 py-20 text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading transactions…
                  </div>
                ) : plError ? (
                  <div className="py-20 text-center text-red-400 text-sm">Failed to load payment log.</div>
                ) : !payments || payments.length === 0 ? (
                  <div className="py-20 text-center">
                    <CreditCard className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">No transactions yet.</p>
                    <p className="text-zinc-600 text-xs mt-1">
                      Transactions appear here once a buyer completes checkout.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-zinc-800">
                        <tr>
                          {["Client", "Coach", "Product", "Amount", "Status", "Stripe PI", "Date"].map(h => (
                            <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30 transition-colors">
                            {/* Client */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                                  <User className="h-3.5 w-3.5 text-zinc-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-white font-medium truncate max-w-[140px]">{p.client_name}</p>
                                  <p className="text-zinc-500 text-xs truncate max-w-[140px]">{p.client_email}</p>
                                </div>
                              </div>
                            </td>
                            {/* Coach */}
                            <td className="px-5 py-4 text-zinc-300 whitespace-nowrap">{p.coach_name}</td>
                            {/* Product */}
                            <td className="px-5 py-4 text-zinc-400 max-w-[200px]">
                              <p className="truncate">{p.product_title}</p>
                            </td>
                            {/* Amount */}
                            <td className="px-5 py-4 text-white font-semibold whitespace-nowrap">
                              {formatMoney(p.amount_cents, p.currency)}
                            </td>
                            {/* Status */}
                            <td className="px-5 py-4">
                              <Badge status={p.status} map={PAYMENT_STATUS} />
                            </td>
                            {/* Stripe PI */}
                            <td className="px-5 py-4">
                              {p.stripe_payment_intent_id ? (
                                <a
                                  href={`https://dashboard.stripe.com/payments/${p.stripe_payment_intent_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-primary transition-colors font-mono"
                                >
                                  {p.stripe_payment_intent_id.slice(0, 16)}…
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-zinc-700 text-xs">—</span>
                              )}
                            </td>
                            {/* Date */}
                            <td className="px-5 py-4 text-zinc-500 text-xs whitespace-nowrap">
                              {p.created_at ? format(new Date(p.created_at), "MMM d, yyyy HH:mm") : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SESSIONS TAB
          ══════════════════════════════════════════════════════════════════ */}
          {tab === "sessions" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-5 gap-3 mb-8">
                {[
                  { label: "Total",     value: sessStats.total,     color: "text-white" },
                  { label: "Confirmed", value: sessStats.confirmed, color: "text-emerald-400" },
                  { label: "Pending",   value: sessStats.pending,   color: "text-zinc-400" },
                  { label: "Completed", value: sessStats.completed, color: "text-sky-400" },
                  { label: "Cancelled", value: sessStats.cancelled, color: "text-red-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {sessLoading ? (
                  <div className="flex items-center justify-center gap-3 py-20 text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading sessions…
                  </div>
                ) : sessError ? (
                  <div className="py-20 text-center text-red-400 text-sm">Failed to load sessions.</div>
                ) : !sessions || sessions.length === 0 ? (
                  <div className="py-20 text-center">
                    <Calendar className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">No sessions booked yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-zinc-800">
                        <tr>
                          {["Client", "Coach", "Date & Time", "Duration", "Status", "Booked"].map(h => (
                            <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((s) => (
                          <tr key={s.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                                  <User className="h-3.5 w-3.5 text-zinc-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-white font-medium truncate">{s.client_name || "—"}</p>
                                  <p className="text-zinc-500 text-xs truncate">{s.client_email || ""}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-zinc-300">{s.coach_name}</td>
                            <td className="px-5 py-4">
                              {s.scheduled_date ? (
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1.5 text-zinc-300">
                                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                                    {format(new Date(s.scheduled_date), "MMM d, yyyy")}
                                  </span>
                                  {s.scheduled_time && (
                                    <span className="flex items-center gap-1.5 text-zinc-500">
                                      <Clock className="h-3.5 w-3.5" />
                                      {s.scheduled_time.slice(0, 5)}
                                    </span>
                                  )}
                                </div>
                              ) : "—"}
                            </td>
                            <td className="px-5 py-4 text-zinc-400">
                              {s.duration_minutes ? `${s.duration_minutes} min` : "—"}
                            </td>
                            <td className="px-5 py-4">
                              <Badge status={s.status} map={SESSION_STATUS} />
                            </td>
                            <td className="px-5 py-4 text-zinc-500 text-xs">
                              {s.created_at ? format(new Date(s.created_at), "MMM d, yyyy") : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </section>
    </AdminLayout>
  );
}
