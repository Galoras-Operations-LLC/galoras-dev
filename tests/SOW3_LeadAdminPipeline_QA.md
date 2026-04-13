# SOW #3: Lead/Admin Pipeline QA Test Plan
**Galoras Platform | Phase 2 Completion**  
**Last Updated:** 2026-04-13  
**Status:** Ready for Execution

---

## Overview
This document outlines comprehensive end-to-end testing for the coaching request (lead inquiry) pipeline from initial submission through admin management and follow-up.

---

## Test Scope

### 1. Lead Inquiry Submission
**Test Case 1.1: Form Submission (Product-Specific)**
- [ ] User navigates to coach profile page
- [ ] User clicks "Request Coaching" button on product card
- [ ] Inquiry form pre-populates with:
  - Coach name and ID
  - Product title and ID
  - Request type (inquiry)
- [ ] Form fields validate (email required, name required)
- [ ] Submit button submits to `public.coaching_requests` table
- [ ] User sees success confirmation

**Test Case 1.2: Form Submission (General)**
- [ ] User navigates to /contact or coach profile
- [ ] User submits general inquiry (no specific product)
- [ ] Request records with `product_id = NULL`
- [ ] Request defaults to `status = 'pending'`

**Test Case 1.3: Data Capture**
- [ ] All fields captured:
  - requester_name ✓
  - requester_email ✓
  - requester_phone (optional) ✓
  - goal/problem_statement ✓
  - context ✓
  - urgency level ✓
  - company_name (if applicable) ✓
  - source (defaults to 'website')

---

### 2. Admin Dashboard Lead Management
**Test Case 2.1: Admin Access**
- [ ] Admin user logs in → admin dashboard loads
- [ ] Admin navigates to "Leads" section
- [ ] Table displays all `coaching_requests` with:
  - Requester name & email
  - Coach assigned
  - Product requested
  - Status badge (pending/contacted/qualified/converted/closed)
  - Date submitted
  - Urgency indicator

**Test Case 2.2: Lead Filtering & Search**
- [ ] Filter by coach ✓
- [ ] Filter by status ✓
- [ ] Filter by date range ✓
- [ ] Search by requester name/email ✓
- [ ] Pagination works for 10+ leads

**Test Case 2.3: Lead Detail View**
- [ ] Admin clicks lead row → detail modal opens
- [ ] Modal shows full request data:
  - Problem statement
  - Context
  - Urgency
  - Company info
  - Contact details
- [ ] Admin can update status from dropdown
- [ ] Admin can add internal notes
- [ ] Save button updates database

**Test Case 2.4: Status Transitions**
- [ ] pending → contacted (admin marks as contacted)
- [ ] contacted → qualified (admin qualifies lead)
- [ ] qualified → converted (admin marks conversion)
- [ ] Any status → closed (admin closes without conversion)
- [ ] Each transition updates `updated_at` timestamp

---

### 3. Email Notifications (Resend Integration)
**Test Case 3.1: Admin Notification on New Lead**
- [ ] New coaching request submitted
- [ ] Admin email sent to galoras admin address
- [ ] Email contains:
  - Requester details
  - Coach name
  - Product requested
  - Problem statement
  - Urgency level
  - Link to admin dashboard
- [ ] Email received within 2 minutes

**Test Case 3.2: Coach Notification (Future Phase)**
- [ ] Coach receives notification when lead submitted for their product
- [ ] Email includes requester info + CTA to respond
- [ ] Coach can reply directly via email (if supported)

**Test Case 3.3: Requester Confirmation**
- [ ] Requester receives confirmation email after submission
- [ ] Email confirms:
  - Coach name
  - Product requested
  - Expected response timeline
  - Link to track request status (if supported)

---

### 4. Database State & Audit
**Test Case 4.1: Data Integrity**
- [ ] All submitted leads appear in `public.coaching_requests`
- [ ] Foreign keys are valid (coach_id, product_id)
- [ ] No orphaned records
- [ ] All timestamps are UTC

**Test Case 4.2: Audit Trail**
- [ ] Each status change logged
- [ ] `updated_at` reflects all changes
- [ ] Admin can view change history (future: implement product_change_log pattern)

**Test Case 4.3: Data Cleanup**
- [ ] Old/duplicate records don't appear in active list
- [ ] Soft-delete support (if implemented)

---

### 5. Error Handling & Edge Cases
**Test Case 5.1: Form Validation**
- [ ] Submitting without email shows error
- [ ] Submitting without name shows error
- [ ] Invalid email format shows error
- [ ] File upload (if supported) rejects non-document types

**Test Case 5.2: Database Errors**
- [ ] Network error during submit → user sees retry option
- [ ] Database timeout → user sees friendly error message
- [ ] Duplicate submission detected → user sees warning

**Test Case 5.3: Admin Edge Cases**
- [ ] Admin updates status while another admin has modal open
- [ ] Admin adds note with special characters
- [ ] Admin bulk-updates multiple leads

---

## Test Environment Setup

```bash
# 1. Ensure Supabase project is ready
PROJECT_ID=qbjuomsmnrclsjhdsjcz

# 2. Verify coaching_requests table exists
psql $SUPABASE_URL -c "SELECT * FROM public.coaching_requests LIMIT 1;"

# 3. Clear test data before running
DELETE FROM public.coaching_requests WHERE created_at > now() - interval '1 day';

# 4. Set up test coach data
# (3 coaches already seeded: Conor, Test Coach, plus others)
```

---

## Test Execution Checklist

### Phase 1: Manual UI Testing (Day 1-2)
- [ ] Test Case 1.1 ✓
- [ ] Test Case 1.2 ✓
- [ ] Test Case 1.3 ✓
- [ ] Test Case 2.1 ✓
- [ ] Test Case 2.2 ✓

### Phase 2: Admin Workflow (Day 2-3)
- [ ] Test Case 2.3 ✓
- [ ] Test Case 2.4 ✓
- [ ] Test Case 3.1 ✓
- [ ] Test Case 4.1 ✓

### Phase 3: Edge Cases & Validation (Day 3)
- [ ] Test Case 5.1 ✓
- [ ] Test Case 5.2 ✓
- [ ] Test Case 5.3 ✓

### Phase 4: E2E Automation (Optional)
- [ ] Write Cypress/Playwright tests for happy path
- [ ] Add API integration tests for Resend email verification

---

## Known Blockers / Dependencies

| Item | Status | Notes |
|------|--------|-------|
| coaching_requests table | ✓ Live | Ready for testing |
| Admin Leads page UI | ⚠️ Check | Verify modal & filters exist |
| Resend email integration | ⚠️ Check | Confirm API keys configured |
| Email templates | ⚠️ Check | Verify templates exist in Resend |

---

## Success Criteria

✅ All leads submitted via UI appear in admin dashboard within 2 minutes  
✅ Admin can filter, search, and update lead status without errors  
✅ Email notifications sent to admin on new lead submission  
✅ No data loss or orphaned records in database  
✅ Status transitions update timestamps correctly  

---

## Regression Testing

Before marking SOW #3 complete, verify:
- [ ] Coach profile pages still load correctly
- [ ] Existing bookings/products not affected
- [ ] Authentication still works for admin access
- [ ] No SQL errors in browser console

