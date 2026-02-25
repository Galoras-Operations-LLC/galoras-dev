

## Add Booking Link and Click Event Logging

### Overview

Add a `booking_url` field to both `coach_applications` and `coaches` tables, capture it in intake/onboarding/edit forms, render a "Book a Session" CTA on coach profiles that opens the URL in a new tab, and log each click to a new `booking_click_events` table.

---

### 1. Database Migration

**New columns:**
- `coach_applications.booking_url` (TEXT, nullable)
- `coaches.booking_url` (TEXT, nullable)

**New table: `booking_click_events`**

| Column | Type | Default |
|--------|------|---------|
| id | UUID | gen_random_uuid() |
| coach_id | UUID | required |
| user_id | UUID | nullable |
| session_id | TEXT | nullable |
| created_at | TIMESTAMPTZ | now() |

RLS: Allow anyone to INSERT (public click logging). SELECT restricted to admins only.

---

### 2. Form Updates

**`src/pages/Apply.tsx`**
- Add `booking_url` to form state (default empty string)
- Add input field labeled "Booking Link (e.g., Calendly)" with `type="url"` and `placeholder="https://calendly.com/yourname"`
- Basic validation: if provided, must start with `https://`
- Include in insert payload

**`src/pages/coaching/CoachOnboarding.tsx`**
- Add `bookingUrl` state variable
- Add same input field
- Include in complete-onboarding edge function payload

**`src/pages/coaching/CoachProfileEdit.tsx`**
- Add booking URL input to the Profile Information card
- Allow coach to update their `booking_url` on the `coaches` table

---

### 3. Edge Function Update

**`supabase/functions/complete-onboarding/index.ts`**
- Accept `bookingUrl` from request body
- Persist as `booking_url` on `coach_applications`

---

### 4. Coach Profile UI Update

**`src/pages/coaching/CoachProfile.tsx`**
- In the sidebar booking card: if `(coach as any).booking_url` exists, replace the existing "Book a Session" button with one that:
  - Logs a click event to `booking_click_events` (fire-and-forget, no await)
  - Opens `booking_url` in a new tab via `window.open(url, '_blank', 'noopener,noreferrer')`
- If `booking_url` is null/empty, keep the existing BookSessionModal button as fallback
- Add tooltip: "Schedule directly with this coach"

---

### 5. Admin Visibility

**`src/components/admin/ApplicationDetailDialog.tsx`**
- Display `booking_url` in the application detail view (read-only link)

---

### Files Changed

| File | Change |
|------|--------|
| New migration SQL | Add `booking_url` to both tables + create `booking_click_events` with RLS |
| `src/pages/Apply.tsx` | Add booking URL input + include in payload |
| `src/pages/coaching/CoachOnboarding.tsx` | Add booking URL input + include in payload |
| `src/pages/coaching/CoachProfileEdit.tsx` | Add booking URL edit field |
| `supabase/functions/complete-onboarding/index.ts` | Accept + persist `bookingUrl` |
| `src/pages/coaching/CoachProfile.tsx` | Conditional "Book a Session" button with click logging |
| `src/components/admin/ApplicationDetailDialog.tsx` | Display booking URL |

