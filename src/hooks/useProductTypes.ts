import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProductTypeDefinition {
  id:          string;
  slug:        string;
  label:       string;
  badge_color: string;
  sort_order:  number;
}

// Preset colors — must be defined here so Tailwind includes them in the build
export const PRODUCT_TYPE_COLOR_PRESETS: { name: string; value: string }[] = [
  { name: "Violet",  value: "bg-violet-500/10 border-violet-500/30 text-violet-400" },
  { name: "Blue",    value: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  { name: "Emerald", value: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  { name: "Amber",   value: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  { name: "Rose",    value: "bg-rose-500/10 border-rose-500/30 text-rose-400" },
  { name: "Sky",     value: "bg-sky-500/10 border-sky-500/30 text-sky-400" },
  { name: "Orange",  value: "bg-orange-500/10 border-orange-500/30 text-orange-400" },
  { name: "Teal",    value: "bg-teal-500/10 border-teal-500/30 text-teal-400" },
  { name: "Indigo",  value: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" },
  { name: "Zinc",    value: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400" },
];

const FALLBACK_COLOR = "bg-zinc-500/10 border-zinc-500/30 text-zinc-400";

export function useProductTypes() {
  const [types, setTypes]     = useState<ProductTypeDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("product_type_definitions")
      .select("id, slug, label, badge_color, sort_order")
      .order("sort_order");
    setTypes(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const getConfig = useCallback((slug: string) => {
    const found = types.find(t => t.slug === slug);
    return {
      label:     found?.label      ?? slug,
      className: found?.badge_color ?? FALLBACK_COLOR,
    };
  }, [types]);

  return { types, loading, refetch, getConfig };
}
