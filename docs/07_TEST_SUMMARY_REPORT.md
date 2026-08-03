# Master Test Summary Report
## SACL Quality Management System — v2.0.0

| Field | Value |
|---|---|
| **Document ID** | MSR-SACL-001 |
| **Report Date** | 2026-06-04 |
| **System Version** | 2.0.0 |
| **Stack** | Spring Boot 3.2.4 · React 18 · PostgreSQL · JWT |
| **Test Standard** | IEEE 829 · ISO/IEC 29119 |

---

## Overall Test Results

| Test Type | Total | Pass | Fail | Pass Rate |
|---|---|---|---|---|
| Unit Tests (Backend) | 52 | 51 | 1 | 98.1% |
| Unit Tests (Frontend) | 72 | 67 | 5 | 93.1% |
| API Tests | 87 | 81 | 6 | 93.1% |
| Security Tests | 32 | 26 | 6 | 81.3% |
| E2E / UAT Tests | 68 | 61 | 7 | 89.7% |
| Performance Tests | 24 | 19 | 5 | 79.2% |
| **TOTAL** | **335** | **305** | **30** | **91.0%** |

---

## Module Health Status

| Module | API | Unit | E2E | Security | Overall |
|---|---|---|---|---|---|
| Authentication | ⚠️ 80% | ✅ 95% | ✅ 100% | ⚠️ 60% | **⚠️ 84%** |
| QC Register | ✅ 93% | ✅ 100% | ✅ 100% | ❌ 75% | **⚠️ 92%** |
| Micro Structure | ✅ 93% | ✅ 100% | ✅ 100% | ✅ 85% | **✅ 94%** |
| Tensile Test | ✅ 93% | ✅ 100% | ✅ 100% | ✅ 85% | **✅ 94%** |
| Impact Test | ✅ 93% | ✅ 96% | ✅ 100% | ✅ 85% | **✅ 93%** |
| Part Names | ✅ 100% | ✅ 95% | ❌ 90% | ✅ 100% | **✅ 96%** |
| User Management | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 95% | **✅ 99%** |
| Reports | ✅ 100% | ⚠️ 72% | ✅ 100% | ✅ 90% | **✅ 91%** |
| Employee Efficiency | ✅ 100% | ⚠️ 83% | ✅ 100% | ⚠️ 75% | **⚠️ 89%** |
| Dashboard | — | ✅ 92% | ✅ 100% | — | **✅ 95%** |

---

## All Open Defects

| ID | Severity | Type | Module | Description | Priority Fix |
|---|---|---|---|---|---|
| BUG-001 | **S1 Critical** | Security | All Forms | QC user can set HOF/HOD_APPROVED via API | Sprint 1 |
| BUG-002 | S2 High | API | Auth | Wrong password returns 500 not 401 | Sprint 1 |
| BUG-003 | S2 High | API | Auth | Non-existent employeeId returns 500 not 401 | Sprint 1 |
| BUG-004 | S2 High | Design | All Forms | No server-side threshold validation | Sprint 2 |
| BUG-005 | S2 High | Security | Auth | JWT not invalidated on logout | Sprint 1 |
| BUG-006 | S2 High | Security | Auth | Auth errors reveal whether employeeId exists | Sprint 1 |
| BUG-007 | S3 Medium | Logic | Efficiency | NPE for employees with 0 records | Sprint 2 |
| BUG-008 | S3 Medium | Logic | Reports | `expandLocationValues` throws on null locationValues | Sprint 1 |
| BUG-009 | S3 Medium | UI | Part Names | Notch checkboxes not restored on edit open | Sprint 2 |
| BUG-010 | S3 Medium | UI | Impact Test | Threshold hint shows generic when per-notch not set | Sprint 2 |
| BUG-011 | S4 Low | UI | Cross-browser | Checkbox accent-color not supported in Safari | Sprint 3 |
| BUG-012 | S4 Low | UI | All Forms | Number input shows −0 for zero | Sprint 3 |
| BUG-013 | S3 Medium | Data | Reports | Legacy records without locationValues show blank location | Sprint 2 |
| BUG-014 | S3 Medium | Logic | Dashboard | Pipeline counts include inaccessible modules | Sprint 2 |
| BUG-015 | S4 Low | UI | Sidebar | Sign out shows username instead of employeeId | Sprint 3 |
| BUG-016 | S3 Medium | Security | Efficiency | QC role can access efficiency dashboard | Sprint 1 |

**Total Open: 16 | Critical: 1 | High: 5 | Medium: 7 | Low: 3**

---

## Defect Distribution

```
By Severity:
  S1 Critical  ████░░░░░░  1  (6%)
  S2 High      ████████░░  5  (31%)
  S3 Medium    ███████████ 7  (44%)
  S4 Low       ████░░░░░░  3  (19%)

By Module:
  Authentication  ████████░░  5 bugs
  All Forms       ██████░░░░  3 bugs
  Reports         ████░░░░░░  2 bugs
  Part Names      ██░░░░░░░░  1 bug
  Efficiency      ████░░░░░░  2 bugs
  UI/Cross-browser ███░░░░░░░  3 bugs
```

---

## Sprint Fix Plan

### Sprint 1 — Critical & Security (Week 1–2)
| Bug | Fix |
|---|---|
| BUG-001 | Add `@PreAuthorize` + server-side status transition guard |
| BUG-002 | Handle `BadCredentialsException` → 401 in GlobalExceptionHandler |
| BUG-003 | Catch `ResourceNotFoundException` in auth path → generic 401 |
| BUG-005 | Implement JWT blacklist (DB table `revoked_tokens`) |
| BUG-006 | Use same error message regardless of whether employeeId exists |
| BUG-008 | Wrap `JSON.parse(locationValues)` in try-catch with fallback |
| BUG-016 | Add `@PreAuthorize("hasAnyRole('ADMIN','HOD')")` to EfficiencyController |

### Sprint 2 — Medium Priority (Week 3–4)
| Bug | Fix |
|---|---|
| BUG-004 | Add server-side threshold validation in service layer |
| BUG-007 | Guard division by zero in approvalRate calculation |
| BUG-009 | Fix `openEditForm` to correctly map impactNotchTypes to checkbox state |
| BUG-010 | Improve threshold hint fallback logic in Impact Test |
| BUG-013 | Handle null `locationValues` gracefully in Reports expansion |
| BUG-014 | Filter dashboard pipeline counts by user's accessible modules |

### Sprint 3 — Polish (Week 5–6)
| Bug | Fix |
|---|---|
| BUG-011 | CSS fallback for Safari checkbox styling |
| BUG-012 | Guard zero display: `val === 0 ? '0' : val || '—'` |
| BUG-015 | Sidebar sign-out: show `user.employeeId || user.fullName` |

---

## Performance Summary

| Metric | Current | Target | Status |
|---|---|---|---|
| API P95 (avg) | 312 ms | < 500 ms | ✅ |
| Reports API P95 | 420 ms | < 500 ms | ⚠️ |
| Efficiency API P95 | 485 ms | < 500 ms | ⚠️ |
| Dashboard FCP | 1.2 s | < 1.5 s | ✅ |
| Reports Lighthouse | 68 | > 80 | ❌ |
| Concurrent users (stable) | 20 | 50 | ❌ |
| Bundle size (gzip) | 364 KB | < 300 KB | ❌ |
| Code coverage | 74% | > 80% | ⚠️ |

---

## Go / No-Go Assessment

| Criteria | Status | Notes |
|---|---|---|
| All S1 defects resolved | ❌ | BUG-001 open — role elevation possible |
| All S2 defects resolved | ❌ | Auth error handling, JWT logout open |
| API P95 < 500 ms | ⚠️ | 10/12 endpoints pass |
| Core user journeys pass | ✅ | 5/6 journeys pass |
| Security: No auth bypass | ❌ | BUG-001 is critical auth issue |
| Code coverage ≥ 80% | ⚠️ | Currently 74% |

### **Verdict: ⛔ NOT READY FOR PRODUCTION**

**Blocking issues:**
1. **BUG-001 (S1)** — Role elevation must be fixed before any production release
2. **BUG-002 / BUG-003** — Auth errors expose 500 to client
3. **BUG-005** — JWT not invalidated on logout (session hijack risk)

**Recommended:** Fix Sprint 1 bugs (7 issues, ~2 days work) → re-test → Go/No-Go

---

## Code Quality Metrics

| Metric | Backend | Frontend |
|---|---|---|
| Lines of Code | ~4,200 | ~6,800 |
| Cyclomatic Complexity (avg) | 3.2 | 4.1 |
| Duplicate code % | 8% | 12% |
| Technical debt (SonarQube est.) | 3.5 hours | 6 hours |
| Dependencies outdated | 2 | 4 |
| Known CVEs in dependencies | 0 | 1 (minor) |

---

## Testing Checklist Summary

```
[✅] Unit tests written for all service methods
[✅] API tests cover all 9 controllers
[✅] Happy path E2E tested for all 5 core journeys
[✅] OWASP Top 10 tested
[✅] Cross-browser tested (Chrome, Firefox, Safari)
[✅] Performance benchmark established
[❌] All S1/S2 defects resolved        ← BLOCKING
[❌] Security fixes applied             ← BLOCKING
[⚠️] Code coverage ≥ 80%
[⚠️] Performance: 50 concurrent users
[⏳] UAT sign-off by QC/HOF/HOD users
[⏳] Staging deployment tested
[⏳] Production deployment checklist
```

---

*Report prepared by: QA / Development Team*  
*Review: HOD IT · Project Lead*  
*Distribution: Development Team · Project Stakeholders*
