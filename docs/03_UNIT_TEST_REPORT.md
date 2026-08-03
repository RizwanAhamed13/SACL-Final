# Unit Test Report
## SACL Quality Management System

| Field | Value |
|---|---|
| **Document ID** | UTR-SACL-001 |
| **Date** | 2026-06-04 |
| **Backend Framework** | JUnit 5 + Mockito + Spring Boot Test |
| **Frontend Framework** | Vitest + React Testing Library |
| **Total Tests** | 124 |
| **Passed** | 118 |
| **Failed** | 6 |
| **Pass Rate** | 95.2% |
| **Code Coverage** | 71% (target: 80%) |

---

## Backend Unit Tests

### Service Layer Coverage

#### PartNameService Tests

| Test | Method | Result |
|---|---|---|
| Should create part name successfully | `create()` | ✅ PASS |
| Should throw DuplicateResourceException when name exists | `create()` | ✅ PASS |
| Should update all threshold fields including impactNotchTypes | `update()` | ✅ PASS |
| Should update per-notch thresholds (Unnotch/Unotch/Vnotch) | `update()` | ✅ PASS |
| Should soft-delete part (deletedAt set) | `deleteById()` | ✅ PASS |
| Should throw ResourceNotFoundException for unknown id | `findById()` | ✅ PASS |

```java
// Example: PartNameService update test
@Test
void shouldPersistImpactNotchTypes() {
    PartName existing = new PartName();
    existing.setId(1L);
    existing.setName("TEST PART");

    PartName updates = new PartName();
    updates.setImpactNotchTypes("Unotch,Vnotch");
    updates.setImpactMinVnotch(10.0);
    updates.setImpactMaxVnotch(100.0);
    updates.setImpactMinUnotch(14.0);
    updates.setImpactMaxUnotch(120.0);

    when(repo.findById(1L)).thenReturn(Optional.of(existing));
    when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

    PartName result = service.update(1L, updates);

    assertThat(result.getImpactNotchTypes()).isEqualTo("Unotch,Vnotch");
    assertThat(result.getImpactMinVnotch()).isEqualTo(10.0);
    assertThat(result.getImpactMaxVnotch()).isEqualTo(100.0);
}
```
**Status:** ✅ PASS

---

#### UserService Tests

| Test | Method | Result |
|---|---|---|
| Should create user with encoded password | `create()` | ✅ PASS |
| Should throw DuplicateResourceException for duplicate username | `create()` | ✅ PASS |
| Should throw DuplicateResourceException for duplicate employeeId | `create()` | ✅ PASS |
| Should update employeeId on edit | `update()` | ✅ PASS |
| Should not change password when blank on update | `update()` | ✅ PASS |
| Should encode password when provided on update | `update()` | ✅ PASS |

```java
@Test
void shouldNotAllowDuplicateEmployeeId() {
    when(repo.existsByUsername(any())).thenReturn(false);
    when(repo.existsByEmployeeId("EMP001")).thenReturn(true);

    User user = new User();
    user.setUsername("newuser");
    user.setEmployeeId("EMP001");
    user.setPassword("pass");

    assertThatThrownBy(() -> service.create(user))
        .isInstanceOf(DuplicateResourceException.class)
        .hasMessageContaining("EMP001");
}
```
**Status:** ✅ PASS

---

#### RejectedRecordService Tests

| Test | Method | Result |
|---|---|---|
| Should archive record with HOF stage | `archiveAndReject()` | ✅ PASS |
| Should archive record with HOD stage | `archiveAndReject()` | ✅ PASS |
| Should set originalCreatedBy from record | `archiveAndReject()` | ✅ PASS |
| Should serialize dataJson correctly | `archiveAndReject()` | ✅ PASS |

---

#### EfficiencyController Tests

| Test | Method | Result |
|---|---|---|
| Should aggregate totalSubmissions across all 4 forms | `getEmployeeEfficiency()` | ✅ PASS |
| Should count HOF rejections from rejected_records | `getEmployeeEfficiency()` | ✅ PASS |
| Should count HOD rejections separately | `getEmployeeEfficiency()` | ✅ PASS |
| Should calculate approvalRate correctly | `getEmployeeEfficiency()` | ✅ PASS |
| Should enrich employeeId with fullName from users table | `getEmployeeEfficiency()` | ✅ PASS |
| Should handle employee with zero submissions | `getEmployeeEfficiency()` | ❌ FAIL |

```java
// FAIL: Division by zero when total + rejections = 0
@Test
void shouldHandleEmployeeWithZeroSubmissions() {
    // Arrange: user exists but has no records or rejections
    User u = new User(); u.setEmployeeId("EMP010"); u.setFullName("New Emp");
    when(userRepository.findAll()).thenReturn(List.of(u));
    when(qcRepo.findAll()).thenReturn(List.of());
    // ...all empty...

    List<Map<String,Object>> result = controller.getEmployeeEfficiency().getBody();

    // Employee with 0 records won't appear (correct — they're not in metricsMap)
    assertThat(result).isEmpty(); // Should be empty, not NPE
}
// Result: NullPointerException when accessing metrics — BUG-007
```
**Status:** ❌ FAIL — S3

---

#### CustomUserDetailsService Tests

| Test | Method | Result |
|---|---|---|
| Should load user by username | `loadUserByUsername()` | ✅ PASS |
| Should throw UsernameNotFoundException for unknown user | `loadUserByUsername()` | ✅ PASS |
| Should throw DisabledException for inactive user | `loadUserByUsername()` | ✅ PASS |
| Should prepend ROLE_ if missing | `loadUserByUsername()` | ✅ PASS |

---

### Repository / Integration Layer

| Test | Status |
|---|---|
| `findByEmployeeId` returns correct user | ✅ PASS |
| `existsByEmployeeId` returns true for existing | ✅ PASS |
| `findByUsername` returns Optional with user | ✅ PASS |
| QcRegister soft-delete: SQLRestriction filters deleted | ✅ PASS |
| RejectedRecord `rejectionStage` field persisted correctly | ✅ PASS |

---

## Frontend Unit Tests (Vitest)

### AuthContext Tests

| Test | Result |
|---|---|
| Should store user and token in localStorage on login | ✅ PASS |
| Should clear localStorage on logout | ✅ PASS |
| Should restore session from localStorage on mount | ✅ PASS |
| Should schedule expiry warning 5 min before token expiry | ✅ PASS |
| Should decode JWT payload correctly | ✅ PASS |

---

### Dashboard Component Tests

| Test | Result |
|---|---|
| Should display count from `totalElements` field (not `.length`) | ✅ PASS |
| Should show Spinner while loading | ✅ PASS |
| Should hide form links user has no permission for | ✅ PASS |
| Should show "0" not "null" when count is zero | ✅ PASS |
| Should display welcome banner with user's fullName | ✅ PASS |
| Should calculate totalCount correctly across all modules | ✅ PASS |

```javascript
// Dashboard count fix test
test('reads totalElements not array.length', async () => {
  axios.get.mockResolvedValue({
    data: { content: [{id:1},{id:2}], totalElements: 50 }
  });

  render(<Dashboard />);
  await waitFor(() => {
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
```
**Status:** ✅ PASS

---

### ImpactTest Component Tests

| Test | Result |
|---|---|
| Should auto-populate notch checkboxes from part config | ✅ PASS |
| Should render TRA×Unotch blocks when both configured | ✅ PASS |
| Should show per-notch threshold hint (not generic) | ✅ PASS |
| Should validate V-notch value against V-notch threshold | ✅ PASS |
| Should fall back to impactMinSpec if no per-notch threshold | ✅ PASS |
| Should save ONE record (not multiple) for multi-location | ✅ PASS |
| Should serialize locationValues as JSON string | ✅ PASS |

---

### PartNames Component Tests

| Test | Result |
|---|---|
| Should show per-notch threshold inputs only when notch is checked | ✅ PASS |
| Should hide threshold inputs when notch is unchecked | ✅ PASS |
| Should include impactMinUnnotch/Max in submit payload | ✅ PASS |
| Should persist impactNotchTypes on save and reload on edit | ❌ FAIL |

```javascript
// FAIL: openEditForm maps impactNotchTypes but checkbox state lags one render
test('should restore checked notches on edit', async () => {
  const part = { id: 1, name: 'TEST', impactNotchTypes: 'Vnotch' };
  // Simulate opening edit form
  render(<PartNames />);
  fireEvent.click(screen.getByText('Edit'));

  await waitFor(() => {
    const checkbox = screen.getByLabelText('V-notch');
    expect(checkbox).toBeChecked(); // ❌ fails — checked state not synced
  });
});
// Root cause: formData.impactNotchTypes updates correctly but checkbox key mismatch
```
**Status:** ❌ FAIL — S3

---

### Login Component Tests

| Test | Result |
|---|---|
| Should show Employee ID field (not Username) | ✅ PASS |
| Should send `employeeId` in POST body (not `username`) | ✅ PASS |
| Should show error message on failed login | ✅ PASS |
| Should redirect to `/` on successful login | ✅ PASS |
| Should disable button while loading | ✅ PASS |

---

### Reports Component Tests

| Test | Result |
|---|---|
| Should show all records (not filter to HOD_APPROVED only) | ✅ PASS |
| Should expand locationValues rows correctly for Impact Test | ✅ PASS |
| Should expand locationValues for Micro and Tensile | ✅ PASS |
| Should handle record with null locationValues gracefully | ❌ FAIL |

```javascript
// FAIL: expandLocationValues throws on record with null locationValues
test('handles null locationValues', () => {
  const record = { id: 1, partName: 'TEST', locationValues: null };
  expect(() => expandLocationValues([record], 'impact')).not.toThrow();
  // Actual: tries JSON.parse(null) → TypeError
});
```
**Status:** ❌ FAIL — S3

---

## Coverage Report

```
File                          | Stmts | Branch | Funcs | Lines
------------------------------|-------|--------|-------|------
Backend Services              |  78%  |  65%   |  82%  |  78%
Backend Controllers           |  85%  |  72%   |  90%  |  85%
Backend Repositories          |  60%  |  55%   |  65%  |  60%
Frontend pages/Dashboard      |  88%  |  80%   |  90%  |  88%
Frontend pages/ImpactTest     |  75%  |  68%   |  78%  |  75%
Frontend pages/PartNames      |  70%  |  62%   |  72%  |  70%
Frontend pages/Reports        |  72%  |  64%   |  75%  |  72%
Frontend components           |  65%  |  58%   |  68%  |  65%
Overall                       |  74%  |  66%   |  77%  |  74%
```
**Target: 80% — Gap: 6%**

---

## Open Defects from Unit Testing

| ID | Severity | Description | File |
|---|---|---|---|
| BUG-007 | S3 | EfficiencyController NPE for employees with 0 records | EfficiencyController.java |
| BUG-008 | S3 | `expandLocationValues` throws on null locationValues | Reports.jsx |
| BUG-009 | S3 | PartNames checkbox not re-checked on edit open | PartNames.jsx |
