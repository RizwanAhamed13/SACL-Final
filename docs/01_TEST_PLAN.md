# Software Test Plan
## SACL Quality Management System

| Field | Value |
|---|---|
| **Document ID** | STP-SACL-001 |
| **Version** | 1.0 |
| **Date** | 2026-06-04 |
| **Project** | SACL Quality Management System |
| **Stack** | Spring Boot 3.2 · React 18 · PostgreSQL · JWT |
| **Standard** | IEEE 829 / ISO/IEC 29119 |

---

## 1. Objectives

- Verify all API endpoints return correct responses for valid and invalid inputs
- Validate role-based access control (QC → HOF → HOD approval chain)
- Confirm threshold validation triggers correctly per part configuration
- Ensure the UI renders correctly across all user roles and form states
- Test authentication and session security (JWT, rate limiting)
- Validate Excel report generation produces correct data
- Confirm database integrity: soft deletes, constraints, cascades
- Measure API response times meet performance targets

---

## 2. Scope

### In Scope
| Area | Coverage |
|---|---|
| REST API (all 9 controllers) | 100% endpoints |
| Authentication & Authorization | Login, JWT, RBAC |
| Frontend pages (10 pages) | All user-facing flows |
| Approval workflow | QC_ENTRY → HOF_APPROVED → HOD_APPROVED |
| Threshold validation | Per-part, per-notch, per-location |
| Report generation | Search filter + Excel export |
| Employee efficiency metrics | Aggregation accuracy |
| Error handling | 4xx, 5xx responses |

### Out of Scope
- Mobile responsiveness (handled separately)
- Load testing beyond 50 concurrent users
- External OEM integrations
- Email notifications (not implemented)

---

## 3. Test Levels

| Level | Type | Tool |
|---|---|---|
| L1 | Unit Testing | JUnit 5 + Mockito (Backend) / Vitest (Frontend) |
| L2 | Integration Testing | Spring Boot Test + TestContainers |
| L3 | API Testing | Postman / REST Assured |
| L4 | End-to-End Testing | Playwright |
| L5 | Security Testing | Manual + OWASP ZAP |
| L6 | Performance Testing | k6 |
| L7 | UAT | Manual — QC/HOF/HOD roles |

---

## 4. Test Environments

| Environment | URL | Database | Purpose |
|---|---|---|---|
| Local Dev | http://localhost:5173 | PostgreSQL local | Developer testing |
| Test | http://test.sacl.internal | PostgreSQL test | QA testing |
| Staging | http://staging.sacl.internal | Clone of prod | Pre-release UAT |
| Production | http://sacl.internal | PostgreSQL prod | Live |

---

## 5. Entry / Exit Criteria

### Entry Criteria
- All code committed and build passes
- Database schema migrations applied
- Test data seeded (3 users: QC, HOF, HOD roles)

### Exit Criteria
- All P1 (Critical) test cases pass — 100%
- All P2 (High) test cases pass — 95%
- No open Severity-1 defects
- Performance: API P95 < 500 ms
- Security: No OWASP Top 10 vulnerabilities open

---

## 6. Roles & Responsibilities

| Role | Responsibility |
|---|---|
| QC Engineer | UAT — data entry forms |
| HOF | UAT — approval workflow (HOF level) |
| HOD | UAT — HOD approval + reports + efficiency |
| Admin | UAT — user management, part configuration |
| Dev | Unit & integration test authoring |
| QA | API, E2E, security, performance test authoring |

---

## 7. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| JWT token not invalidated on logout | Medium | High | Server-side token blacklist |
| Threshold bypass via direct API call | Medium | High | Backend validates all inputs |
| locationValues JSON malformed | Low | High | Strict JSON schema validation |
| Concurrent approval race condition | Low | Medium | DB transaction isolation |
| Excel export OOM for large datasets | Low | Medium | Paginate before export |

---

## 8. Defect Severity Classification

| Severity | Description | SLA Resolution |
|---|---|---|
| S1 — Critical | System down, data loss, auth bypass | 4 hours |
| S2 — High | Feature broken, wrong data saved | 24 hours |
| S3 — Medium | UI broken but workaround exists | 72 hours |
| S4 — Low | Cosmetic, minor UX | Next sprint |
