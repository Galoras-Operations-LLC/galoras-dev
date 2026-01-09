import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { TiltCard } from "@/components/ui/tilt-card";
import featuredCoachesPlaceholder from "@/assets/featured-coaches-placeholder.jpg";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
} as const;

const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
} as const;

export function FeaturedCoaches() {
  const { data: featuredCoaches, isLoading } = useQuery({
    queryKey: ["featured-coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, display_name, avatar_url, cutout_url, headline, specialties")
        .eq("status", "approved")
        .eq("is_featured", true)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <section className="relative py-24 bg-black overflow-hidden">
        <div className="container-wide relative z-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white mb-16">
            Featured Coaches
          </h2>
          <div className="flex justify-center items-end gap-4 md:gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-t-full bg-muted/20 animate-pulse",
                  i === 2 ? "w-40 h-64 md:w-52 md:h-80" : "w-32 h-52 md:w-44 md:h-72"
                )}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Check if any coaches have cutout images
  const hasAnyCutouts = featuredCoaches?.some(coach => coach.cutout_url);

  // Show placeholder image when no featured coaches exist OR no cutouts available
  if (!featuredCoaches || featuredCoaches.length === 0 || !hasAnyCutouts) {
    return (
      <section className="relative bg-black overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm scale-110"
          style={{ backgroundImage: `url(${featuredCoachesPlaceholder})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        
        <div className="container-wide relative z-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-white pt-16 mb-8">
            Featured Coaches
          </h2>
          
          <Link to="/coaching" className="block">
            <img
              src={featuredCoachesPlaceholder}
              alt="Featured Coaches"
              className="w-full max-w-5xl mx-auto object-contain"
            />
          </Link>
          
          <div className="text-center pb-12">
            <Link
              to="/coaching"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              View All Coaches
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 md:py-24 bg-black overflow-hidden min-h-[500px] md:min-h-[600px]">
      {/* Blurred background - uses first coach's image or a generic one */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 blur-md scale-110"
        style={{
          backgroundImage: featuredCoaches[0]?.avatar_url
            ? `url(${featuredCoaches[0].avatar_url})`
            : "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" />

      <div className="container-wide relative z-10">
        <motion.h2
          className="text-3xl md:text-4xl font-display font-bold text-center text-white mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={titleVariants}
        >
          Featured Coaches
        </motion.h2>

        <motion.div
          className="flex justify-center items-end gap-0 sm:gap-2 md:gap-4 px-4 -mx-4 overflow-visible"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {featuredCoaches.map((coach, index) => {
            const isCenter = index === Math.floor(featuredCoaches.length / 2);
            const isEdge = index === 0 || index === featuredCoaches.length - 1;
            
            return (
              <motion.div key={coach.id} variants={itemVariants}>
                <TiltCard maxTilt={12} scale={1.05}>
                  <Link
                    to={`/coaching/${coach.id}`}
                    className={cn(
                      "group relative block transition-all duration-500",
                      isCenter 
                        ? "w-48 h-72 sm:w-56 sm:h-80 md:w-72 md:h-[420px] lg:w-80 lg:h-[480px] z-20" 
                        : isEdge
                        ? "w-36 h-56 sm:w-44 sm:h-64 md:w-56 md:h-80 lg:w-64 lg:h-96 z-10"
                        : "w-40 h-60 sm:w-48 sm:h-72 md:w-60 md:h-96 lg:w-72 lg:h-[420px] z-10"
                    )}
                  >
                    {/* Coach Cutout or Avatar */}
                    {coach.cutout_url ? (
                      <img
                        src={coach.cutout_url}
                        alt={coach.display_name || "Coach"}
                        className={cn(
                          "w-full h-full object-contain object-bottom transition-all duration-500 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]",
                          !isCenter && "grayscale group-hover:grayscale-0"
                        )}
                      />
                    ) : coach.avatar_url ? (
                      <div className="absolute inset-0 rounded-t-full overflow-hidden">
                        <img
                          src={coach.avatar_url}
                          alt={coach.display_name || "Coach"}
                          className={cn(
                            "w-full h-full object-cover object-top transition-all duration-500",
                            !isCenter && "grayscale group-hover:grayscale-0"
                          )}
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 rounded-t-full overflow-hidden bg-gradient-to-b from-muted/40 to-muted/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white/50">
                          {coach.display_name?.charAt(0) || "C"}
                        </span>
                      </div>
                    )}

                    {/* Name tooltip on hover */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:bottom-4 transition-all duration-300 whitespace-nowrap">
                      <span className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-full shadow-lg">
                        {coach.display_name || "Coach"}
                      </span>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View all link */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Link
            to="/coaching"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            View All Coaches
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
