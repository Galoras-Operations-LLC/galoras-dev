import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Loader2, Trash2, ToggleLeft, ToggleRight, Settings, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProductTypes, ProductTypeDefinition, PRODUCT_TYPE_COLOR_PRESETS } from "@/hooks/useProductTypes";

type Coach = { id: string; display_name: string | null; slug: string | null; tier: string | null };

type Product = {
  id: string;
  coach_id: string;
  product_type: string;
  title: string;
  outcome_statement: string | null;
  target_audience: string[] | null;
  delivery_format: string | null;
  session_count: number | null;
  duration_minutes: number | null;
  duration_weeks: number | null;
  price_type: string;
  price_amount: number | null;
  price_range_min: number | null;
  price_range_max: number | null;
  enterprise_ready: boolean;
  booking_mode: string;
  visibility_scope: string;
  is_active: boolean;
  sort_order: number;
};

const BLANK_PRODUCT = (coachId: string): Omit<Product, "id"> => ({
  coach_id: coachId,
  product_type: "single_session",
  title: "",
  outcome_statement: null,
  target_audience: null,
  delivery_format: "online",
  session_count: null,
  duration_minutes: null,
  duration_weeks: null,
  price_type: "enquiry",
  price_amount: null,
  price_range_min: null,
  price_range_max: null,
  enterprise_ready: false,
  booking_mode: "enquiry",
  visibility_scope: "public",
  is_active: true,
  sort_order: 0,
});

const FORMATS = ["online", "in_person", "hybrid"];
const PRICE_TYPES = ["enquiry", "fixed", "range"];
const BOOKING_MODES = [
  { value: "enquiry", label: "Enquiry" },
  { value: "stripe",  label: "Stripe" },
];
const VISIBILITY = ["public", "unlisted", "private"];

function inputClass() {
  return "w-full bg-[#1a2f4a] border border-[#2a4a6f] text-slate-200 text-sm rounded-xl px-3 py-2.5 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export default function ProductManager() {
  const { toast } = useToast();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | Omit<Product, "id"> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [audienceInput, setAudienceInput] = useState("");
  const [galarasProducts, setGalarasProducts] = useState<Product[]>([]);

  // Product type manager
  const { types: productTypes, loading: typesLoading, refetch: refetchTypes } = useProductTypes();
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [localTypes, setLocalTypes]           = useState<ProductTypeDefinition[]>([]);
  const [newSlug, setNewSlug]                 = useState("");
  const [newLabel, setNewLabel]               = useState("");
  const [newColor, setNewColor]               = useState(PRODUCT_TYPE_COLOR_PRESETS[0].value);
  const [typesSaving, setTypesSaving]         = useState(false);

  const openTypeManager = () => {
    setLocalTypes(productTypes.map(t => ({ ...t })));
    setShowTypeManager(true);
  };

  const updateLocal = (id: string, field: keyof ProductTypeDefinition, value: string) => {
    setLocalTypes(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const saveType = async (t: ProductTypeDefinition) => {
    setTypesSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("product_type_definitions")
      .update({ label: t.label, badge_color: t.badge_color })
      .eq("id", t.id);
    if (error) toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    else { await refetchTypes(); toast({ title: "Saved" }); }
    setTypesSaving(false);
  };

  const deleteType = async (t: ProductTypeDefinition) => {
    if (!confirm(`Delete type "${t.label}"? Existing products using this type will keep the slug value.`)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("product_type_definitions").delete().eq("id", t.id);
    await refetchTypes();
    setLocalTypes(prev => prev.filter(x => x.id !== t.id));
  };

  const addType = async () => {
    if (!newSlug.trim() || !newLabel.trim()) return;
    setTypesSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("product_type_definitions")
      .insert({ slug: newSlug.trim().toLowerCase().replace(/\s+/g, "_"), label: newLabel.trim(), badge_color: newColor, sort_order: localTypes.length });
    if (error) toast({ title: "Failed to add", description: error.message, variant: "destructive" });
    else {
      setNewSlug(""); setNewLabel(""); setNewColor(PRODUCT_TYPE_COLOR_PRESETS[0].value);
      await refetchTypes();
      toast({ title: "Type added" });
    }
    setTypesSaving(false);
  };

  useEffect(() => { fetchCoaches(); }, []);

  const fetchCoaches = async () => {
    setLoadingCoaches(true);
    const { data } = await supabase
      .from("coaches")
      .select("id, display_name, slug, tier")
      .order("display_name");
    setCoaches((data || []) as Coach[]);
    setLoadingCoaches(false);
  };

  const fetchProducts = async (coachId: string, tier?: string | null) => {
    setLoadingProducts(true);
    setEditing(null);
    setGalarasProducts([]);
    const { data } = await supabase
      .from("coach_products")
      .select("*")
      .eq("coach_id", coachId)
      .order("sort_order");
    setProducts((data || []) as Product[]);

    // Master coaches: also load Galoras platform products (read-only)
    if (tier === "master") {
      const { data: galCoach } = await supabase
        .from("coaches")
        .select("id")
        .eq("slug", "galoras")
        .maybeSingle();
      if (galCoach?.id && galCoach.id !== coachId) {
        const { data: gData } = await supabase
          .from("coach_products")
          .select("*")
          .eq("coach_id", galCoach.id)
          .order("sort_order");
        setGalarasProducts((gData || []) as Product[]);
      }
    }

    setLoadingProducts(false);
  };

  const selectCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    fetchProducts(coach.id, coach.tier);
  };

  const startNew = () => {
    if (!selectedCoach) return;
    setIsNew(true);
    const blank = BLANK_PRODUCT(selectedCoach.id);
    setEditing(blank);
    setAudienceInput("");
  };

  const selectProduct = (p: Product) => {
    setIsNew(false);
    setEditing({ ...p });
    setAudienceInput((p.target_audience ?? []).join(", "));
  };

  // Admins can edit Galoras products directly
  const selectGalarasProduct = (p: Product) => {
    setIsNew(false);
    setEditing({ ...p });
    setAudienceInput((p.target_audience ?? []).join(", "));
  };

  const priceDisplay = (p: Product) => {
    if (p.price_type === "fixed" && p.price_amount)
      return `$${(p.price_amount / 100).toLocaleString()}`;
    if (p.price_type === "range" && p.price_range_min && p.price_range_max)
      return `$${(p.price_range_min / 100).toLocaleString()} – $${(p.price_range_max / 100).toLocaleString()}`;
    return p.price_type;
  };

  const save = async () => {
    if (!editing || !selectedCoach) return;
    setSaving(true);

    // Parse audience
    const audience = audienceInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      ...editing,
      target_audience: audience.length > 0 ? audience : null,
    };

    if (isNew) {
      const { error } = await supabase.from("coach_products").insert(payload);
      if (error) {
        toast({ title: "Failed to create", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Product created" });
        fetchProducts(selectedCoach.id);
        setEditing(null);
      }
    } else {
      const { id, ...patch } = payload as Product & { target_audience: string[] | null };
      const { error } = await supabase.from("coach_products").update(patch).eq("id", id);
      if (error) {
        toast({ title: "Failed to save", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Saved" });
        fetchProducts(selectedCoach.id);
      }
    }

    setSaving(false);
  };

  const toggleActive = async (p: Product) => {
    const { error } = await supabase
      .from("coach_products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (!error && selectedCoach) fetchProducts(selectedCoach.id);
  };

  const deleteProduct = async (p: Product) => {
    // Check for active bookings before allowing deletion
    const { data: activeBookings } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("product_id", p.id)
      .not("status", "in", '("cancelled","refunded","completed")');

    const bookingCount = (activeBookings as unknown as { count: number } | null)?.count
      ?? (Array.isArray(activeBookings) ? (activeBookings as unknown[]).length : 0);

    // Also check session_bookings
    const { data: activeSessions } = await supabase
      .from("session_bookings")
      .select("id", { count: "exact", head: true })
      .eq("product_id", p.id)
      .not("status", "in", '("cancelled","completed")');

    const sessionCount = (activeSessions as unknown as { count: number } | null)?.count
      ?? (Array.isArray(activeSessions) ? (activeSessions as unknown[]).length : 0);

    if (bookingCount > 0 || sessionCount > 0) {
      toast({
        title: "Cannot delete product",
        description: `This product has ${bookingCount + sessionCount} active booking(s). Wait until all sessions are complete and payments received.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("coach_products").delete().eq("id", p.id);
    if (!error && selectedCoach) {
      fetchProducts(selectedCoach.id);
      if ((editing as Product)?.id === p.id) setEditing(null);
    }
  };

  const set = (field: string, value: string | number | boolean | null) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  return (
    <AdminLayout title="Products">
      {/* ── Manage Types Dialog ── */}
      <Dialog open={showTypeManager} onOpenChange={setShowTypeManager}>
        <DialogContent className="bg-[#0a1628] border-zinc-700 text-white max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Manage Product Types</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {localTypes.map(t => (
              <div key={t.id} className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full border shrink-0 ${t.badge_color}`}>
                  {t.label || "preview"}
                </span>
                <input
                  className={inputClass() + " flex-1"}
                  value={t.label}
                  onChange={e => updateLocal(t.id, "label", e.target.value)}
                  placeholder="Label"
                />
                <select
                  className={inputClass() + " w-28"}
                  value={t.badge_color}
                  onChange={e => updateLocal(t.id, "badge_color", e.target.value)}
                >
                  {PRODUCT_TYPE_COLOR_PRESETS.map(p => (
                    <option key={p.value} value={p.value} className="bg-[#1a2f4a]">{p.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => saveType(t)}
                  disabled={typesSaving}
                  className="text-xs text-amber-400 font-semibold hover:text-amber-300 shrink-0"
                >
                  Save
                </button>
                <button onClick={() => deleteType(t)} className="text-red-400 hover:text-red-300 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new type */}
          <div className="pt-4 border-t border-zinc-700 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add New Type</p>
            <div className="flex items-center gap-2">
              <input
                className={inputClass() + " w-28"}
                value={newSlug}
                onChange={e => setNewSlug(e.target.value)}
                placeholder="slug"
              />
              <input
                className={inputClass() + " flex-1"}
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Label"
              />
              <select
                className={inputClass() + " w-28"}
                value={newColor}
                onChange={e => setNewColor(e.target.value)}
              >
                {PRODUCT_TYPE_COLOR_PRESETS.map(p => (
                  <option key={p.value} value={p.value} className="bg-[#1a2f4a]">{p.name}</option>
                ))}
              </select>
              <button
                onClick={addType}
                disabled={typesSaving || !newSlug.trim() || !newLabel.trim()}
                className="shrink-0 flex items-center gap-1 text-xs text-emerald-400 font-semibold hover:text-emerald-300 disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex h-full">

        {/* Left: coach list */}
        <aside className="w-52 shrink-0 border-r border-zinc-800 overflow-y-auto">
          <div className="p-3 border-b border-zinc-800">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Coaches</p>
          </div>
          {loadingCoaches ? (
            <div className="p-4 text-slate-500 text-sm">Loading…</div>
          ) : coaches.map(c => (
            <button
              key={c.id}
              onClick={() => selectCoach(c)}
              className={`w-full text-left px-4 py-3 text-sm border-b border-zinc-800/50 transition-colors ${
                selectedCoach?.id === c.id
                  ? "bg-amber-600/15 text-amber-300"
                  : "text-slate-300 hover:bg-zinc-800/50"
              }`}
            >
              {c.display_name || "Unnamed"}
            </button>
          ))}
        </aside>

        {/* Middle: product list */}
        <div className="w-64 shrink-0 border-r border-zinc-800 flex flex-col">
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Products {selectedCoach ? `(${products.length})` : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={openTypeManager}
                className="text-slate-500 hover:text-amber-400"
                title="Manage product types"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
              {selectedCoach && (
                <button
                  onClick={startNew}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" /> New
                </button>
              )}
            </div>
          </div>

          {!selectedCoach ? (
            <p className="p-4 text-slate-600 text-sm">Select a coach</p>
          ) : loadingProducts ? (
            <div className="p-4 text-slate-500 text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : products.length === 0 && galarasProducts.length === 0 ? (
            <p className="p-4 text-slate-600 text-sm">No products yet</p>
          ) : (
            <div className="overflow-y-auto flex-1">
              {products.map(p => (
                <div
                  key={p.id}
                  onClick={() => selectProduct(p)}
                  className={`px-4 py-3 border-b border-zinc-800/50 cursor-pointer transition-colors ${
                    (editing as Product)?.id === p.id
                      ? "bg-amber-600/10 border-l-2 border-l-amber-500"
                      : "hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-200 font-medium line-clamp-1">{p.title}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(p); }}
                      className="shrink-0 text-slate-500 hover:text-amber-400"
                      title={p.is_active ? "Active — click to deactivate" : "Inactive — click to activate"}
                    >
                      {p.is_active
                        ? <ToggleRight className="h-4 w-4 text-emerald-400" />
                        : <ToggleLeft className="h-4 w-4 text-slate-600" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{priceDisplay(p)}</p>
                </div>
              ))}

              {/* Galoras platform programs — read-only */}
              {galarasProducts.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-amber-950/30 border-y border-amber-800/30 flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Galoras Platform</span>
                  </div>
                  {galarasProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => selectGalarasProduct(p)}
                      className={`px-4 py-3 border-b border-zinc-800/50 cursor-pointer transition-colors ${
                        (editing as Product)?.id === p.id
                          ? "bg-amber-600/10 border-l-2 border-l-amber-500"
                          : "hover:bg-zinc-800/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="h-3 w-3 text-amber-600 shrink-0" />
                        <p className="text-sm text-slate-400 font-medium line-clamp-1">{p.title}</p>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 pl-5">{priceDisplay(p)}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: edit form */}
        <div className="flex-1 overflow-y-auto bg-[#0a1628] p-6">
          {!editing ? (
            <div className="flex items-center justify-center h-full text-slate-600 text-sm">
              {selectedCoach ? "Select a product or click New" : "Select a coach to manage products"}
            </div>
          ) : (
            <div className="max-w-2xl space-y-5">
              {/* Info banner when editing a Galoras platform product */}
              {galarasProducts.some(g => g.id === (editing as Product)?.id) && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-950/30 border border-amber-700/30">
                  <Lock className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-400">
                    <span className="font-semibold">Galoras platform program</span>{" "}
                    — shared across all Master coaches. Changes here affect all Master coach profiles.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-white">
                  {isNew ? "New Product" : "Edit Product"}
                </h2>
                <div className="flex items-center gap-2">
                  {!isNew && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProduct(editing as Product)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={save}
                    disabled={saving || !editing.title}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    {isNew ? "Create" : "Save"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Product Type">
                  <select
                    className={inputClass()}
                    value={editing.product_type}
                    onChange={e => set("product_type", e.target.value)}
                  >
                    {typesLoading
                      ? <option value={editing.product_type}>{editing.product_type}</option>
                      : productTypes.map(t => (
                          <option key={t.slug} value={t.slug} className="bg-[#1a2f4a]">{t.label}</option>
                        ))
                    }
                  </select>
                </Field>
                <Field label="Delivery Format">
                  <select
                    className={inputClass()}
                    value={editing.delivery_format || "online"}
                    onChange={e => set("delivery_format", e.target.value)}
                  >
                    {FORMATS.map(f => (
                      <option key={f} value={f} className="bg-[#1a2f4a] capitalize">{f.replace("_", " ")}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Title">
                <input
                  className={inputClass()}
                  value={editing.title}
                  onChange={e => set("title", e.target.value)}
                  placeholder="Product title"
                />
              </Field>

              <Field label="Outcome Statement">
                <textarea
                  className={inputClass() + " min-h-[100px] resize-y"}
                  value={editing.outcome_statement || ""}
                  onChange={e => set("outcome_statement", e.target.value || null)}
                  placeholder="What will the client achieve?"
                />
              </Field>

              <Field label="Target Audience (comma-separated)">
                <input
                  className={inputClass()}
                  value={audienceInput}
                  onChange={e => setAudienceInput(e.target.value)}
                  placeholder="e.g. Mid-level managers, Team leads"
                />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Sessions">
                  <input
                    className={inputClass()}
                    type="number"
                    min={1}
                    value={editing.session_count ?? ""}
                    onChange={e => set("session_count", e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Field>
                <Field label="Duration (mins)">
                  <input
                    className={inputClass()}
                    type="number"
                    min={1}
                    value={editing.duration_minutes ?? ""}
                    onChange={e => set("duration_minutes", e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Field>
                <Field label="Weeks">
                  <input
                    className={inputClass()}
                    type="number"
                    min={1}
                    value={editing.duration_weeks ?? ""}
                    onChange={e => set("duration_weeks", e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Price Type">
                  <select
                    className={inputClass()}
                    value={editing.price_type}
                    onChange={e => set("price_type", e.target.value)}
                  >
                    {PRICE_TYPES.map(pt => (
                      <option key={pt} value={pt} className="bg-[#1a2f4a] capitalize">{pt}</option>
                    ))}
                  </select>
                </Field>
                {editing.price_type === "fixed" && (
                  <Field label="Price ($)">
                    <input
                      className={inputClass()}
                      type="number"
                      value={editing.price_amount != null ? editing.price_amount / 100 : ""}
                      onChange={e => set("price_amount", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)}
                      placeholder="e.g. 500"
                    />
                  </Field>
                )}
                {editing.price_type === "range" && (
                  <>
                    <Field label="Min price ($)">
                      <input
                        className={inputClass()}
                        type="number"
                        value={editing.price_range_min != null ? editing.price_range_min / 100 : ""}
                        onChange={e => set("price_range_min", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)}
                      />
                    </Field>
                    <Field label="Max price ($)">
                      <input
                        className={inputClass()}
                        type="number"
                        value={editing.price_range_max != null ? editing.price_range_max / 100 : ""}
                        onChange={e => set("price_range_max", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)}
                      />
                    </Field>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Booking Mode">
                  <select
                    className={inputClass()}
                    value={editing.booking_mode}
                    onChange={e => set("booking_mode", e.target.value)}
                  >
                    {BOOKING_MODES.map(bm => (
                      <option key={bm.value} value={bm.value} className="bg-[#1a2f4a]">{bm.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Visibility">
                  <select
                    className={inputClass()}
                    value={editing.visibility_scope}
                    onChange={e => set("visibility_scope", e.target.value)}
                  >
                    {VISIBILITY.map(v => (
                      <option key={v} value={v} className="bg-[#1a2f4a] capitalize">{v}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Sort Order">
                  <input
                    className={inputClass()}
                    type="number"
                    value={editing.sort_order}
                    onChange={e => set("sort_order", parseInt(e.target.value) || 0)}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700">
                <input
                  type="checkbox"
                  id="enterprise_ready"
                  checked={editing.enterprise_ready ?? false}
                  onChange={e => set("enterprise_ready", e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <label htmlFor="enterprise_ready" className="text-sm text-slate-300 cursor-pointer">
                  <span className="font-semibold text-amber-400">Enterprise ready</span>
                  <span className="text-slate-500 ml-1">— suitable for corporate / team engagements</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
