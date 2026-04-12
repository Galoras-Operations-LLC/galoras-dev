import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProductTypes } from '@/hooks/useProductTypes';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Trash2,
  Save,
  Package,
  DollarSign,
  Eye,
} from 'lucide-react';

interface CoachProduct {
  id: string;
  coach_id: string;
  product_type: string;
  title: string;
  summary?: string | null;
  outcome_statement?: string | null;
  target_audience?: string[] | null;
  delivery_format?: string | null;
  duration_minutes?: number | null;
  format?: string | null;
  price_type: string;
  price_amount?: number | null;
  price_range_min?: number | null;
  price_range_max?: number | null;
  booking_mode: string;
  is_active: boolean;
  sort_order: number;
  sessions?: number | null;
  weeks?: number | null;
}

interface ProductDraft {
  title: string;
  product_type: string;
  summary: string;
  outcome_statement: string;
  target_audience: string;
  duration_minutes: number | '';
  format: string;
  delivery_format: string;
  price_type: string;
  price_amount: number | '';
  price_range_min: number | '';
  price_range_max: number | '';
  booking_mode: string;
  is_active: boolean;
  sessions: number | '';
  weeks: number | '';
}

const EMPTY_DRAFT: ProductDraft = {
  title: '',
  product_type: 'diagnostic',
  summary: '',
  outcome_statement: '',
  target_audience: '',
  duration_minutes: 60,
  format: 'online',
  delivery_format: '',
  price_type: 'fixed',
  price_amount: '',
  price_range_min: '',
  price_range_max: '',
  booking_mode: 'enquiry',
  is_active: true,
  sessions: '',
  weeks: '',
};

interface CoachProductsManagerProps {
  coachProfile: { id: string; display_name: string | null };
}

const priceLabel = (p: CoachProduct) => {
  if (p.price_type === 'fixed' && p.price_amount) return `$${(p.price_amount / 100).toFixed(p.price_amount % 100 === 0 ? 0 : 2)}`;
  if (p.price_type === 'range' && p.price_range_min) return `$${(p.price_range_min / 100).toFixed(0)}+`;
  return 'Enquiry';
};

export function CoachProductsManager({ coachProfile }: CoachProductsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { types, getConfig } = useProductTypes();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);

  const { data: products = [], isLoading } = useQuery<CoachProduct[]>({
    queryKey: ['coach-own-products', coachProfile.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('coach_products')
        .select('*')
        .eq('coach_id', coachProfile.id)
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { error } = await (supabase as any)
        .from('coach_products')
        .upsert(payload, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-own-products', coachProfile.id] });
      toast({ title: 'Product saved' });
      setIsNew(false);
    },
    onError: (err: Error) => {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('coach_products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-own-products', coachProfile.id] });
      toast({ title: 'Product deleted' });
      setSelectedId(null);
      setIsNew(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any).from('coach_products').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-own-products', coachProfile.id] });
    },
  });

  const selectProduct = (p: CoachProduct) => {
    setSelectedId(p.id);
    setIsNew(false);
    setDraft({
      title: p.title,
      product_type: p.product_type,
      summary: '',
      outcome_statement: p.outcome_statement ?? '',
      target_audience: Array.isArray(p.target_audience) ? p.target_audience.join(', ') : '',
      duration_minutes: p.duration_minutes ?? 60,
      format: p.delivery_format ?? 'online',
      delivery_format: p.delivery_format ?? '',
      price_type: p.price_type,
      price_amount: p.price_amount ?? '',
      price_range_min: p.price_range_min ?? '',
      price_range_max: p.price_range_max ?? '',
      booking_mode: p.booking_mode,
      is_active: p.is_active,
      sessions: (p as any).session_count ?? '',
      weeks: (p as any).duration_weeks ?? '',
    });
  };

  const startNew = () => {
    setSelectedId(null);
    setIsNew(true);
    setDraft(EMPTY_DRAFT);
  };

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    if (!draft.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    const audience = draft.target_audience.split(',').map((s) => s.trim()).filter(Boolean);
    const payload: Record<string, unknown> = {
      product_type: draft.product_type,
      title: draft.title.trim(),
      outcome_statement: draft.outcome_statement || null,
      target_audience: audience.length > 0 ? audience : null,
      duration_minutes: draft.duration_minutes || null,
      delivery_format: draft.format || 'online',
      session_count: draft.sessions || null,
      duration_weeks: draft.weeks || null,
      price_type: draft.price_type,
      price_amount: draft.price_type === 'fixed' ? (draft.price_amount || null) : null,
      price_range_min: draft.price_type === 'range' ? (draft.price_range_min || null) : null,
      price_range_max: draft.price_type === 'range' ? (draft.price_range_max || null) : null,
      booking_mode: draft.booking_mode,
      is_active: draft.is_active,
    };
    if (selectedId) {
      payload.id = selectedId;
    } else {
      payload.coach_id = coachProfile.id;
      payload.sort_order = products.length;
    }
    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 h-[calc(100vh-120px)]">
        <Skeleton className="w-72 h-full rounded-xl" />
        <Skeleton className="flex-1 h-full rounded-xl" />
      </div>
    );
  }

  const showEditor = selectedId || isNew;

  return (
    <div className="flex gap-0 h-[calc(100vh-120px)] rounded-xl overflow-hidden border border-border">
      {/* ── Product List Panel ── */}
      <div className="w-72 bg-card border-r border-border flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-white">PRODUCTS ({products.length})</span>
          <button
            onClick={startNew}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {products.length === 0 && !isNew ? (
            <div className="px-4 py-8 text-center">
              <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No products yet</p>
              <button onClick={startNew} className="text-xs text-primary hover:underline mt-2">
                Create your first product
              </button>
            </div>
          ) : (
            products.map((p) => {
              const isSelected = p.id === selectedId && !isNew;
              const cfg = getConfig(p.product_type);
              return (
                <button
                  key={p.id}
                  onClick={() => selectProduct(p)}
                  className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${
                    isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-white'}`}>
                      {p.title.length > 28 ? p.title.slice(0, 28) + '...' : p.title}
                    </span>
                    <Eye
                      className={`h-3.5 w-3.5 shrink-0 ml-2 ${p.is_active ? 'text-emerald-400' : 'text-muted-foreground/40'}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{priceLabel(p)}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Edit Panel ── */}
      <div className="flex-1 bg-background overflow-y-auto">
        {!showEditor ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm">Select a product to edit or create a new one</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-white">
                {isNew ? 'New Product' : 'Edit Product'}
              </h3>
              <div className="flex items-center gap-2">
                {selectedId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Delete this product?')) deleteMutation.mutate(selectedId);
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending} className="gap-1.5 bg-primary text-primary-foreground">
                  <Save className="h-4 w-4" />
                  {saveMutation.isPending ? 'Saving...' : 'SAVE'}
                </Button>
              </div>
            </div>

            {/* Product Type + Delivery Format */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Product Type</Label>
                <select
                  value={draft.product_type}
                  onChange={(e) => set('product_type', e.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {types.length > 0 ? types.map((t) => (
                    <option key={t.id} value={t.slug}>{t.label}</option>
                  )) : (
                    <>
                      <option value="diagnostic">Diagnostic</option>
                      <option value="block">Block</option>
                      <option value="program">Program</option>
                      <option value="enterprise">Enterprise</option>
                    </>
                  )}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Delivery Format</Label>
                <select
                  value={draft.format}
                  onChange={(e) => set('format', e.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="online">Online</option>
                  <option value="in_person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Title</Label>
              <Input
                value={draft.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. 90-Day Leadership Sprint"
                className="bg-card border-border"
              />
            </div>

            {/* Outcome Statement */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Outcome Statement</Label>
              <textarea
                value={draft.outcome_statement}
                onChange={(e) => set('outcome_statement', e.target.value)}
                placeholder="What will the client achieve?"
                rows={4}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Target Audience (comma-separated)</Label>
              <Input
                value={draft.target_audience}
                onChange={(e) => set('target_audience', e.target.value)}
                placeholder="Founders scaling past first revenue, CEOs navigating GTM pivots"
                className="bg-card border-border"
              />
            </div>

            {/* Sessions / Duration / Weeks */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Sessions</Label>
                <Input
                  type="number" min={1}
                  value={draft.sessions}
                  onChange={(e) => set('sessions', e.target.value ? Number(e.target.value) : '')}
                  placeholder="6"
                  className="bg-card border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Duration (mins)</Label>
                <Input
                  type="number" min={1}
                  value={draft.duration_minutes}
                  onChange={(e) => set('duration_minutes', e.target.value ? Number(e.target.value) : '')}
                  placeholder="60"
                  className="bg-card border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Weeks</Label>
                <Input
                  type="number" min={1}
                  value={draft.weeks}
                  onChange={(e) => set('weeks', e.target.value ? Number(e.target.value) : '')}
                  placeholder="12"
                  className="bg-card border-border"
                />
              </div>
            </div>

            {/* Price Type + Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Price Type</Label>
                <select
                  value={draft.price_type}
                  onChange={(e) => set('price_type', e.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="fixed">Fixed</option>
                  <option value="range">Range</option>
                  <option value="enquiry">Enquiry</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  {draft.price_type === 'range' ? 'Price range ($)' : 'Price ($)'}
                </Label>
                {draft.price_type === 'enquiry' ? (
                  <p className="text-sm text-muted-foreground italic pt-2">Clients enquire directly</p>
                ) : draft.price_type === 'range' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" min={0} value={draft.price_range_min ? draft.price_range_min / 100 : ''}
                      onChange={(e) => set('price_range_min', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : '')}
                      placeholder="Min $" className="bg-card border-border" />
                    <Input type="number" min={0} value={draft.price_range_max ? draft.price_range_max / 100 : ''}
                      onChange={(e) => set('price_range_max', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : '')}
                      placeholder="Max $" className="bg-card border-border" />
                  </div>
                ) : (
                  <Input type="number" min={0} value={draft.price_amount ? draft.price_amount / 100 : ''}
                    onChange={(e) => set('price_amount', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : '')}
                    placeholder="e.g. 500" className="bg-card border-border" />
                )}
              </div>
            </div>

            {/* Booking Mode + Active */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Booking Mode</Label>
                <select
                  value={draft.booking_mode}
                  onChange={(e) => set('booking_mode', e.target.value)}
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="stripe">Stripe Checkout</option>
                  <option value="enquiry">Enquiry</option>
                  <option value="external">External Link</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch checked={draft.is_active} onCheckedChange={(checked) => set('is_active', checked)} />
                  <span className="text-sm text-white">{draft.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
