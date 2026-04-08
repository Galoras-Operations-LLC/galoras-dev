import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Tag {
  id:            string;
  tag_key:       string;
  tag_label:     string;
  tag_family:    string;
  display_order: number;
}

export function useTags() {
  const [tags, setTags]       = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from("tags")
      .select("id, tag_key, tag_label, tag_family, display_order")
      .eq("is_active", true)
      .order("tag_family")
      .order("display_order")
      .then(({ data }: { data: Tag[] | null }) => {
        setTags(data ?? []);
        setLoading(false);
      });
  }, []);

  const getTagsByFamily = useCallback(
    (family: string) => tags.filter(t => t.tag_family === family),
    [tags]
  );

  const getTagIdsByKeys = useCallback(
    (keys: string[]) => tags.filter(t => keys.includes(t.tag_key)).map(t => t.id),
    [tags]
  );

  return { tags, loading, getTagsByFamily, getTagIdsByKeys };
}
