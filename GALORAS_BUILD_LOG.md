# Galoras Dev — Build Log

**Project:** Galoras Coaching Marketplace  
**Stack:** React + TypeScript + Vite · Supabase (Postgres + Edge Functions) · Stripe · Resend  
**Deployed:** https://uat-galoras.site (Netlify)  
**Supabase project:** `qbjuomsmnrclsjhdsjcz`

---

## Phase 1 — Foundation

### Auth & Onboarding
- Full auth flow: OTP email verification → 3-step signup → onboarding
- Coach signup: `/coach-signup` → OTP → password → `/pricing`
- Magic link email template (`supabase/templates/magic_link.html`)
- `profiles` table with subscription fields

### Coach Registration (Stripe SetupIntent)
- `/pricing` page: Pro $49 / Elite $99 / Master $197 tiers
- `setup-coach-tier` edge function: creates Stripe SetupIntent (authorize only, no charge)
- `confirm-coach-registration` edge function: saves payment method
- `coach_registrations` table: stores bio, specialties, linkedin_url, tier selection
- `CoachTierPayment` modal: dark Stripe Elements, session-aware
- `/complete-registration?token=xxx` page

### Homepage & Marketing
- "Stop Navigating It Alone" B2C hero copy
- Performance Ecosystem section (HowItWorks): 4 pillars, hover-reveal
- Leadership Labs page: 6 labs with Sample ribbon + Coach Barnes attribution
- IdlePopup: 3s inactivity prompt for guests (once per session)

---

## Phase 2 — Validation Sprint

### SOW #1 — Structured Data Layer (~85%)

**Schema (`coaches` table):**
- Core fields: `slug`, `lifecycle_status`, `tier`, `audience`, `proof_points`, `avatar_url`, `headline`, `positioning_statement`, `methodology`, `booking_url`, `specialties`
- Audit timestamps: `submitted_at`, `reviewed_at`, `published_at`, `suspended_at`
- Reviewer fields: `reviewer_id`, `reviewer_notes`, `structured_updated_at`
- `profile_complete` (boolean), `engagement_format`

**Coaches seeded:**
- Barnes Lam (`/coach/barnes-lam`) — Master tier, published
- Conor McGowan Smyth — Master tier, published
- Mitesh Kapadia — Master tier, published

**Outstanding:** Full data migration beyond 3 coaches; data dictionary doc

---

### SOW #2 — Product Layer (~40%)

**Schema (`coach_products` table):**
- Fields: `product_type` (diagnostic/block/program/enterprise), `title`, `summary`, `what_you_get`, `who_its_for`, `duration_label`, `format`, `pricing_band`, `price_display`, `price_cents`, `cta_label`, `cta_url`, `sort_order`, `is_active`

**Components:**
- `ProductCard.tsx` — renders product with CTA
- `CheckoutModal.tsx` — Stripe Elements embedded checkout

**Edge Functions:**
- `create-payment-intent` — productId + coachId + amountCents → clientSecret

**CoachProfile.tsx** (`/coach/:slug`):
- Fetches `coach_products` where `is_active=true`
- Fixed-price products → Stripe checkout via CheckoutModal
- Enquiry products → ProductCard handles CTA natively

**Mitesh products seeded** (4 products across diagnostic/block/program types)

**Outstanding:** Admin product management UI; products for Conor + Barnes

---

### SOW #3 — Workflow & Admin (~80%)

**Admin pages** (dark navy theme, `AdminLayout`):
- `/admin/applicants` — Coach Approval Dashboard
- `/admin/coaches` — Coach Roster
- `/admin/coaches/:id` — Coach Editor Detail
- `/admin/bookings` — Payment Log + Sessions tabs

**Applicants page:**
- 3-column layout: applicant list · radar chart + decision panel · portfolio density
- AI fit scoring via `analyze-coach-application` edge function (6 dimensions)
- Radar chart (Recharts) displaying fit score dimensions
- Decision panel: Approve / Request Revision / Reject
- Pipeline counts by status
- Portfolio density bar chart with saturation/gap alerts
- `saveDraft` stamps `reviewed_at` + sets `lifecycle_status=under_review` on coaches

**Coach Roster (`CoachesList.tsx`):**
- Filter buttons with per-state counts
- Lifecycle badges for all 7 states
- Inline tier dropdown (editable directly in table)
- Context-aware quick action buttons

**Coach Editor Detail (`CoachEditorDetail.tsx`):**
- Admin dark theme
- All 7 lifecycle states in dropdown
- Reviewer Notes field (amber-highlighted, internal only)
- Timestamp row: submitted / reviewed / published / suspended
- Auto-stamps timestamps on lifecycle transitions

**7-State Lifecycle:**
`draft → submitted → under_review → revision_required → approved → published → rejected`

**Outstanding:** Audit log table for status transitions

---

### SOW #4 — Public Layer (~70%)

**Coaching Exchange** (`/coaching`):
- Directory with filters (pillar, tier, audience)
- Coach cards with avatar, headline, proof points
- AuthGate on book/message CTAs
- Compare toggle (max 3): floating tray → `/coaching/compare?ids=...`

**Coach Comparison** (`/coaching/compare`):
- Dark navy theme
- `compare-coach-fit` edge function: calls Claude to generate per-coach fit analysis
- "How Each Coach Addresses Your Needs" banner with match score bar
- Side-by-side columns: photo, identity, methodology, CTAs
- Galoras Compass panel

**Coach Profile** (`/coach/:slug`):
- Avatar, headline, positioning statement, methodology, proof points
- Sessions & Engagements section (ProductCard grid)
- Book a Call + Message CTAs (AuthGate)

**ContactModal:**
- Sends to `messages` table
- `send-message-notification` edge function

**Outstanding:** B2B problem→diagnostic→engagement flow; messaging inbox UI

---

### SOW #5 — Agent-Ready Infrastructure (~50%)

**Schema additions to `coaches` table:**
- `readiness_score` (numeric 0–100)
- `missing_fields` (jsonb array)
- `risk_flags` (jsonb array)
- `agent_recommendation` (text)
- `agent_last_run` (timestamptz)

**Edge Functions:**
- `analyze-coach-application` — fires on submission, scores 6 dimensions via Claude

**Outstanding:** Trigger hooks on update + admin review; snapshot function

---

### SOW #6 — Payment & Commercial Loop (~85%)

**Schema (`bookings` table):**
- `coach_id`, `product_id`, `client_id`, `status`, `amount_cents`, `currency`
- `stripe_payment_intent_id`

**Edge Functions:**
- `create-payment-intent` — creates booking record + Stripe PaymentIntent
- `send-booking-notification` — emails coach + client on confirmation

**Stripe Webhook** (`stripe-webhook` edge function):
- `payment_intent.succeeded` → confirms booking, sends notification emails
- `payment_intent.payment_failed` → marks booking `payment_failed`
- `charge.refunded` → marks booking `refunded`

**Admin Payment Log:**
- Stats row: Revenue, Confirmed, Pending, Failed, Refunded
- Table: Client, Coach, Product, Amount, Status badge, Stripe PI link, Date

**BLOCKED:**
- `VITE_STRIPE_PUBLISHABLE_KEY` not set in Netlify env vars
- `STRIPE_WEBHOOK_SECRET` needs Stripe dashboard registration
- `galoras.com` not verified in Resend (sending from `onboarding@resend.dev`)

---

## Legal & Compliance

- `agreements` table: user_id, type, version, accepted_at, ip_address
- 5 legal pages: Terms of Service, Privacy Policy, Cookie Policy, Coaching Agreement, Data Processing Agreement
- Consent checkboxes on signup wired to `agreements` table
- Cookie banner component

---

## Infrastructure

### Edge Functions Deployed
| Function | Auth | Purpose |
|---|---|---|
| `create-payment-intent` | JWT required | Stripe checkout |
| `stripe-webhook` | No JWT | Stripe webhook handler |
| `send-booking-notification` | No JWT | Email on booking |
| `analyze-coach-application` | No JWT | AI fit scoring |
| `compare-coach-fit` | No JWT | AI coach comparison |
| `publish-coach` | No JWT | Publish lifecycle transition |
| `approve-coach` | JWT required | Approve + Stripe charge |
| `setup-coach-tier` | JWT required | SetupIntent for coach reg |
| `confirm-coach-registration` | No JWT | Save payment method |
| `send-message-notification` | No JWT | ContactModal email |
| `resolve-onboarding-link` | No JWT | Token-based onboarding |
| `create-onboarding-link` | No JWT | Generate onboarding token |
| `toggle-featured-coach` | No JWT | Homepage featured toggle |

### Build
- Vite 5 + React 18 + TypeScript
- Minifier: esbuild (switched from terser — terser is optional in Vite v3+)
- `netlify.toml`: SPA redirect, security headers, asset caching

### Key Dates
- **2026-04-14 to 2026-04-17:** Conor UAT + production deploy + first real transaction

---

## Outstanding Blockers
1. **Stripe publishable key** → set `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` in Netlify env vars
2. **Stripe webhook secret** → register endpoint in Stripe dashboard → paste `STRIPE_WEBHOOK_SECRET`
3. **Resend domain** → verify `galoras.com` DNS records in Resend dashboard

## Next Priority Items
1. SOW #2: Admin product management UI (create/edit/activate products per coach)
2. SOW #5: Trigger hooks on lifecycle change + snapshot function
3. SOW #3: Audit log table
4. SOW #4: Messaging inbox UI
5. SOW #6: End-to-end Stripe test once key arrives
