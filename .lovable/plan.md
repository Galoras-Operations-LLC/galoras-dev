

# Phase A+B Signoff -- Revised Implementation Plan

## Confirmed Current State (from code inspection)

- `onboarding_links` table exists, 0 rows
- 6 applications, all `onboarding_short_id = NULL`:
  - Barnes Lam: approved, no token, onboarding_status = NULL
  - Mitesh Kapadia: approved, has token, onboarding_status = needs_changes
  - Nick Frost: approved, has token, onboarding_status = pending
  - Cindy Chu: approved, has token, onboarding_status = pending
  - Melody Chi: approved, has token, onboarding_status = completed
  - Conor McGowan Smyth: pending, no token
- Admin auth: `user_roles` table + `has_role(user_id, 'admin')` DB function
- `/coach/onboarding` (App.tsx line 41) renders `CoachOnboarding` directly -- no redirect
- `getOnboardingUrl` (Applicants.tsx line 221-222) falls back to raw token URL
- `resolve-onboarding-link` has `verify_jwt = false` (correct for public use)
- `complete-onboarding` already marks `used_at` on `onboarding_links` (lines 87-90)
- `OnboardRedirect.tsx` already exists and works correctly
- "All" tab buttons (line 435) use `app.onboarding_short_id || app.onboarding_token` and only check `onboarding_status === "pending"` (misses `needs_changes`)

---

## Fix 1 -- Edge Function: `create-onboarding-link`

**New file:** `supabase/functions/create-onboarding-link/index.ts`

**Config:** `supabase/config.toml` -- add `[functions.create-onboarding-link]` with `verify_jwt = true`

**Function logic:**

1. CORS preflight handling
2. Extract JWT from `Authorization: Bearer <token>` header
3. Create service-role Supabase client using `SUPABASE_SERVICE_ROLE_KEY`
4. `supabase.auth.getUser(token)` to get `user.id`
5. Admin check: `SELECT has_role(user.id, 'admin')` via RPC -- if false, return 403
6. Input: `{ applicationId }` from request body
7. Fetch current application: `SELECT status, onboarding_status FROM coach_applications WHERE id = applicationId`
8. **Status guard:** If `onboarding_status = 'completed'`, return 400 "Cannot regenerate after onboarding completion"
9. Allowed states: `onboarding_status IS NULL` or `IN ('pending', 'needs_changes')`
10. Generate server-side:
    - `token`: two UUIDs concatenated, dashes stripped (64 hex chars)
    - `shortId`: 12-char base62 via `crypto.getRandomValues` + base62 alphabet
11. **Revoke old links** (Fix 5 built-in):
    ```sql
    UPDATE onboarding_links SET expires_at = now()
    WHERE application_id = applicationId AND expires_at > now()
    ```
12. **Update `coach_applications`** (preserves `needs_changes`):
    ```sql
    SET status = 'approved',
        onboarding_token = token,
        onboarding_short_id = shortId,
        onboarding_status = COALESCE(onboarding_status, 'pending'),
        reviewed_at = now()
    WHERE id = applicationId
    ```
13. **Insert into `onboarding_links`:**
    ```sql
    INSERT (short_id, application_id, onboarding_token)
    -- expires_at defaults to now() + 30 days
    ```
14. If any step fails: return error with details (no silent success)
15. Return `{ shortId, applicationId }` on success

---

## Fix 2 -- Remove Raw Token Fallback (Applicants.tsx)

### `getOnboardingUrl` (replace lines 217-223)

```typescript
const getOnboardingUrl = (app: CoachApplication) => {
  if (app.onboarding_short_id) {
    return `${window.location.origin}/onboard/${app.onboarding_short_id}`;
  }
  return null; // No raw token fallback
};
```

### `openOnboardingLink` (replace lines 225-228)

Add null check -- if URL is null, show destructive toast "Masked link not generated -- use Regenerate Link."

### `copyOnboardingLink` (replace lines 230-236)

Same null check with error toast.

### `approveApplication` (replace lines 106-148)

Remove `generateToken`, `generateShortId` helpers (lines 97-104). Replace entire function body with:
- Call `supabase.functions.invoke("create-onboarding-link", { body: { applicationId: id } })`
- On success: toast + `fetchApplications()`
- On error: destructive toast, no local state mutation

### Add `regenerateLink` function

Same edge function call, different success toast: "New masked link created. Old links expired."

### Fix 2B -- "All" tab buttons (replace lines 435-444)

**Open/Copy buttons shown when:**
- `status === 'approved'`
- `onboarding_short_id` exists (not null)
- `onboarding_status` is `'pending'` OR `'needs_changes'`

**Regenerate Link button shown when:**
- `status === 'approved'`
- `onboarding_short_id` is NULL
- `onboarding_status` is NULL, `'pending'`, or `'needs_changes'`

**Never show onboarding buttons for `completed`.**

---

## Fix 3 -- Backfill Migration

**New SQL migration** (PL/pgSQL DO block)

**Scope:** `status = 'approved' AND onboarding_short_id IS NULL AND (onboarding_status IS NULL OR onboarding_status IN ('pending', 'needs_changes'))`

This covers: Barnes Lam, Mitesh Kapadia, Nick Frost, Cindy Chu. **Excludes** Melody Chi (completed).

**For each row:**
1. If `onboarding_token IS NULL` (Barnes Lam): generate token from two concatenated UUIDs (dashes stripped)
2. Generate `short_id` from `substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)`
3. Retry loop (max 5 attempts) on unique violation
4. Update `coach_applications`: set `onboarding_short_id`, `onboarding_token` (if was null), `onboarding_status = COALESCE(onboarding_status, 'pending')`
5. Insert into `onboarding_links` with `expires_at = now() + interval '30 days'`

---

## Fix 4 -- Hard Redirect `/coach/onboarding`

**Replace App.tsx line 41:**

```typescript
// Old:
<Route path="/coach/onboarding" element={<CoachOnboarding />} />

// New: query-preserving redirect wrapper
function CoachOnboardingRedirect() {
  const location = useLocation();
  return <Navigate to={`/coaching/onboarding${location.search}`} replace />;
}
// ...
<Route path="/coach/onboarding" element={<CoachOnboardingRedirect />} />
```

Add `Navigate, useLocation` to react-router-dom imports.

---

## Fix 5 -- Regenerate Revokes Old Links

Already built into Fix 1's edge function. Before inserting new link:
```sql
UPDATE onboarding_links SET expires_at = now()
WHERE application_id = ? AND expires_at > now()
```

---

## Files Changed Summary

| File | Action | Description |
|---|---|---|
| `supabase/functions/create-onboarding-link/index.ts` | Create | Admin-only edge function for deterministic link creation |
| `supabase/config.toml` | Edit | Add `[functions.create-onboarding-link]` with `verify_jwt = true` |
| `src/pages/admin/Applicants.tsx` | Edit | Remove raw fallback, approve/regenerate via edge function, button conditions include `needs_changes` |
| `src/App.tsx` | Edit | Replace `/coach/onboarding` with query-preserving redirect |
| SQL migration | Create | Backfill short IDs + onboarding_links for approved apps (excluding completed) |

## Files NOT Changed

- `resolve-onboarding-link/index.ts` -- already correct
- `complete-onboarding/index.ts` -- already marks `used_at`
- `OnboardRedirect.tsx` -- already correct

