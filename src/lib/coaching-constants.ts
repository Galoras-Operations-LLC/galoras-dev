// Coach Background options
export const COACH_BACKGROUND_OPTIONS = [
  "Certified Professional Coach",
  "Executive / Business Leader (Operator-Coach)",
  "Athlete / Elite Performer",
  "Emerging Coach (Interested in Galoras Certification Track)",
  "Other Relevant Professional Background",
] as const;

// Conditional labels based on coach background
export const BACKGROUND_DETAIL_CONFIG: Record<string, { field: "detail" | "certification" | null; label: string }> = {
  "Certified Professional Coach": { field: "detail", label: "List Certifications" },
  "Executive / Business Leader (Operator-Coach)": { field: "detail", label: "Most Recent Senior Role" },
  "Athlete / Elite Performer": { field: "detail", label: "Highest Level Competed" },
  "Emerging Coach (Interested in Galoras Certification Track)": { field: "certification", label: "Interest in Galoras Certification Track" },
  "Other Relevant Professional Background": { field: null, label: "" },
};

export const CERTIFICATION_INTEREST_OPTIONS = ["Yes", "No", "Maybe"] as const;

// Years of Coaching Experience
export const COACHING_EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
] as const;

// Years of Leadership / Professional Experience
export const LEADERSHIP_EXPERIENCE_OPTIONS = [
  "0-3 years",
  "3-7 years",
  "7-15 years",
  "15+ years",
] as const;

// Coaching Experience Level
export const COACHING_LEVEL_OPTIONS = [
  "Emerging Coach",
  "Experienced Coach",
  "Executive / Operator Coach",
  "Athlete / Performance Coach",
] as const;

// Primary Reason for Joining
export const JOIN_REASON_OPTIONS = [
  "Build a coaching practice and acquire clients",
  "Transition into coaching from executive or athletic career",
  "Expand my existing coaching business",
  "Join a high-performance coaching network",
  "Develop my coaching skills and certification",
  "Explore coaching as a future career",
] as const;

// Commitment Level
export const COMMITMENT_LEVEL_OPTIONS = [
  "Exploring casually",
  "Serious about coaching part-time",
  "Building part-time coaching practice",
  "Building full-time coaching practice",
  "Already coaching professionally",
] as const;

// Start Timeline
export const START_TIMELINE_OPTIONS = [
  "Immediately",
  "Within 1-3 months",
  "Within 3-6 months",
  "Just exploring",
] as const;

// Galoras Pillar Taxonomy
export const PILLAR_SPECIALTIES = {
  Leadership: [
    "Executive Leadership",
    "Founder & Entrepreneur Coaching",
    "Team Leadership & Scaling Teams",
  ],
  Performance: [
    "Peak Performance & Execution",
    "Executive Performance",
    "Athlete Performance & Discipline",
    "Productivity & Focus",
  ],
  Transition: [
    "Career Transitions",
    "Executive Transition",
    "Athlete Career Transition",
    "Founder Transition",
  ],
  "Mindset & Alignment": [
    "Mindset & Resilience",
    "Confidence & Self-Belief",
    "Purpose & Direction",
    "Stress & Burnout Management",
  ],
  "Galoras Signature": [
    "Sport of Business Coaching™",
  ],
} as const;

// Flat list of all pillar specialties
export const ALL_PILLAR_SPECIALTIES = Object.values(PILLAR_SPECIALTIES).flat();

// Get pillar name for a specialty
export function getPillarForSpecialty(specialty: string): string | undefined {
  for (const [pillar, specs] of Object.entries(PILLAR_SPECIALTIES)) {
    if ((specs as readonly string[]).includes(specialty)) return pillar;
  }
  return undefined;
}
