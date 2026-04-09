# Phase 3 — Claude Agent Integration Technical Specification

## Overview

Phase 3 introduces a Claude-powered evaluation agent that automatically assesses coach profiles at key lifecycle points. The agent evaluates profile completeness, identifies risks, generates readiness scores, and provides actionable recommendations — enabling admins to make faster, data-informed decisions about coach onboarding and publication.

### Agent Responsibilities

1. **Evaluate coach profiles** — score completeness and quality against platform standards
2. **Suggest improvements** — identify missing fields, weak content, and compliance gaps
3. **Flag risks** — detect inconsistencies, incomplete credentials, or policy violations
4. **Recommend actions** — provide structured next-step guidance for admins
5. **Match clients** (future) — power intelligent coach-client matching based on profile data

---

## Data Contract

### Input: `coach_profile_snapshot(p_coach_id UUID) → JSONB`

The database function returns a complete, structured JSON object representing the coach's current state. This is the sole input to the Claude Agent.

```json
{
  "coach_id": "uuid",
  "display_name": "string",
  "email": "string",
  "slug": "string",
  "headline": "string | null",
  "bio": "string | null",
  "positioning_statement": "string | null",
  "methodology": "string | null",
  "coaching_philosophy": "string | null",
  "coaching_style": "string | null",
  "primary_pillar": "string | null",
  "secondary_pillars": "string[] | null",
  "tier": "standard | premium | elite | null",
  "audience": "string | null",
  "engagement_format": "string | null",
  "engagement_model": "string | null",
  "industry_focus": "string[] | null",
  "specialties": "string[] | null",
  "years_experience": "number | null",
  "proof_points": "jsonb | null",
  "lifecycle_status": "string",
  "readiness_score": "number | null",
  "missing_fields": "string[] | []",
  "risk_flags": "string[] | []",
  "products": [
    {
      "id": "uuid",
      "title": "string",
      "product_type": "string",
      "outcome_statement": "string | null",
      "duration_minutes": "number | null",
      "delivery_format": "string | null",
      "price_type": "string",
      "price_amount": "number | null",
      "is_active": "boolean",
      "booking_mode": "string | null"
    }
  ],
  "snapshot_at": "timestamp"
}
```

### Output: Agent Evaluation Fields

Written back to the `coaches` table after each agent run:

| Column               | Type         | Description                                                |
|----------------------|--------------|------------------------------------------------------------|
| `readiness_score`    | NUMERIC      | 0-100 score representing overall profile readiness         |
| `missing_fields`     | JSONB        | Array of field names that are empty or incomplete          |
| `risk_flags`         | JSONB        | Array of risk descriptions (e.g., "No products configured")|
| `agent_recommendation`| TEXT        | Natural language next-step recommendation for admin        |
| `agent_last_run`     | TIMESTAMPTZ  | Timestamp of the most recent agent evaluation              |
| `agent_version`      | TEXT         | Semantic version of the agent prompt/logic (e.g., "1.0.0") |

---

## Trigger Points

The agent is invoked at three lifecycle points, logged to `agent_trigger_log`:

| Trigger Point      | When Fired                                        | Purpose                                   |
|--------------------|---------------------------------------------------|-------------------------------------------|
| `on_submit`        | Coach submits their profile for review             | Initial evaluation before admin sees it    |
| `on_update`        | Coach updates any profile field after submission   | Re-evaluate after changes                  |
| `on_admin_review`  | Admin opens a coach profile for review             | Fresh score with latest data               |

### Trigger Payload Schema

```json
{
  "coach_id": "uuid",
  "trigger_point": "on_submit | on_update | on_admin_review",
  "payload": {
    "updated_fields": ["headline", "bio"],
    "triggered_by": "user_id | system",
    "metadata": {}
  }
}
```

---

## Integration Flow

```
1. Trigger Event
   └─ Frontend or backend fires POST to agent-lifecycle-hook edge function
      └─ Event logged to agent_trigger_log table

2. Agent Invocation (Phase 3)
   └─ Backend worker picks up trigger event
      └─ Calls coach_profile_snapshot(coach_id) for structured data
         └─ Sends snapshot to Claude API with evaluation prompt

3. Claude Evaluation
   └─ Claude analyzes profile completeness, quality, risks
      └─ Returns structured JSON: { readiness_score, missing_fields, risk_flags, recommendation }

4. Write Results
   └─ Backend writes evaluation results to coaches table
      └─ Sets agent_last_run = now(), agent_version = current version

5. Admin Review
   └─ Admin sees evaluation on /admin/agent-evaluation page
      └─ Can filter by risk flags, low readiness, expand details
```

---

## Security

### Access Control

- **Claude API calls**: Service role only — never from client-side
- **coach_profile_snapshot()**: `SECURITY DEFINER` — executes with function owner privileges
- **agent_trigger_log**: RLS enforced — admins can read, service role can insert
- **Agent evaluation columns**: Writable only by service role (backend worker)
- **Admin UI**: Protected by `requireAdmin` route guard checking `user_roles` table

### API Key Management

- Claude API key stored as Supabase secret (via Vault or environment variable)
- Never exposed to frontend
- Rate limiting applied per coach (max 1 evaluation per 5 minutes)

### Data Privacy

- Coach data never leaves the Supabase + Claude API boundary
- Snapshot data is ephemeral — not stored after evaluation
- Agent recommendations stored only in the coaches table

---

## Dependencies

### Phase 2 Prerequisites (must be complete)

| Item                        | Status       | Description                                     |
|-----------------------------|-------------|--------------------------------------------------|
| Agent evaluation columns     | Complete    | readiness_score, missing_fields, risk_flags, agent_recommendation, agent_last_run, agent_version |
| agent_trigger_log table      | Complete    | Event log with RLS and indexes                   |
| agent-lifecycle-hook function| Complete    | Edge function for trigger event logging           |
| Admin evaluation view        | Complete    | /admin/agent-evaluation page                      |
| coach_profile_snapshot()     | Complete    | Database function returning structured JSON       |

### Phase 3 New Components

| Component                    | Type         | Description                                      |
|------------------------------|-------------|---------------------------------------------------|
| Agent evaluation worker      | Edge Function| Picks up triggers, calls Claude, writes results   |
| Claude evaluation prompt     | Prompt       | Structured prompt with scoring rubric              |
| Rate limiter                 | Middleware   | Prevents excessive API calls per coach             |
| Webhook retry logic          | Worker       | Handles Claude API failures with exponential backoff|

---

## Scoring Rubric (Draft)

The Claude Agent will evaluate coaches against these criteria:

| Category          | Weight | Criteria                                                    |
|-------------------|--------|-------------------------------------------------------------|
| Profile Complete  | 30%    | All required fields filled (name, headline, bio, philosophy)|
| Content Quality   | 25%    | Bio length >100 chars, clear positioning, specific audience |
| Products          | 20%    | At least 1 active product with price and outcome statement  |
| Credentials       | 15%    | Years experience, specialties, proof points present         |
| Consistency       | 10%    | Pillar alignment, style matches methodology                 |

---

## Timeline

- **Phase 2** (current): Infrastructure deployed, event logging active, admin view ready
- **Phase 3** (next): Claude API integration, evaluation worker, prompt engineering
- **Phase 4** (future): Client matching, automated onboarding flows, self-service improvements
