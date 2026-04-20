import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import {
  Users, CreditCard, Package, Calendar, ArrowRight,
  CheckCircle2, Clock, AlertCircle, Loader2, TrendingUp,
  UserPlus, ShoppingCart, Settings, Activity,
} from "lucide-react";

// ── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, color = "text-white", sub }: {
  label: string; value: string | number; icon: React.ElementType; color?: string; sub?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg bg-zinc-800 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Quick Action Button ─────────────────────────────────────────────────────

function QuickAction({ label, href, icon: Icon }: {
  label: string; href: string; icon: React.ElementType;
}) {
  return (
    <Link
      to={href}
      className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800/80 hover:border-zinc-700 transition-all group"
    >
      <Icon className="h-4 w-4 text-zinc-400 group-hover:text-primary" />
      <span className="text-sm text-zinc-300 group-hover:text-white">{label}</span>
      <ArrowRight className="h-3 w-3 ml-auto text-zinc-600 group-hover:text-zinc-400" />
    </Link>
  );
}

// ── Activity Item ───────────────────────────────────────────────────────────

function ActivityItem({ icon: Icon, text, time, color }: {
  icon: React.ElementType; text: string; time: string; color: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`mt-0.5 p-1.5 rounded-md bg-zinc-800 ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300 truncate">{text}</p>
        <p className="text-xs text-zinc-600">{time}</p>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  }).format(cents / 100);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Tab IDs ─────────────────────────────────────────────────────────────────

type Tab = "coach-pipeline" | "customer-ops" | "platform-ops";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "coach-pipeline", label: "Coach Pipeline", icon: Users },
  { id: "customer-ops",   label: "Customer Ops",   icon: ShoppingCart },
  { id: "platform-ops",   label: "Platform Ops",   icon: Settings },
];

// ── Main Component ──────────────────────────────────────────────────────────

export default function Portal() {
  const [activeTab, setActiveTab] = useState<Tab>("coach-pipeline");

  // ── Data queries ──────────────────────────────────────────────────────────

  const { data: appStats, isLoading: appLoading } = useQuery({
    queryKey: ["portal-app-stats"],
    queryFn: async () => {
      const { data: apps } = await supabase
        .from("coach_applications")
        .select("id, review_status, created_at")
        .order("created_at", { ascending: false });

      const rows = apps || [];
      const pending = rows.filter(a => a.review_status === "pending" || a.review_status === "under_review");
      const approved = rows.filter(a => a.review_status === "approved");
      const rejected = rows.filter(a => a.review_status === "rejected" || a.review_status === "auto_rejected");
      return { total: rows.length, pending: pending.length, approved: approved.length, rejected: rejected.length, recent: rows.slice(0, 5) };
    },
  });

  const { data: coachStats, isLoading: coachLoading } = useQuery({
    queryKey: ["portal-coach-stats"],
    queryFn: async () => {
      const { data: coaches } = await supabase
        .from("coaches")
        .select("id, lifecycle_status, tier, display_name, created_at")
        .order("created_at", { ascending: false });

      const rows = coaches || [];
      const published = rows.filter(c => c.lifecycle_status === "published");
      const tiers = { pro: 0, elite: 0, master: 0 };
      published.forEach(c => { if (c.tier && c.tier in tiers) tiers[c.tier as keyof typeof tiers]++; });

      // Full lifecycle breakdown
      const lifecycle: Record<string, number> = {};
      rows.forEach(c => {
        const s = c.lifecycle_status ?? "draft";
        lifecycle[s] = (lifecycle[s] ?? 0) + 1;
      });

      return { total: rows.length, published: published.length, tiers, lifecycle, recent: rows.slice(0, 5) };
    },
  });

  const { data: bookingStats, isLoading: bookingLoading } = useQuery({
    queryKey: ["portal-booking-stats"],
    queryFn: async () => {
      const { data: payments } = await supabase
        .from("bookings")
        .select("id, status, amount_cents, currency, created_at")
        .order("created_at", { ascending: false });

      const { data: sessions } = await supabase
        .from("session_bookings")
        .select("id, status, created_at")
        .order("created_at", { ascending: false });

      const payRows = payments || [];
      const sesRows = sessions || [];
      const revenue = payRows
        .filter(p => p.status === "confirmed")
        .reduce((sum, p) => sum + (p.amount_cents || 0), 0);
      const pendingPayments = payRows.filter(p => p.status === "pending_payment");
      const upcomingSessions = sesRows.filter(s => s.status === "confirmed" || s.status === "pending");

      return {
        totalPayments: payRows.length,
        revenue,
        currency: payRows[0]?.currency || "usd",
        pendingPayments: pendingPayments.length,
        totalSessions: sesRows.length,
        upcomingSessions: upcomingSessions.length,
        recentPayments: payRows.slice(0, 5),
        recentSessions: sesRows.slice(0, 5),
      };
    },
  });

  const { data: productStats, isLoading: productLoading } = useQuery({
    queryKey: ["portal-product-stats"],
    queryFn: async () => {
      const { data: products } = await supabase
        .from("coach_products")
        .select("id, is_active, product_type");

      const rows = products || [];
      const active = rows.filter(p => p.is_active);
      const byType: Record<string, number> = {};
      active.forEach(p => { byType[p.product_type] = (byType[p.product_type] || 0) + 1; });
      return { total: rows.length, active: active.length, byType };
    },
  });

  const loading = appLoading || coachLoading || bookingLoading || productLoading;

  // ── Render helpers ────────────────────────────────────────────────────────

  const LIFECYCLE_COLORS: Record<string, string> = {
    published: "text-emerald-400", approved: "text-amber-400", under_review: "text-blue-400",
    submitted: "text-sky-400", draft: "text-zinc-400", revision_required: "text-orange-400", rejected: "text-red-400",
  };

  const renderCoachPipeline = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pending Applications" value={appStats?.pending ?? "---"} icon={Clock} color="text-amber-400" />
        <KpiCard label="Approved Coaches" value={appStats?.approved ?? "---"} icon={CheckCircle2} color="text-emerald-400" />
        <KpiCard label="Published Coaches" value={coachStats?.published ?? "---"} icon={Users} color="text-sky-400" />
        <KpiCard label="Total Applications" value={appStats?.total ?? "---"} icon={TrendingUp} color="text-zinc-400" />
      </div>

      {/* Lifecycle status breakdown */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Coaches by Lifecycle Status</h3>
        <div className="grid grid-cols-3 lg:grid-cols-7 gap-3">
          {["published", "approved", "under_review", "submitted", "draft", "revision_required", "rejected"].map(status => {
            const count = coachStats?.lifecycle?.[status] ?? 0;
            const label = status.replace(/_/g, " ");
            return (
              <div key={status} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <p className={`text-xl font-black ${LIFECYCLE_COLORS[status] ?? "text-zinc-400"}`}>{count}</p>
                <p className="text-xs text-zinc-500 mt-0.5 capitalize">{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking summary metrics */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Booking Metrics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Revenue"
            value={bookingStats ? formatMoney(bookingStats.revenue, bookingStats.currency) : "---"}
            icon={CreditCard}
            color="text-emerald-400"
          />
          <KpiCard label="Total Bookings" value={bookingStats?.totalPayments ?? "---"} icon={ShoppingCart} color="text-sky-400" />
          <KpiCard label="Pending Payments" value={bookingStats?.pendingPayments ?? "---"} icon={AlertCircle} color="text-amber-400" />
          <KpiCard label="Upcoming Sessions" value={bookingStats?.upcomingSessions ?? "---"} icon={Calendar} color="text-violet-400" />
        </div>
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <QuickAction label="Review pending applications" href="/admin/applicants" icon={UserPlus} />
            <QuickAction label="Manage coach roster" href="/admin/coaches" icon={Users} />
            <QuickAction label="Edit coach products" href="/admin/products" icon={Package} />
          </div>
        </div>

        {/* Pipeline Summary */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Tier Distribution</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            {(["pro", "elite", "master"] as const).map(tier => {
              const count = coachStats?.tiers[tier] ?? 0;
              const total = coachStats?.published ?? 1;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={tier}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400 capitalize">{tier}</span>
                    <span className="text-zinc-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        tier === "master" ? "bg-amber-500" : tier === "elite" ? "bg-sky-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Recent Applications</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          {(appStats?.recent || []).length === 0 && (
            <p className="text-sm text-zinc-600 p-4">No applications yet</p>
          )}
          {(appStats?.recent || []).map(app => (
            <div key={app.id} className="px-4 py-3 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                app.review_status === "approved" ? "bg-emerald-500" :
                app.review_status === "rejected" || app.review_status === "auto_rejected" ? "bg-red-500" :
                "bg-amber-500"
              }`} />
              <span className="text-sm text-zinc-300 flex-1 truncate">{app.id.slice(0, 8)}...</span>
              <span className="text-xs text-zinc-500 capitalize">{app.review_status}</span>
              {app.created_at && <span className="text-xs text-zinc-600">{timeAgo(app.created_at)}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCustomerOps = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Revenue"
          value={bookingStats ? formatMoney(bookingStats.revenue, bookingStats.currency) : "—"}
          icon={CreditCard}
          color="text-emerald-400"
        />
        <KpiCard label="Total Bookings" value={bookingStats?.totalPayments ?? "—"} icon={ShoppingCart} color="text-sky-400" />
        <KpiCard label="Pending Payments" value={bookingStats?.pendingPayments ?? "—"} icon={AlertCircle} color="text-amber-400" />
        <KpiCard label="Upcoming Sessions" value={bookingStats?.upcomingSessions ?? "—"} icon={Calendar} color="text-violet-400" />
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <QuickAction label="View all bookings & payments" href="/admin/bookings" icon={CreditCard} />
            <QuickAction label="Manage product catalog" href="/admin/products" icon={Package} />
            <QuickAction label="Coach matching directory" href="/coaching/matching" icon={Users} />
          </div>
        </div>

        {/* Session Overview */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sessions Overview</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Total sessions</span>
              <span className="text-sm font-medium text-white">{bookingStats?.totalSessions ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Upcoming / pending</span>
              <span className="text-sm font-medium text-amber-400">{bookingStats?.upcomingSessions ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Confirmed payments</span>
              <span className="text-sm font-medium text-emerald-400">
                {bookingStats ? bookingStats.totalPayments - bookingStats.pendingPayments : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Recent Payments</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          {(bookingStats?.recentPayments || []).length === 0 && (
            <p className="text-sm text-zinc-600 p-4">No payments yet</p>
          )}
          {(bookingStats?.recentPayments || []).map(p => (
            <div key={p.id} className="px-4 py-3 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                p.status === "confirmed" ? "bg-emerald-500" :
                p.status === "payment_failed" ? "bg-red-500" :
                "bg-amber-500"
              }`} />
              <span className="text-sm text-zinc-300 flex-1">
                {formatMoney(p.amount_cents || 0, p.currency || "usd")}
              </span>
              <span className="text-xs text-zinc-500 capitalize">{p.status}</span>
              {p.created_at && <span className="text-xs text-zinc-600">{timeAgo(p.created_at)}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlatformOps = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Active Products" value={productStats?.active ?? "—"} icon={Package} color="text-emerald-400" />
        <KpiCard label="Total Products" value={productStats?.total ?? "—"} icon={Package} color="text-zinc-400" />
        <KpiCard label="Total Coaches" value={coachStats?.total ?? "—"} icon={Users} color="text-sky-400" />
        <KpiCard label="Published" value={coachStats?.published ?? "—"} icon={CheckCircle2} color="text-violet-400" />
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <QuickAction label="Product manager" href="/admin/products" icon={Package} />
            <QuickAction label="Coach image generator" href="/admin/images" icon={Activity} />
            <QuickAction label="Coach cutout manager" href="/admin/coach-cutouts" icon={Users} />
          </div>
        </div>

        {/* Products by Type */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Products by Type</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            {Object.entries(productStats?.byType || {}).length === 0 && (
              <p className="text-sm text-zinc-600">No active products</p>
            )}
            {Object.entries(productStats?.byType || {}).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="text-sm text-zinc-400 capitalize">{type}</span>
                <span className="text-sm font-medium text-white">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">System</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-zinc-400">Environment</span>
            <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">DEV</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-zinc-400">Supabase</span>
            <span className="text-xs font-mono text-emerald-400">Connected</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-zinc-400">Stripe</span>
            <span className="text-xs font-mono text-emerald-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <AdminLayout title="Admin Portal">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === id
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        )}

        {/* Tab Content */}
        {!loading && activeTab === "coach-pipeline" && renderCoachPipeline()}
        {!loading && activeTab === "customer-ops" && renderCustomerOps()}
        {!loading && activeTab === "platform-ops" && renderPlatformOps()}
      </div>
    </AdminLayout>
  );
}
