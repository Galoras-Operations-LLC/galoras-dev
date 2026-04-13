# SOW #3 Bugs Found & Fixes Required

**Generated:** 2026-04-13  
**Total Issues:** 7  
**Critical:** 2 | High: 2 | Medium: 3

---

## CRITICAL BUGS (Block Release)

### BUG #1: Dual Lead Table Architecture

**ID:** SOW3-001  
**Severity:** CRITICAL  
**Status:** UNFIXED  

**Description:**
Contact page submissions go to "leads" table, but admin dashboard only shows "coaching_requests" table. General inquiries from /contact are invisible to admins.

**Root Cause:**
- Contact.tsx uses `supabase.from("leads")`
- RequestModal uses `supabase.from("coaching_requests")`
- Leads.tsx only queries coaching_requests

**Impact:**
- Contact page is non-functional for admin workflow
- Users submitting via /contact get no follow-up
- Lost business opportunity

**Steps to Reproduce:**
1. Go to /contact
2. Submit general inquiry
3. Go to admin /leads
4. Search for submitted contact
5. Result: Not found

**Files Involved:**
- `/src/pages/Contact.tsx` line 58
- `/src/pages/admin/Leads.tsx` line 91
- Database: "leads" and "coaching_requests" tables

**Fix Option A (Recommended): Consolidate to coaching_requests**

```typescript
// Contact.tsx - Change line 58 from:
const { error } = await supabase.from("leads").insert({
  contact_name: formData.contact_name,
  contact_email: formData.contact_email,
  // ...
});

// To:
const { error } = await supabase.from("coaching_requests").insert({
  requester_name: formData.contact_name,
  requester_email: formData.contact_email,
  goal: formData.message,
  request_type: "inquiry",
  source: "contact_page",
  coach_id: null,
  product_id: null,
  urgency: formData.company_size || "medium",
});
```

**Fix Option B: Query Both Tables in Admin**

```typescript
// Leads.tsx - Update query to include both tables
const { data: coachingLeads } = await supabase
  .from("coaching_requests")
  .select(...)
  .order("created_at", { ascending: false });

const { data: generalLeads } = await supabase
  .from("leads")
  .select(...)
  .order("created_at", { ascending: false });

const allLeads = [
  ...coachingLeads,
  ...generalLeads
].sort((a, b) => 
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);
```

**Recommendation:** Option A - consolidate to single table

**Effort:** 2-4 hours including migration

**Testing Required:**
- Verify contact submissions appear in admin dashboard
- Verify no data loss in migration
- Test all admin filters still work
- Regression test form submissions

---

### BUG #2: Missing Requester Confirmation Email

**ID:** SOW3-002  
**Severity:** CRITICAL  
**Status:** UNFIXED

**Description:**
Users submit coaching requests but receive no confirmation email. No proof of delivery or tracking information. Leads to support tickets asking "Did my request go through?"

**Root Cause:**
- RequestModal only invokes admin alert
- No requester confirmation email sent
- No requester tracking/status page

**Impact:**
- Poor user experience (no receipt confirmation)
- Increased support burden
- Users may re-submit duplicate requests

**Steps to Reproduce:**
1. Fill and submit RequestModal
2. Check email inbox
3. Result: Only success toast message shown locally, no email received

**Files Involved:**
- `/src/components/coaching/RequestModal.tsx` lines 52-62
- Missing: `send-requester-confirmation` edge function

**Fix Required:**

**Step 1: Create Edge Function**

Create `/supabase/functions/send-requester-confirmation/index.ts`:

```typescript
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function requesterConfirmationEmail(data: any): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,sans-serif;margin:0;padding:0;background:#f5f5f5}
.container{max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.1)}
.header{background:linear-gradient(135deg,#0369a1,#1a1a2e);color:white;padding:24px 32px}
.header h1{margin:0;font-size:20px}
.content{padding:24px 32px}
.card{background:#f8f9fa;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #0369a1}
.row{margin:8px 0;font-size:14px}
.label{color:#666;display:inline-block;width:120px;font-weight:500}
.value{color:#1a1a2e;font-weight:600}
.footer{background:#f8f9fa;padding:16px 32px;text-align:center;color:#999;font-size:12px}
</style></head><body><div class="container">
<div class="header"><h1>Request Confirmed</h1></div>
<div class="content">
<p>Hi ${escapeHtml(data.name || "")},</p>
<p>We've received your coaching request. ${escapeHtml(data.coachName || "")} will review it and get back to you within <strong>48 hours</strong>.</p>
<div class="card">
<div class="row"><span class="label">Coach:</span><span class="value">${escapeHtml(data.coachName || "")}</span></div>
${data.product ? `<div class="row"><span class="label">Product:</span><span class="value">${escapeHtml(data.product)}</span></div>` : ""}
<div class="row"><span class="label">Your Email:</span><span class="value">${escapeHtml(data.email || "")}</span></div>
</div>
<p style="color:#666;font-size:14px">In the meantime, feel free to explore more coaches on the <a href="https://uat-galoras.site/coaching" style="color:#0369a1">Galoras platform</a>.</p>
<p style="color:#666;font-size:12px">Questions? Reply to this email anytime.</p>
</div>
<div class="footer">Galoras Coaching Exchange</div>
</div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const data = await req.json();
    const { requesterEmail, name, coachName, product } = data;

    if (!requesterEmail) {
      return new Response(JSON.stringify({ error: "requesterEmail required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const html = requesterConfirmationEmail(data);

    const result = await resend.emails.send({
      from: "Galoras <onboarding@resend.dev>",
      to: requesterEmail,
      subject: "Request Confirmed - We'll Be in Touch Soon",
      html,
    });

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("send-requester-confirmation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
```

**Step 2: Call from RequestModal**

```typescript
// RequestModal.tsx - After successful insert, around line 50
if (!error) {
  // Notify admin
  try {
    await supabase.functions.invoke("send-admin-alert", { ... });
  } catch (_) { }

  // NEW: Notify requester
  try {
    await supabase.functions.invoke("send-requester-confirmation", {
      body: {
        requesterEmail: email,
        name,
        coachName,
        product: productTitle || null,
      },
    });
  } catch (_) { /* non-blocking */ }

  setStatus("sent");
}
```

**Effort:** 1-2 hours

**Testing Required:**
- Submit request
- Verify requester receives email within 2 minutes
- Check email content for accuracy
- Test with special characters in name/email

---

## HIGH PRIORITY BUGS

### BUG #3: Missing Form Fields

**ID:** SOW3-003  
**Severity:** HIGH  
**Status:** UNFIXED

**Description:**
RequestModal doesn't capture phone or company_name fields, but test plan expects them and database schema supports them.

**Root Cause:**
- Form fields not added to RequestModal component
- Database columns exist but unused

**Impact:**
- Reduced data for follow-up calls
- Can't reach users via phone
- No company context for B2B opportunities

**Steps to Reproduce:**
1. Open RequestModal
2. Look for phone and company fields
3. Result: Not present

**Files Involved:**
- `/src/components/coaching/RequestModal.tsx` lines 22-27

**Fix Required:**

```typescript
// RequestModal.tsx - Add to state
const [phone, setPhone] = useState("");
const [company, setCompany] = useState("");

// Add to form JSX after email field
<div>
  <label className="block text-xs text-zinc-400 mb-1.5">
    Phone (optional)
  </label>
  <input 
    type="tel" 
    value={phone} 
    onChange={e => setPhone(e.target.value)}
    placeholder="(555) 123-4567"
    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-primary" 
  />
</div>

<div>
  <label className="block text-xs text-zinc-400 mb-1.5">
    Company (optional)
  </label>
  <input 
    type="text" 
    value={company} 
    onChange={e => setCompany(e.target.value)}
    placeholder="Your Company Name"
    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-primary" 
  />
</div>

// Add to insert statement (around line 38)
requester_phone: phone || null,
company_name: company || null,
```

**Effort:** 1 hour

**Testing Required:**
- Submit with phone and company populated
- Submit with fields blank
- Verify in database

---

### BUG #4: No Admin Pagination

**ID:** SOW3-004  
**Severity:** HIGH  
**Status:** UNFIXED

**Description:**
Admin Leads page displays all records on single page. No pagination controls. Will be slow with 100+ leads.

**Root Cause:**
- Leads.tsx doesn't implement pagination
- Query returns all records

**Impact:**
- Poor performance at scale
- Hard to navigate long lists
- User experience degrades

**Files Involved:**
- `/src/pages/admin/Leads.tsx` lines 87-106

**Fix Required:**

See detailed pagination implementation in `SOW3_QA_FINDINGS_SUMMARY.md` section "MEDIUM PRIORITY: Implement Admin Pagination"

**Effort:** 2-3 hours

**Testing Required:**
- Create 50+ leads
- Verify page controls appear
- Test page navigation

---

## MEDIUM PRIORITY BUGS

### BUG #5: Missing Date Range Filter

**ID:** SOW3-005  
**Severity:** MEDIUM  
**Status:** UNFIXED

**Description:**
Admin can only filter by search and status. No date range filter. Hard to find leads from specific time periods.

**Files Involved:**
- `/src/pages/admin/Leads.tsx` lines 79-157

**Fix Required:**
Add DatePicker component for created_at filtering (see recommendations document)

**Effort:** 2 hours

---

### BUG #6: No Duplicate Detection

**ID:** SOW3-006  
**Severity:** MEDIUM  
**Status:** UNFIXED

**Description:**
Users can submit same request multiple times. No check for duplicates.

**Root Cause:**
- RequestModal has no duplicate detection
- No constraint in database

**Impact:**
- Admins receive duplicate requests
- User confusion about re-submissions

**Files Involved:**
- `/src/components/coaching/RequestModal.tsx` lines 29-50

**Fix Option 1: Client-side detection**
```typescript
// Check if request was recently submitted for same coach/email
const recentRequest = await supabase
  .from("coaching_requests")
  .select("id")
  .eq("requester_email", email)
  .eq("coach_id", coachId)
  .gt("created_at", new Date(Date.now() - 3600000).toISOString())
  .single();

if (recentRequest.data) {
  toast({
    title: "Already submitted",
    description: "You've already submitted a request for this coach in the last hour.",
    variant: "destructive"
  });
  return;
}
```

**Fix Option 2: User notification**
```typescript
// Show: "We see you've already submitted a request for this coach. 
// Click here to view your request status."
```

**Effort:** 1 hour

---

### BUG #7: Requester Can't Track Request Status

**ID:** SOW3-007  
**Severity:** MEDIUM  
**Status:** UNFIXED

**Description:**
No tracking page for users to see status of their request after submission.

**Root Cause:**
- No public status tracking UI
- Only admins can see request status

**Impact:**
- Users have no visibility
- Support overhead (users asking for status)

**Fix Required:**
1. Create `/coaching/requests/{requestId}` tracking page
2. Show request status, coach notes (if shared)
3. Include expected response timeframe
4. Allow users to add follow-up comments

**Effort:** 3-4 hours (post-GA)

---

## Summary by Priority

### Blocking Release (Fix Before GA)
- [ ] BUG #1 - Dual table architecture (2-4h)
- [ ] BUG #2 - Requester confirmation email (1-2h)

### Should Fix Before GA
- [ ] BUG #3 - Missing form fields (1h)
- [ ] BUG #4 - No pagination (2-3h)
- [ ] BUG #5 - No date filter (2h)

### Consider for MVP
- [ ] BUG #6 - No duplicate detection (1h)
- [ ] BUG #7 - No tracking page (3-4h, post-GA)

---

## Testing Checklist After Fixes

- [ ] Submit contact form → appears in admin dashboard
- [ ] Submit coaching request → requester receives email
- [ ] Admin dashboard paginates correctly with 50+ leads
- [ ] Can filter leads by date range
- [ ] Phone and company data captured and displayed
- [ ] Duplicate submissions detected and warned
- [ ] All 15 test cases pass

---

## Deployment Verification

Before deploying fixes to production:

1. **Code Review:**
   - [ ] Changes reviewed by 2+ engineers
   - [ ] No hardcoded secrets
   - [ ] Proper error handling

2. **Testing:**
   - [ ] All fixes tested locally
   - [ ] Edge functions tested with Resend logs
   - [ ] Database migration tested (if needed)

3. **Database:**
   - [ ] Backup taken before consolidation
   - [ ] Migration script tested on staging
   - [ ] No data loss verified

4. **Monitoring:**
   - [ ] Error tracking enabled (Sentry/etc)
   - [ ] Email delivery monitored (Resend dashboard)
   - [ ] Admin dashboard performance monitored

