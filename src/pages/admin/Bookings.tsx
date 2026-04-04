import { Layout } from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Bookings() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Bookings</h1>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : !bookings?.length ? (
            <p className="text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="rounded-lg border p-4">
                  <span className="font-medium">{b.client_name}</span>
                  <span className="ml-3 text-sm text-muted-foreground">
                    {b.scheduled_date} at {b.scheduled_time}
                  </span>
                  <span className="ml-3 text-xs text-muted-foreground">{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
