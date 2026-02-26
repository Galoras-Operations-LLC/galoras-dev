

## Split Coach Intake: Apply = Short Form, Onboarding = Long Form

### Overview
Restructure the two-step coach intake so Apply collects only what's needed for initial evaluation (through Professional Background), while Onboarding collects the detailed profile (Coaching Pillar onward). No schema changes.

### File 1: `src/pages/Apply.tsx` (Short Form -- trim to Step 1)

**State cleanup** (lines 96-113): Remove these from `formData`:
- `pillar_specialties`, `primary_join_reason`, `commitment_level`, `start_timeline`, `excitement_note`
- `primary_pillar`, `secondary_pillars`, `industry_focus`, `coaching_style`, `engagement_model`, `availability_status`
- `founder_stage_focus`, `founder_function_strength`, `exec_level`, `exec_function`

**Remove helpers** (lines 134-146): Remove `handlePillarChange` and `handleArrayToggle` (no longer needed).

**Remove from `handleBackgroundChange`** (lines 120-132): Remove resets for `founder_stage_focus`, `founder_function_strength`, `exec_level`, `exec_function` since those fields no longer exist in state.

**Simplify submit payload** (lines 209-243): Remove all Step-2 fields from the insert. Keep only: `full_name`, `email`, `phone`, `linkedin_url`, `website_url`, `bio`, `coaching_philosophy`, `avatar_url`, `coach_background`, `coach_background_detail`, `certification_interest`, `coaching_experience_years`, `leadership_experience_years`, `current_role`, `coaching_experience_level`, `booking_url`.

**Simplify reset** (lines 252-262): Remove Step-2 fields from the reset object.

**Reorder "About You"**: Move the "About You" section (Bio + Coaching Philosophy, currently at lines 648-667) to appear between Personal Information (ends at line 398) and Professional Background (starts at line 400).

**Remove UI sections entirely**:
- Conditional Founder/Executive detail blocks (lines 454-512)
- "Coaching Pillar" section (lines 544-570)
- "Coaching Preferences" section (lines 572-621)
- "Detailed Specialties" section (lines 623-646)
- "About You" section (lines 648-667) -- moved earlier, so this instance is removed
- "Motivation" section (lines 669-717)

**Remove unused imports** (lines 28-49): Remove `PILLAR_SPECIALTIES`, `PRIMARY_PILLAR_OPTIONS`, `INDUSTRY_FOCUS_OPTIONS`, `COACHING_STYLE_OPTIONS`, `ENGAGEMENT_MODEL_OPTIONS`, `AVAILABILITY_STATUS_OPTIONS`, `FOUNDER_STAGE_OPTIONS`, `FOUNDER_FUNCTION_OPTIONS`, `EXEC_LEVEL_OPTIONS`, `EXEC_FUNCTION_OPTIONS`, `JOIN_REASON_OPTIONS`, `COMMITMENT_LEVEL_OPTIONS`, `START_TIMELINE_OPTIONS`, `isFounderBackground`, `isExecutiveBackground`, `Checkbox`.

**Update copy** (line 326-327): Change description to: "Step 1 of 2: Submit your background for initial review. If approved, you'll receive a link to complete your full coach profile."

**Update "What Happens Next?"** (lines 734-761): Revise steps to explicitly mention Step 2 onboarding link.

### File 2: `src/pages/coaching/CoachOnboarding.tsx` (Long Form -- Step 2 only)

**Remove duplicate Step-1 inputs from form UI** (lines 270-425):
- Full Name input (lines 271-274)
- Bio input (lines 276-280)
- Coaching Philosophy input (lines 282-287)
- Entire Professional Background section (lines 289-425): coach background, experience years, conditional founder/exec blocks, leadership experience, current role, coaching experience level

**Remove Step-1 state variables** (lines 70-76): `coachBackground`, `coachBackgroundDetail`, `certificationInterest`, `coachingExperienceYears`, `leadershipExperienceYears`, `currentRole`, `coachingExperienceLevel`. Also remove `handleBackgroundChange` (lines 98-106) and `backgroundConfig` (line 96).

**Keep `fullName` and `bio` as read-only state** (populated from application data, displayed in summary but not editable).

**Add read-only summary card** at the top of the form showing:
- Full Name, Bio, Coach Background, Experience Years, Experience Level (from `application` data returned by `validate-onboarding-token`)
- This requires updating the `CoachApplication` interface (line 44) to include the additional fields.

**Update header copy** (lines 259-261): "Step 2 of 2: Complete your coach profile (pillars, preferences, motivation)."

**Update validation** (line 139): Remove checks for `coachBackground`, `coachingExperienceYears`, `leadershipExperienceYears`, `coachingExperienceLevel`. Keep: `primaryPillar`, `primaryJoinReason`, `commitmentLevel`, `startTimeline`. Remove `fullName`/`bio` from required check (they come from Step 1).

**Update submit payload** (lines 146-180): Remove Step-1 fields (`coachBackground`, `coachBackgroundDetail`, `certificationInterest`, `coachingExperienceYears`, `leadershipExperienceYears`, `currentRole`, `coachingExperienceLevel`). Keep `fullName` and `bio` (pass through from application). Remove `coachingPhilosophy` (captured in Step 1). Keep all Step-2 fields.

**Remove unused imports**: `COACH_BACKGROUND_OPTIONS`, `BACKGROUND_DETAIL_CONFIG`, `CERTIFICATION_INTEREST_OPTIONS`, `COACHING_EXPERIENCE_OPTIONS`, `LEADERSHIP_EXPERIENCE_OPTIONS`, `COACHING_LEVEL_OPTIONS`, `FOUNDER_STAGE_OPTIONS`, `FOUNDER_FUNCTION_OPTIONS`, `EXEC_LEVEL_OPTIONS`, `EXEC_FUNCTION_OPTIONS`, `isFounderBackground`, `isExecutiveBackground`, `User`, `FileText`.

### File 3: `supabase/functions/complete-onboarding/index.ts` (Prevent wiping Step-1 data)

**Replace the monolithic update object** (lines 58-92) with conditional spreads so fields not sent by the onboarding form don't overwrite Step-1 data:

```text
const updates: Record<string, any> = {
  onboarding_status: "completed",
  reviewed_at: new Date().toISOString(),
  // Only update if provided
  ...(fullName && { full_name: fullName }),
  ...(bio && { bio }),
  ...(coachingFocus && { specialties: coachingFocus.split(",").map((s: string) => s.trim()) }),
  ...(linkedinUrl !== undefined && { linkedin_url: linkedinUrl || null }),
  ...(avatarUrl !== undefined && { avatar_url: avatarUrl || null }),
  ...(coachingPhilosophy !== undefined && { coaching_philosophy: coachingPhilosophy || null }),
  // Step-1 fields: only update if explicitly sent
  ...(coachBackground !== undefined && { coach_background: coachBackground || null }),
  ...(coachBackgroundDetail !== undefined && { coach_background_detail: coachBackgroundDetail || null }),
  ...(certificationInterest !== undefined && { certification_interest: certificationInterest || null }),
  ...(coachingExperienceYears !== undefined && { coaching_experience_years: coachingExperienceYears || null }),
  ...(leadershipExperienceYears !== undefined && { leadership_experience_years: leadershipExperienceYears || null }),
  ...(currentRole !== undefined && { current_role: currentRole || null }),
  ...(coachingExperienceLevel !== undefined && { coaching_experience_level: coachingExperienceLevel || null }),
  // Step-2 fields
  ...(pillarSpecialties !== undefined && { pillar_specialties: pillarSpecialties || null }),
  ...(primaryJoinReason !== undefined && { primary_join_reason: primaryJoinReason || null }),
  ...(commitmentLevel !== undefined && { commitment_level: commitmentLevel || null }),
  ...(startTimeline !== undefined && { start_timeline: startTimeline || null }),
  ...(excitementNote !== undefined && { excitement_note: excitementNote || null }),
  ...(primaryPillar !== undefined && { primary_pillar: primaryPillar || null }),
  ...(secondaryPillars !== undefined && { secondary_pillars: secondaryPillars || null }),
  ...(industryFocus !== undefined && { industry_focus: industryFocus || null }),
  ...(coachingStyle !== undefined && { coaching_style: coachingStyle || null }),
  ...(engagementModel !== undefined && { engagement_model: engagementModel || null }),
  ...(availabilityStatus !== undefined && { availability_status: availabilityStatus || null }),
  ...(founderStageFocus !== undefined && { founder_stage_focus: founderStageFocus || null }),
  ...(founderFunctionStrength !== undefined && { founder_function_strength: founderFunctionStrength || null }),
  ...(execLevel !== undefined && { exec_level: execLevel || null }),
  ...(execFunction !== undefined && { exec_function: execFunction || null }),
  ...(bookingUrl !== undefined && { booking_url: bookingUrl || null }),
};
```

**Relax validation** (line 28): Change required check from `!token || !fullName || !bio || !coachingFocus` to just `!token` (since Step 2 may not send fullName/bio/coachingFocus).

### Files Summary

| File | Action |
|---|---|
| `src/pages/Apply.tsx` | Remove Step-2 fields, sections, imports; reorder About You; update copy |
| `src/pages/coaching/CoachOnboarding.tsx` | Remove Step-1 inputs; add read-only summary; update validation + submit |
| `supabase/functions/complete-onboarding/index.ts` | Conditional spreads to prevent wiping Step-1 data |

### Acceptance Criteria
- Apply form ends at Professional Background (with experience fields); no pillar/motivation/preferences sections visible
- Onboarding form shows read-only summary of Step-1 data, then collects Step-2 fields only
- Submitting Apply creates a `coach_applications` row with Step-2 fields as null
- Completing Onboarding fills in Step-2 fields without wiping Step-1 data
- No database schema changes required

