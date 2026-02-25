## Remove BookSessionModal Fallback, Show "Booking link coming soon"

### What's Already Done
- coaches.booking_url column exists in database
- booking_click_events table exists with RLS
- Booking URL input fields exist in Apply, Onboarding, and Profile Edit forms
- Coach profile already renders "Book a Session" with external redirect when booking_url is present
- Click logging already works (fire-and-forget insert)

### What Was Changed

**Files modified: `src/pages/coaching/CoachProfile.tsx`**

1. Removed BookSessionModal import and its state (isBookingModalOpen, setIsBookingModalOpen)
2. Removed the <BookSessionModal> component at the bottom of the file
3. Replaced the fallback branch where booking currently opens the modal (not strictly by line number) with small muted text: "Booking link coming soon"
4. Removed booking_url casting: since booking_url is now in the types for coaches, use coach.booking_url directly instead of (coach as any).booking_url
5. Ensured there are no unused imports after removal

**File deleted: `src/components/coaching/BookSessionModal.tsx`**
- Orphaned component, no longer imported anywhere

### Technical Behavior

if coach.booking_url exists:
  [Book a Session] button -> opens URL in new tab + logs click
else:
  small muted text "Booking link coming soon"

[Send Message] button always shown

No database changes needed.
