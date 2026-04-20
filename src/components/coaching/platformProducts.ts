import type { CoachProduct } from "./ProductCard";

/** Standard offerings available on every qualified coach's profile. */
export const GALORAS_PLATFORM_PRODUCTS: CoachProduct[] = [
  {
    id: "galoras-discovery",
    product_type: "single_session",
    title: "Discovery Session",
    outcome_statement:
      "A focused 1-on-1 session to assess where you are, clarify what's holding you back, and map the fastest path to your next performance breakthrough. You'll walk away with a clear picture of your leadership gaps and a concrete action plan -- no fluff, just signal.",
    target_audience: ["Leaders ready to stop guessing and start executing with clarity"],
    delivery_format: "online",
    session_count: 1,
    duration_minutes: 60,
    duration_weeks: null,
    price_type: "fixed",
    price_amount: 50000,
    price_range_min: null,
    price_range_max: null,
    enterprise_ready: false,
    booking_mode: "enquiry",
    visibility_scope: "public",
    is_active: true,
    sort_order: 0,
  },
  {
    id: "galoras-workshop",
    product_type: "workshop_event",
    title: "Strategic Initiative Workshop",
    outcome_statement:
      "A high-intensity 90-minute working session designed to pressure-test your biggest strategic initiative. Bring your real challenge -- leave with a validated plan, sharper priorities, and the blind spots you didn't know you had. Built for leaders who move fast and need thinking partners, not theory.",
    target_audience: ["Executives and founders navigating high-stakes decisions"],
    delivery_format: "online",
    session_count: 1,
    duration_minutes: 90,
    duration_weeks: null,
    price_type: "fixed",
    price_amount: 150000,
    price_range_min: null,
    price_range_max: null,
    enterprise_ready: false,
    booking_mode: "enquiry",
    visibility_scope: "public",
    is_active: true,
    sort_order: 1,
  },
];
