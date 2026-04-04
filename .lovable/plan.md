

## Fix All Build Errors

### Problem
Two categories of build errors:
1. **7 missing page/component files** imported in `App.tsx` and elsewhere
2. **FeaturedCoaches.tsx type errors** — `types.ts` (auto-generated, cannot edit) doesn't include `is_featured`, `featured_rank`, etc. for the `coaches` table, even though the actual DB has them

### Plan

#### 1. Create missing page stubs (7 files)

Each file follows the existing pattern: default export, wrapped in `<Layout>`, minimal placeholder content.

| File | Content |
|---|---|
| `src/pages/Pricing.tsx` | Pricing page placeholder with heading |
| `src/pages/BookingSuccess.tsx` | "Booking confirmed" success page |
| `src/pages/SubscriptionSuccess.tsx` | "Subscription active" success page |
| `src/pages/admin/Coaches.tsx` | Re-export of existing admin coaches functionality (or placeholder) |
| `src/pages/admin/CoachesList.tsx` | Admin coaches list with query to `coaches` table |
| `src/pages/admin/CoachEditorDetail.tsx` | Admin coach detail/edit page with `useParams` for `:id` |
| `src/pages/admin/Bookings.tsx` | Admin bookings list querying `bookings` table |

#### 2. Create missing component/hook stubs (3 files)

| File | Content |
|---|---|
| `src/components/coaching/CheckoutModal.tsx` | Empty modal component export |
| `src/components/subscription/SubscriptionPlans.tsx` | Placeholder plans component |
| `src/hooks/useStripePayment.ts` | Hook stub returning loading/error states |

#### 3. Fix FeaturedCoaches.tsx type errors

The `coaches` table in `types.ts` is missing `is_featured`, `featured_rank`, `featured_at`, `location`, `hourly_rate`, `rating`, etc. Since `types.ts` is auto-generated and cannot be edited, the fix is to:

- Cast the Supabase query with `as any` on the `.eq("is_featured", true)` call
- Cast the returned data to the local `FeaturedCoach` type
- This is a safe workaround since the actual DB columns exist

### Files changed
- 10 new files (7 pages, 2 components, 1 hook)
- 1 modified file (`FeaturedCoaches.tsx` — type cast fix)

