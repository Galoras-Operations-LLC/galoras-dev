import { Layout } from "@/components/layout/Layout";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function SubscriptionSuccess() {
  return (
    <Layout>
      <section className="py-20">
        <div className="container mx-auto px-6 text-center max-w-lg">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Subscription Active</h1>
          <p className="mt-4 text-muted-foreground">Your subscription is now active. Welcome aboard!</p>
          <Link to="/dashboard" className="inline-block mt-8">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
