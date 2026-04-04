import { Layout } from "@/components/layout/Layout";

export default function Coaches() {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Coaches Admin</h1>
          <p className="mt-4 text-muted-foreground">Manage coaches from this panel.</p>
        </div>
      </section>
    </Layout>
  );
}
