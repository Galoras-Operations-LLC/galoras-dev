

## Fix publish-coach to Copy booking_url and Use Stable Lookup

### Problem
The `publish-coach` edge function never copies `booking_url` from `coach_applications` to `coaches`, so published coach profiles always show "Booking link coming soon." Additionally, the idempotency check uses `display_name` matching, which is fragile.

### File: `supabase/functions/publish-coach/index.ts`

**1. Add `normalizeUrl` helper** (after `corsHeaders`, around line 8)

```typescript
const normalizeUrl = (url: string | null | undefined) => {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};
```

**2. Move idempotency check after `coachUserId` is resolved, use `user_id`**

Currently the "existing coach" lookup (lines 99-123) happens before `coachUserId` is determined. Restructure so:
- First resolve `coachUserId` (lines 125-165 stay mostly the same, just moved earlier)
- Then do the idempotency check using `user_id`:
```typescript
const { data: existingCoach } = await adminClient
  .from("coaches")
  .select("id")
  .eq("user_id", coachUserId)
  .maybeSingle();
```

**3. If coach already exists, update fields including `booking_url`**

Replace the current "already published" block with an update before returning:
```typescript
if (existingCoach) {
  await adminClient
    .from("coaches")
    .update({
      booking_url: normalizeUrl(app.booking_url),
      linkedin_url: app.linkedin_url,
      website_url: app.website_url,
      avatar_url: app.avatar_url,
      bio: app.bio,
    })
    .eq("id", existingCoach.id);

  // Update application status
  await adminClient
    .from("coach_applications")
    .update({ onboarding_status: "published", ... })
    .eq("id", applicationId);

  return Response with { success: true, coachId: existingCoach.id, alreadyExisted: true };
}
```

**4. Add `booking_url` to the new coach insert**

Add `booking_url: normalizeUrl(app.booking_url),` to the `.insert()` payload (line 170-186).

### Summary of changes
- 1 file modified: `supabase/functions/publish-coach/index.ts`
- No schema changes needed (`coaches.booking_url` column already exists)
- Fixes both new publishes and re-publishes of existing coaches
- Uses `user_id` for stable idempotency instead of `display_name`
