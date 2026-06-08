# End-to-End & UAT Test Report
## SACL Quality Management System

| Field | Value |
|---|---|
| **Document ID** | E2E-SACL-001 |
| **Date** | 2026-06-04 |
| **Tool** | Playwright (E2E) · Manual (UAT) |
| **Browsers** | Chrome 124 · Firefox 125 · Safari 17 |
| **Total Test Cases** | 68 |
| **Passed** | 61 |
| **Failed** | 7 |
| **Pass Rate** | 89.7% |

---

## Critical User Journeys

### Journey 1 — QC Entry to HOD Approval (Happy Path)

```
Actor: QC Engineer → HOF → HOD
Flow:  Login → Select Part → Fill form → Submit → HOF Approve → HOD Approve
```

| Step | Actor | Action | Expected | Actual | Status |
|---|---|---|---|---|---|
| 1 | QC | Login with Employee ID + Password | Dashboard loads, sidebar shows Quality Forms only | ✅ Correct | ✅ PASS |
| 2 | QC | Navigate to Impact Test | Impact Test page loads | ✅ Loads | ✅ PASS |
| 3 | QC | Select Part Name "YTA Knuckle" | Threshold config auto-loads · notch types auto-populate | ✅ Correct | ✅ PASS |
| 4 | QC | View notch blocks (TRA × Unotch, TRA × Vnotch, SBA × Unotch, SBA × Vnotch) | 4 blocks rendered based on part config | ✅ Correct | ✅ PASS |
| 5 | QC | Enter observed values within range | Green border · no error | ✅ Correct | ✅ PASS |
| 6 | QC | Enter value below threshold | Red border · "Value out of range!" | ✅ Correct | ✅ PASS |
| 7 | QC | Fix values and click "Save Record" | Single record saved · toast "1 record saved" | ✅ Correct | ✅ PASS |
| 8 | QC | Record appears in table with status "QC ENTRY" | ✅ Visible | ✅ PASS |
| 9 | HOF | Login · navigate to Impact Test | Record visible | ✅ Correct | ✅ PASS |
| 10 | HOF | Click "Approve HOF" | Status → HOF_APPROVED · hofApprovedBy = HOF employee ID | ✅ Correct | ✅ PASS |
| 11 | HOD | Login · navigate to Impact Test | Record with HOF_APPROVED visible | ✅ Correct | ✅ PASS |
| 12 | HOD | Click "Approve HOD" | Status → HOD_APPROVED · hodApprovedBy = HOD employee ID | ✅ Correct | ✅ PASS |
| 13 | HOD | Open Reports · search by Part Name | Record appears in all relevant sections | ✅ Correct | ✅ PASS |
| 14 | HOD | Click "Download All" | Excel file downloads with all 4 sheets | ✅ Correct | ✅ PASS |

**Journey 1 Overall:** ✅ **PASS** (14/14 steps)

---

### Journey 2 — Rejection Workflow

| Step | Actor | Action | Expected | Actual | Status |
|---|---|---|---|---|---|
| 1 | QC | Submit QC Register record | Record saved, status = QC_ENTRY | ✅ | ✅ PASS |
| 2 | HOF | Open record · click "Reject" | Confirm modal appears | ✅ | ✅ PASS |
| 3 | HOF | Confirm rejection | Record disappears from list · toast "Record rejected" | ✅ | ✅ PASS |
| 4 | HOD | Check Employee Efficiency | HOF rejection count incremented for QC employee | ✅ | ✅ PASS |
| 5 | QC | Resubmit corrected record | New record created, old gone | ✅ | ✅ PASS |
| 6 | HOF | Approve resubmitted record | HOF_APPROVED | ✅ | ✅ PASS |
| 7 | HOD | Reject at HOD level | HOD rejection incremented in efficiency | ✅ | ✅ PASS |

**Journey 2 Overall:** ✅ **PASS** (7/7 steps)

---

### Journey 3 — Admin: Part Names Configuration

| Step | Action | Expected | Actual | Status |
|---|---|---|---|---|
| 1 | Navigate to Part Names | List of parts shown | ✅ | ✅ PASS |
| 2 | Click "Add Part Name" | Form opens | ✅ | ✅ PASS |
| 3 | Enter part name "TEST PART" | Accepted | ✅ | ✅ PASS |
| 4 | Check TRA + SBA mechanical locations | Both checked | ✅ | ✅ PASS |
| 5 | Tick "V-notch" under Impact Notch Types | V-notch threshold inputs appear | ✅ | ✅ PASS |
| 6 | Enter V-notch min=10, max=100 | Values accepted | ✅ | ✅ PASS |
| 7 | Untick "V-notch" | Threshold inputs disappear | ✅ | ✅ PASS |
| 8 | Save Standard | Success toast | ✅ | ✅ PASS |
| 9 | Edit the saved part | V-notch is unchecked (was saved as unchecked) | ⚠️ Checkbox not restored | ❌ FAIL |
| 10 | Set all threshold values | Correct fields saved | ✅ | ✅ PASS |

**Journey 3 Overall:** ❌ **FAIL** (9/10 — Step 9 fails — BUG-009)

---

### Journey 4 — User Management

| Step | Action | Expected | Actual | Status |
|---|---|---|---|---|
| 1 | Admin navigates to User Management | User list shown with Employee ID column | ✅ | ✅ PASS |
| 2 | Add user with Employee ID "EMP005" | User created | ✅ | ✅ PASS |
| 3 | New user logs in with EMP005 | Login successful | ✅ | ✅ PASS |
| 4 | Add user with duplicate EMP001 | Error: "Employee ID already exists" | ✅ | ✅ PASS |
| 5 | Edit user — change Employee ID | Updated successfully | ✅ | ✅ PASS |
| 6 | Set form permissions (IMPACT_TEST only) | User can only see Impact Test in nav | ✅ | ✅ PASS |
| 7 | HOF role user sees approve/reject buttons | Approve HOF button visible on QC_ENTRY records | ✅ | ✅ PASS |
| 8 | Deactivate user | User cannot login (DisabledException) | ✅ | ✅ PASS |

**Journey 4 Overall:** ✅ **PASS** (8/8 steps)

---

### Journey 5 — Dashboard & Reports

| Step | Action | Expected | Actual | Status |
|---|---|---|---|---|
| 1 | Dashboard loads | Stat cards show correct counts (from totalElements) | ✅ | ✅ PASS |
| 2 | Welcome banner shows user name | User's fullName displayed | ✅ | ✅ PASS |
| 3 | Approval pipeline shows correct pending count | Matches actual DB count | ✅ | ✅ PASS |
| 4 | Quick access cards navigate correctly | All 6 cards navigate to correct page | ✅ | ✅ PASS |
| 5 | Reports — search by part name only | Records from all 4 modules shown | ✅ | ✅ PASS |
| 6 | Reports — search by date code only | OR filter works correctly | ✅ | ✅ PASS |
| 7 | Reports — download Excel (all tabs) | Excel has 5 sheets: Combined + 4 individual | ✅ | ✅ PASS |
| 8 | Impact Test rows expanded from locationValues | TRA/SBA split into separate rows | ✅ | ✅ PASS |
| 9 | Employee Efficiency — click row to expand | Detail panels show breakdown | ✅ | ✅ PASS |
| 10 | Sort by approval rate | Sorts descending correctly | ✅ | ✅ PASS |

**Journey 5 Overall:** ✅ **PASS** (10/10 steps)

---

### Journey 6 — Multi-Location + Notch Combo Rendering

| Step | Action | Expected | Actual | Status |
|---|---|---|---|---|
| 1 | Select part with TRA+SBA locations and Unotch+Vnotch | 4 blocks render (TRA-U, TRA-V, SBA-U, SBA-V) | ✅ | ✅ PASS |
| 2 | Select part with only 1 location, 3 notches | 3 blocks render | ✅ | ✅ PASS |
| 3 | Select part with no notch types configured | Per-location blocks only | ✅ | ✅ PASS |
| 4 | Enter values — save | 1 record in DB with locationValues JSON | ✅ | ✅ PASS |
| 5 | Record shows in table with location "TRA,SBA" | ✅ | ✅ PASS |

**Journey 6 Overall:** ✅ **PASS** (5/5 steps)

---

## Browser Compatibility

| Feature | Chrome 124 | Firefox 125 | Safari 17 |
|---|---|---|---|
| Login form | ✅ | ✅ | ✅ |
| Number input spinners | ✅ | ✅ | ⚠️ Different style |
| Sidebar collapse | ✅ | ✅ | ✅ |
| Table horizontal scroll | ✅ | ✅ | ✅ |
| Excel download | ✅ | ✅ | ✅ |
| Toast notifications | ✅ | ✅ | ✅ |
| CSS Grid layout | ✅ | ✅ | ✅ |
| Inter font (Google Fonts) | ✅ | ✅ | ✅ |
| Checkbox accent-color | ✅ | ✅ | ⚠️ No accent-color support |

**Safari Issues:**
- Number input spinner styling differs — functional but looks different
- `accent-color` CSS property not supported — checkboxes use browser default

---

## UAT Sign-off Matrix

| Role | Tester | Journey Tested | Sign-off |
|---|---|---|---|
| QC Engineer | [QC Tester] | Data entry, form validation | ⏳ Pending |
| HOF | [HOF Tester] | HOF approval, rejection | ⏳ Pending |
| HOD | [HOD Tester] | HOD approval, reports, efficiency | ⏳ Pending |
| Admin | [IT Admin] | User mgmt, part config | ⏳ Pending |

---

## E2E Defects Found

| ID | Severity | Journey | Description |
|---|---|---|---|
| BUG-009 | S3 | Part Names | Notch type checkboxes not restored on edit |
| BUG-010 | S3 | Impact Test | Threshold hint shows generic range when per-notch not set |
| BUG-011 | S4 | Safari | Checkbox accent-color not applied |
| BUG-012 | S4 | All forms | Number input shows −0 for zero values in some browsers |
| BUG-013 | S3 | Reports | Legacy records without locationValues show blank location column |
| BUG-014 | S3 | Dashboard | Approval pipeline counts include records from modules user has no access to |
| BUG-015 | S4 | Sidebar | "Sign Out" shows username instead of employeeId |
