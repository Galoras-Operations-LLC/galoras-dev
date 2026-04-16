import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <Layout>
      <SEO
        title="Pricing & Plans"
        description="Galoras coaching plans for individuals and teams. Choose the level of access that fits your goals — from individual sessions to full programme engagements."
        canonical="/pricing"
      />
      <section className="relative pt-28 pb-20 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.10),transparent_55%)]" />

        <div className="container-wide relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
                Coach Ecosystem — Join the platform
              </p>
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white uppercase mb-4">
                Three tiers.{" "}
                <span className="text-gradient">One ecosystem.</span>{" "}
                Real results.
              </h1>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Choose the tier that reflects where you are — and where you want to go. Progression is based on trust, alignment, and responsibility, not just payment.
              </p>
            </div>

            <SubscriptionPlans onSuccess={() => navigate("/subscription-success")} />
          </div>
        </div>
      </section>
    </Layout>
  );
}
