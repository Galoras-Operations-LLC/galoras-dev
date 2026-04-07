import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Loader2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

type Coach = { id: string; display_name: string | null; slug: string | null };

type Product = {
  id: string;
  coach_id: string;
  product_type: string;
  title: string;
  summary: string | null;
  who_its_for: string | null;
  duration_label: string | null;
  format: string | null;
  pricing_band: string | null;
  price_display: string | null;
  price_cents: number | null;
  cta_label: string;
  cta_url: string | null;
  is_active: boolean;
  sort_order: number;
};

const BLANK_PRODUCT = (coachId: string): Omit<Product, "id"> => ({
  coach_id: coachId,
  product_type: "diagnostic",
  title: "",
  summary: null,
  who_its_for: null,
  duration_label: null,
  format: "online",
  pricing_band: null,
  price_display: null,
  price_cents: null,
  cta_label: "Enquire",
  cta_url: null,
  is_active: true,
  sort_order: 0,
});

const PRODUCT_TYPES = ["diagnostic", "block", "program", "enterprise"];
const FORMATS = ["online", "in_person", "hybrid"];

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

  useEffect(() => { fetchCoaches(); }, []);

  const fetchCoaches = async () => {
    setLoadingCoaches(true);
    const { data } = await supabase
      .from("coaches")
      .select("id, display_name, slug")
      .order("display_name");
    setCoaches((data || []) as Coach[]);
    setLoadingCoaches(false);
  };

  const fetchProducts = async (coachId: string) => {
    setLoadingProducts(true);
    setEditing(null);
    const { data } = await supabase
      .from("coach_products")
      .select("*")
      .eq("coach_id", coachId)
      .order("sort_order");
    setProducts((data || []) as Product[]);
    setLoadingProducts(false);
  };

  const selectCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    fetchProducts(coach.id);
  };

  const startNew = () => {
    if (!selectedCoach) return;
    setIsNew(true);
    setEditing(BLANK_PRODUCT(selectedCoach.id));
  };

  const selectProduct = (p: Product) => {
    setIsNew(false);
    setEditing({ ...p });
  };

  const save = async () => {
    if (!editing || !selectedCoach) return;
    setSaving(true);

    if (isNew) {
      const { error } = await supabase.from("coach_products").insert(editing);
      if (error) {
        toast({ title: "Failed to create", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Product created" });
        fetchProducts(selectedCoach.id);
        setEditing(null);
      }
    } else {
      const { id, ...patch } = editing as Product;
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
            {selectedCoach && (
              <button
                onClick={startNew}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> New
              </button>
            )}
          </div>

          {!selectedCoach ? (
            <p className="p-4 text-slate-600 text-sm">Select a coach</p>
          ) : loadingProducts ? (
            <div className="p-4 text-slate-500 text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : products.length === 0 ? (
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
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{p.product_type}</p>
                </div>
              ))}
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
                    {PRODUCT_TYPES.map(t => (
                      <option key={t} value={t} className="bg-[#1a2f4a] capitalize">{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Format">
                  <select
                    className={inputClass()}
                    value={editing.format || "online"}
                    onChange={e => set("format", e.target.value)}
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

              <Field label="Summary">
                <textarea
                  className={inputClass() + " min-h-[100px] resize-y"}
                  value={editing.summary || ""}
                  onChange={e => set("summary", e.target.value || null)}
                  placeholder="Short description shown on product card"
                />
              </Field>

              <Field label="Who It's For">
                <input
                  className={inputClass()}
                  value={editing.who_its_for || ""}
                  onChange={e => set("who_its_for", e.target.value || null)}
                  placeholder="e.g. High-potential leaders in Series B+ companies"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Duration Label">
                  <input
                    className={inputClass()}
                    value={editing.duration_label || ""}
                    onChange={e => set("duration_label", e.target.value || null)}
                    placeholder="e.g. 60 mins, 4 sessions"
                  />
                </Field>
                <Field label="Pricing Band">
                  <select
                    className={inputClass()}
                    value={editing.pricing_band || ""}
                    onChange={e => set("pricing_band", e.target.value || null)}
                  >
                    <option value="" className="bg-[#1a2f4a]">— none —</option>
                    <option value="standard" className="bg-[#1a2f4a]">Standard</option>
                    <option value="premium" className="bg-[#1a2f4a]">Premium</option>
                    <option value="elite" className="bg-[#1a2f4a]">Elite</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Price Display">
                  <input
                    className={inputClass()}
                    value={editing.price_display || ""}
                    onChange={e => set("price_display", e.target.value || null)}
                    placeholder='e.g. "$500" or "$1,500 – $3,000"'
                  />
                </Field>
                <Field label="Price (cents) — leave blank for enquiry">
                  <input
                    className={inputClass()}
                    type="number"
                    value={editing.price_cents ?? ""}
                    onChange={e => set("price_cents", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g. 50000 = $500"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="CTA Label">
                  <input
                    className={inputClass()}
                    value={editing.cta_label}
                    onChange={e => set("cta_label", e.target.value)}
                    placeholder="Book Now / Enquire / Request Proposal"
                  />
                </Field>
                <Field label="CTA URL (optional)">
                  <input
                    className={inputClass()}
                    value={editing.cta_url || ""}
                    onChange={e => set("cta_url", e.target.value || null)}
                    placeholder="https://calendly.com/..."
                  />
                </Field>
              </div>

              <Field label="Sort Order">
                <input
                  className={inputClass()}
                  type="number"
                  value={editing.sort_order}
                  onChange={e => set("sort_order", parseInt(e.target.value) || 0)}
                />
              </Field>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
