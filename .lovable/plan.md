

# Admin -- Coach Approval Console + publish-coach

## Overview

Replace the current flat Applicants page with a two-queue tabbed console, and create a new `publish-coach` edge function that idempotently creates an auth user + coaches record to make the coach visible in the public directory.

## Database Migration

Add a nullable `user_id` column to `coach_applications`:

```sql
ALTER TABLE coach_applications ADD COLUMN IF NOT EXISTS user_id uuid;
```

No enum changes needed -- `onboarding_status` is free-text and already supports the values we need.

## Status Values (Final Reference)

| Field | Value | Meaning |
|-------|-------|---------|
| status | pending | Queue A -- new application |
| status | approved | Application approved, onboarding active |
| status | rejected | Application rejected |
| onboarding_status | NULL | Not approved (or rejected) |
| onboarding_status | pending | Weblink generated, awaiting profile |
| onboarding_status | completed | Queue B -- profile submitted, awaiting final review |
| onboarding_status | published | Coach live in directory |
| onboarding_status | needs_changes | Admin requested profile changes |

## New Edge Function: publish-coach

Creates `supabase/functions/publish-coach/index.ts`. Called by admin from Queue B.

Idempotent logic:
1. Validate caller is admin (check JWT user_id against user_roles)
2. Fetch coach_applications record by applicationId; verify status=approved AND onboarding_status=completed
3. Check if coaches row already exists for this email -- if so, return success (no duplicate)
4. Look up existing auth user by email via `auth.admin.listUsers({ filter })` -- reuse if exists, otherwise create with `auth.admin.createUser({ email, email_confirm: true })`
5. Store user_id on coach_applications record
6. Insert into coaches table (user_id, display_name, bio, specialties, avatar_url, linkedin_url, website_url, status=approved)
7. Insert into profiles table for the new user
8. Assign 'user' role in user_roles (if not exists)
9. Update coach_applications: onboarding_status=published, reviewed_at=now(), reviewer_notes (if provided)
10. Return { success: true, coachId }

Add to config.toml: `[functions.publish-coach] verify_jwt = false` (auth validated in code).

## Admin Console UI Rewrite

Major rewrite of `src/pages/admin/Applicants.tsx`:

- **Page title**: "Admin -- Coach Approval Console"
- **Tabbed layout** using Radix Tabs (3 tabs):

### Tab: Applications (Queue A)
- Filter: status = 'pending'
- Columns: Name, Email, Submitted Date, Status, Actions
- Actions: "View Application" (detail dialog), "Approve" (generates token, sets onboarding_status=pending, records reviewed_at), "Reject" (prompts for optional reviewer_notes, records reviewed_at)
- Sorted newest first

### Tab: Profiles (Queue B)
- Filter: status = 'approved' AND onboarding_status = 'completed'
- Columns: Name, Email, Completed Date, Status, Actions
- Actions: "View Profile" (detail dialog), "Publish to Directory" (calls publish-coach), "Request Changes" (prompts for notes, sets onboarding_status=needs_changes, records reviewed_at + reviewer_notes)

### Tab: All
- All records with status badges for reference
- Includes "Copy Link" button for approved+pending records

### Detail Dialogs
- View Application: shows bio, experience_years, certifications, specialties, why_galoras, phone, website_url, linkedin_url, avatar_url, timestamps
- View Profile: shows completed profile data (bio, specialties/coaching focus, LinkedIn, avatar), timestamps, status

### Reject / Request Changes Dialog
- Small dialog with optional textarea for reviewer_notes
- On confirm: updates reviewer_notes + reviewed_at + status/onboarding_status

## Navbar Update

In `src/components/layout/Navbar.tsx`, change the admin link label from "Applicants" to "Coach Approval" in both desktop dropdown and mobile menu (2 places). Route stays `/admin/applicants`.

## Directory Visibility

No changes needed. Existing RLS policy on coaches table enforces `status = 'approved'`. The publish-coach function creates the coaches record with that status, making the coach visible in the directory automatically.

## Files to Create/Modify

| File | Action |
|------|--------|
| supabase/migrations/...\_add\_user\_id.sql | Create (migration) |
| supabase/functions/publish-coach/index.ts | Create |
| supabase/config.toml | Add publish-coach JWT config |
| src/pages/admin/Applicants.tsx | Major rewrite |
| src/components/layout/Navbar.tsx | Label change (2 places) |

