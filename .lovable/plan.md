

## Remove BookSessionModal Fallback, Show "Booking link coming soon"

### What's Already Done
- `coaches.booking_url` column exists in database
- `booking_click_events` table exists with RLS
- Booking URL input fields exist in Apply, Onboarding, and Profile Edit forms
- Coach profile already renders "Book a Session" with external redirect when `booking_url` is present
- Click logging already works (fire-and-forget insert)

### What Needs to Change

**Single file: `src/pages/coaching/CoachProfile.tsx`**

1. Remove `BookSessionModal` import and its state (`isBookingModalOpen`, `setIsBookingModalOpen`)
2. Remove the `<BookSessionModal>` component at the bottom of the file
3. Replace the fallback `else` branch (lines 381-389) -- currently opens the modal -- with a small muted text: "Booking link coming soon"
4. Remove `booking_url` casting: since `booking_url` is now in the Supabase types for `coaches`, use `coach.booking_url` directly instead of `(coach as any).booking_url`

The "Send Message" button and `MessageCoachModal` remain unchanged.

### Technical Details

The sidebar booking section will become:

```text
if coach.booking_url exists:
  [Book a Session] button -> opens URL in new tab + logs click
else:
  small muted text: "Booking link coming soon"

[Send Message] button (always shown)
```

No database changes needed. No new files.

