import { Layout } from "@/components/layout/Layout";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function CoachEditorDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: coach, isLoading } = useQuery({
    queryKey: ["admin-coach", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : coach ? (
            <>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                {coach.display_name || "Unnamed Coach"}
              </h1>
              <p className="text-muted-foreground">Status: {coach.status}</p>
              <p className="text-muted-foreground mt-2">{coach.bio || "No bio provided."}</p>
            </>
          ) : (
            <p className="text-muted-foreground">Coach not found.</p>
          )}
        </div>
      </section>
    </Layout>
  );
}
