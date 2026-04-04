import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function CoachesList() {
  const { data: coaches, isLoading } = useQuery({
    queryKey: ["admin-coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, display_name, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">All Coaches</h1>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3">
              {coaches?.map((c) => (
                <Link
                  key={c.id}
                  to={`/admin/coaches/${c.id}`}
                  className="block rounded-lg border p-4 hover:bg-muted/50 transition"
                >
                  <span className="font-medium">{c.display_name || "Unnamed"}</span>
                  <span className="ml-3 text-sm text-muted-foreground">{c.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
