# Add Bulk Selection Approval
## Backend Changes
1. **Controllers**: Add `POST /api/{module}/approve-bulk` to `QcRegisterController`, `MicroStructureController`, `MicroTensileController`, and `ImpactTestController`.
2. **Services**: Add `approveBulk(List<Long> ids, String approver)` to update only the provided IDs.
3. **Repositories**: Add `@Query("UPDATE Entity e SET e.status = :newStatus, e.hodApprovedBy = :approver WHERE e.id IN :ids AND e.status = :oldStatus")` to each repository.

## Frontend Changes
1. Add a `selectedIds` state to `QcRegister`, `MicroStructure`, `MicroTensile`, and `ImpactTest`.
2. Add a checkbox column to the tables.
3. Add a "Select All" checkbox in the table header.
4. Update the "Approve All" button to dynamically switch to "Approve Selected (N)" when checkboxes are ticked.
5. On click, call the `/approve-bulk` API with the `selectedIds` array.
