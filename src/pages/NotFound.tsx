import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Home, Compass, Users, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=2000&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          {/* 404 Display */}
          <div className="mb-8">
            <h1 className="text-[120px] md:text-[180px] font-display font-bold leading-none text-primary/20">
              404
            </h1>
            <div className="relative -mt-12 md:-mt-16">
              <Compass className="h-16 w-16 md:h-20 md:w-20 mx-auto text-primary animate-pulse" />
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
            Looks like you've wandered off the path
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            Don't worry – even the best explorers get lost sometimes. Let's help you find your way back.
          </p>

          {/* Navigation Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/coaching">
                <Users className="mr-2 h-4 w-4" />
                Explore Coaching
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="border-t border-border/50 pt-8">
            <p className="text-sm text-muted-foreground mb-4">Or try one of these popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/about" className="text-primary hover:underline">About Us</Link>
              <span className="text-border">•</span>
              <Link to="/business" className="text-primary hover:underline">Business Solutions</Link>
              <span className="text-border">•</span>
              <Link to="/compass" className="text-primary hover:underline">Compass</Link>
              <span className="text-border">•</span>
              <Link to="/contact" className="text-primary hover:underline">Contact</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
