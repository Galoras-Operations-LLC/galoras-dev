import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProductTypes } from "@/hooks/useProductTypes";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CoachProduct {
  id:                string;
  coach_id:          string;
  product_type:      string;
  title:             string;
  outcome_statement?: string | null;
  target_audience?:  string[] | null;
  delivery_format?:  string | null;
  session_count?:    number | null;
  duration_minutes?: number | null;
  duration_weeks?:   number | null;
  price_type:        string;
  price_amount?:     number | null;
  price_range_min?:  number | null;
  price_range_max?:  number | null;
  enterprise_ready:  boolean;
  booking_mode:      string;
  visibility_scope:  string;
  is_active:         boolean;
  sort_order:        number;
}

type ProductDraft = Omit<CoachProduct, "id" | "coach_id" | "is_active" | "sort_order">;

const EMPTY_DRAFT: ProductDraft = {
  product_type:      "",
  title:             "",
  outcome_statement: "",
  target_audience:   [],
  delivery_format:   "online",
  session_count:     null,
  duration_minutes:  null,
  duration_weeks:    null,
  price_type:        "enquiry",
  price_amount:      null,
  price_range_min:   null,
  price_range_max:   null,
  booking_mode:      "enquiry",
  enterprise_ready:  false,
  visibility_scope:  "public",
};

// ── Props ──────────────────────────────────────────────────────────────────────

interface CoachProductsTabProps {
  coachProfile: { id: string; display_name: string | null };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const FORMAT_OPTIONS = [
  { value: "online",    label: "Remote" },
  { value: "in_person", label: "In-Person" },
  { value: "hybrid",    label: "Hybrid" },
];

const BOOKING_OPTIONS = [
  { value: "enquiry", label: "Enquiry (uses your booking URL)" },
  { value: "stripe",  label: "Stripe checkout (coming soon)" },
];

const PRICE_TYPE_OPTIONS = [
  { value: "enquiry", label: "Enquiry-based" },
  { value: "fixed",   label: "Fixed price" },
  { value: "range",   label: "Price range" },
];

const VISIBILITY_OPTIONS = [
  { value: "public",   label: "Public" },
  { value: "unlisted", label: "Unlisted" },
  { value: "private",  label: "Private" },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export function CoachProductsTab({ coachProfile }: CoachProductsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { types, getConfig } = useProductTypes();

  const [editing, setEditing] = useState<CoachProduct | null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [draft, setDraft]     = useState<ProductDraft>(EMPTY_DRAFT);
  const [audienceInput, setAudienceInput] = useState("");

  // ── Query ──────────────────────────────────────────────────────────────────

  const { data: products = [], isLoading } = useQuery<CoachProduct[]>({
    queryKey: ["coach-own-products", coachProfile.id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("coach_products")
        .select("*")
        .eq("coach_id", coachProfile.id)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<CoachProduct> & { id?: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("coach_products")
        .upsert(payload, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-own-products", coachProfile.id] });
      toast({ title: "Product saved" });
      closeForm();
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("coach_products")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-own-products", coachProfile.id] });
      toast({ title: "Product deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("coach_products")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-own-products", coachProfile.id] });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  // ── Form Helpers ───────────────────────────────────────────────────────────

  const openNew = () => {
    setDraft(EMPTY_DRAFT);
    setAudienceInput("");
    setEditing(null);
    setIsNew(true);
  };

  const openEdit = (p: CoachProduct) => {
    setDraft({
      product_type:      p.product_type,
      title:             p.title,
      outcome_statement: p.outcome_statement ?? "",
      target_audience:   p.target_audience ?? [],
      delivery_format:   p.delivery_format ?? "online",
      session_count:     p.session_count ?? null,
      duration_minutes:  p.duration_minutes ?? null,
      duration_weeks:    p.duration_weeks ?? null,
      price_type:        p.price_type,
      price_amount:      p.price_amount ?? null,
      price_range_min:   p.price_range_min ?? null,
      price_range_max:   p.price_range_max ?? null,
      booking_mode:      p.booking_mode,
      enterprise_ready:  p.enterprise_ready,
      visibility_scope:  p.visibility_scope,
    });
    setAudienceInput((p.target_audience ?? []).join(", "));
    setEditing(p);
    setIsNew(false);
  };

  const closeForm = () => {
    setEditing(null);
    setIsNew(false);
    setDraft(EMPTY_DRAFT);
    setAudienceInput("");
  };

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setDraft(d => ({ ...d, [key]: value }));

  const handleSave = () => {
    if (!draft.product_type) {
      toast({ title: "Product type is required", variant: "destructive" });
      return;
    }
    if (!draft.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    // Parse audience from comma-separated input
    const audience = audienceInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const payload: Partial<CoachProduct> & { id?: string } = {
      ...draft,
      target_audience: audience.length > 0 ? audience : null,
    };

    if (editing) {
      payload.id = editing.id;
    } else {
      payload.coach_id   = coachProfile.id;
      payload.is_active  = true;
      payload.sort_order = products.length;
    }

    saveMutation.mutate(payload);
  };

  const handleDelete = (p: CoachProduct) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(p.id);
  };

  // Price display helper
  const priceDisplay = (p: CoachProduct) => {
    if (p.price_type === "fixed" && p.price_amount)
      return `$${(p.price_amount / 100).toLocaleString()}`;
    if (p.price_type === "range" && p.price_range_min && p.price_range_max)
      return `$${(p.price_range_min / 100).toLocaleString()} – $${(p.price_range_max / 100).toLocaleString()}`;
    return p.price_type;
  };

  // ── Render: Form ──────────────────────────────────────────────────────────

  if (isNew || editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {isNew ? "New Product" : "Edit Product"}
          </h3>
          <Button variant="ghost" size="sm" onClick={closeForm} className="text-zinc-400 hover:text-white">
            Cancel
          </Button>
        </div>

        {/* Section 1: The Offering */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">The Offering</p>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-300">Product type</label>
            <select
              value={draft.product_type}
              onChange={e => set("product_type", e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              <option value="">Select a type…</option>
              {types.map(t => (
                <option key={t.id} value={t.slug}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-300">Title</label>
            <input
              type="text"
              value={draft.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. 90-Day Leadership Sprint"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-300">Outcome statement</label>
            <textarea
              value={draft.outcome_statement ?? ""}
              onChange={e => set("outcome_statement", e.target.value)}
              placeholder="What will the client achieve?"
              rows={2}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-300">Target audience (comma-separated)</label>
            <input
              type="text"
              value={audienceInput}
              onChange={e => setAudienceInput(e.target.value)}
              placeholder="e.g. Mid-level managers, Team leads stepping into VP roles"
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>
        </div>

        {/* Section 2: Format & Duration */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Format &amp; Duration</p>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-300">Delivery format</label>
            <select
              value={draft.delivery_format ?? "online"}
              onChange={e => set("delivery_format", e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-500"
            >
              {FORMAT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-300">Sessions</label>
              <input
                type="number"
                min={1}
                value={draft.session_count ?? ""}
                onChange={e => set("session_count", e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-300">Duration (mins)</label>
              <input
                type="number"
                min={1}
                value={draft.duration_minutes ?? ""}
                onChange={e => set("duration_minutes", e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-300">Weeks</label>
              <input
                type="number"
                min={1}
                value={draft.duration_weeks ?? ""}
                onChange={e => set("duration_weeks", e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pricing */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Pricing</p>

          <div className="flex gap-4">
            {PRICE_TYPE_OPTIONS.map(o => (
              <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="price_type"
                  value={o.value}
                  checked={draft.price_type === o.value}
                  onChange={() => set("price_type", o.value)}
                  className="accent-blue-500"
                />
                <span className="text-sm text-zinc-300">{o.label}</span>
              </label>
            ))}
          </div>

          {draft.price_type === "fixed" && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-300">Price (cents)</label>
              <input
                type="number"
                min={0}
                value={draft.price_amount ?? ""}
                onChange={e => set("price_amount", e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 50000 = $500"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          )}

          {draft.price_type === "range" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-300">Min (cents)</label>
                <input
                  type="number"
                  min={0}
                  value={draft.price_range_min ?? ""}
                  onChange={e => set("price_range_min", e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-zinc-300">Max (cents)</label>
                <input
                  type="number"
                  min={0}
                  value={draft.price_range_max ?? ""}
                  onChange={e => set("price_range_max", e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
            </div>
          )}

          {draft.price_type === "enquiry" && (
            <p className="text-sm text-zinc-500 italic">Clients will enquire directly via your booking link.</p>
          )}
        </div>

        {/* Section 4: Booking & Visibility */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Booking &amp; Visibility</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-300">Booking mode</label>
              <select
                value={draft.booking_mode}
                onChange={e => set("booking_mode", e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-500"
              >
                {BOOKING_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-300">Visibility</label>
              <select
                value={draft.visibility_scope}
                onChange={e => set("visibility_scope", e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-500"
              >
                {VISIBILITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.enterprise_ready}
              onChange={e => set("enterprise_ready", e.target.checked)}
              className="h-4 w-4 rounded accent-blue-500"
            />
            <span className="text-sm text-zinc-300">
              Enterprise ready — suitable for corporate / team engagements
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-white text-zinc-950 hover:bg-zinc-100"
          >
            {saveMutation.isPending ? "Saving…" : "Save product"}
          </Button>
          <Button variant="ghost" onClick={closeForm} className="text-zinc-400 hover:text-white">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // ── Render: List ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Your Products</h3>
        <Button
          onClick={openNew}
          size="sm"
          className="bg-white text-zinc-950 hover:bg-zinc-100"
        >
          + New Product
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-zinc-500">Loading…</p>
      )}

      {!isLoading && products.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-sm text-zinc-400">No products yet.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={openNew}
            className="mt-3 text-zinc-300 hover:text-white"
          >
            Create your first product
          </Button>
        </div>
      )}

      {products.length > 0 && (
        <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
          {products.map(p => {
            const cfg = getConfig(p.product_type);
            return (
              <div key={p.id} className="flex items-center gap-4 px-4 py-3">
                {/* Type badge */}
                <span
                  className={`shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${cfg.className}`}
                >
                  {cfg.label}
                </span>

                {/* Title + price */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.title}</p>
                  <p className="text-xs text-zinc-500 truncate">
                    {priceDisplay(p)}
                  </p>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={p.is_active}
                    onChange={e =>
                      toggleActiveMutation.mutate({ id: p.id, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-blue-500"
                  />
                  <span className="text-xs text-zinc-400">Active</span>
                </label>

                {/* Edit */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(p)}
                  className="shrink-0 text-zinc-400 hover:text-white"
                >
                  Edit
                </Button>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(p)}
                  disabled={deleteMutation.isPending}
                  className="shrink-0 text-zinc-500 hover:text-red-400"
                >
                  Delete
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
