

## Fix "Featured Missing" — Use `user_id` as Reliable Lookup Key

### Root Cause
The featured checkbox matches `coach_applications.full_name` against `coaches.display_name`. If these differ (spacing, capitalization), the checkbox never appears — it shows a perpetual spinner instead.

### Solution
Use `user_id` as the lookup key. The `publish-coach` function sets `user_id` on both `coach_applications` and `coaches`, making it a guaranteed stable match for all published coaches.

### File: `src/pages/admin/Applicants.tsx`

**1. Change `featuredMap` key from name to user_id**

Update the comment and keep the same state type — the key just becomes `user_id` instead of `full_name`.

**2. Update `fetchApplications` to collect `user_id`s instead of names**

Replace:
```typescript
const publishedNames = (data || [])
  .filter((a) => a.onboarding_status === "published")
  .map((a) => a.full_name);
if (publishedNames.length > 0) {
  fetchFeaturedStatus(publishedNames);
}
```
With collection of `user_id`s from published apps (filtering out nulls), then call `fetchFeaturedStatus` with those IDs.

**3. Rewrite `fetchFeaturedStatus` to query by `user_id`**

Query `coaches` table with `.in("user_id", userIds)` and `.select("id, user_id, is_featured")`. Build the map keyed by `user_id`.

**4. Update `renderFeaturedCheckbox` lookup**

Change `featuredMap[app.full_name]` to `featuredMap[app.user_id]` (with a null guard — if `user_id` is null, show nothing).

**5. Update `toggleFeatured` lookup and state update**

Change `featuredMap[app.full_name]` to `featuredMap[app.user_id]`, and update `setFeaturedMap` to use `app.user_id` as the key.

### Why `user_id` over email
- `coaches` table has no `email` column — no schema change needed
- `user_id` is set by the publish function on both tables, guaranteed to match
- It's a UUID, so no case/spacing issues

### No other changes needed
- No schema migrations
- No edge function changes
- No publish flow changes
