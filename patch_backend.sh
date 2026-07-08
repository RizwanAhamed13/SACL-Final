#!/bin/bash

function patch_repo() {
  local repo_file=$1
  local entity=$2
  sed -i '' -e "/int approveAll/i\\
    @Modifying\\
    @Query(\"UPDATE $entity e SET e.status = :newStatus, e.hodApprovedBy = :approver WHERE e.id IN :ids AND e.status = :oldStatus\")\\
    int updateStatusForIds(@Param(\"newStatus\") RecordStatus newStatus, @Param(\"approver\") String approver, @Param(\"ids\") java.util.List<Long> ids, @Param(\"oldStatus\") RecordStatus oldStatus);\\
" "$repo_file"
}

function patch_service() {
  local service_file=$1
  sed -i '' -e "/public int approveAll/i\\
    @Transactional\\
    public int approveBulk(java.util.List<Long> ids, String approver) {\\
        return repository.updateStatusForIds(RecordStatus.HOD_APPROVED, approver, ids, RecordStatus.HOF_APPROVED);\\
    }\\
" "$service_file"
}

function patch_controller() {
  local controller_file=$1
  sed -i '' -e "/public ResponseEntity.* approveAll/i\\
    @PreAuthorize(\"hasAnyRole('HOD','ADMIN')\")\\
    @PostMapping(\"/approve-bulk\")\\
    public ResponseEntity<?> approveBulk(@RequestBody java.util.List<Long> ids, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {\\
        String approver = userDetails.getUsername();\\
        if (userDetails instanceof com.sacl.security.CustomUserDetails) {\\
            String empId = ((com.sacl.security.CustomUserDetails) userDetails).getEmployeeId();\\
            approver = (empId != null && !empId.isEmpty()) ? empId : approver;\\
        }\\
        int count = service.approveBulk(ids, approver);\\
        return ResponseEntity.ok(java.util.Collections.singletonMap(\"approved\", count));\\
    }\\
" "$controller_file"
}

patch_repo backend/src/main/java/com/sacl/repository/QcRegisterRepository.java QcRegister
patch_repo backend/src/main/java/com/sacl/repository/MicroStructureRepository.java MicroStructureAnalysis
patch_repo backend/src/main/java/com/sacl/repository/MicroTensileRepository.java MicroTensileTest
patch_repo backend/src/main/java/com/sacl/repository/ImpactTestRepository.java ImpactTest

patch_service backend/src/main/java/com/sacl/service/QcRegisterService.java
patch_service backend/src/main/java/com/sacl/service/MicroStructureService.java
patch_service backend/src/main/java/com/sacl/service/MicroTensileService.java
patch_service backend/src/main/java/com/sacl/service/ImpactTestService.java

patch_controller backend/src/main/java/com/sacl/controller/QcRegisterController.java
patch_controller backend/src/main/java/com/sacl/controller/MicroStructureController.java
patch_controller backend/src/main/java/com/sacl/controller/MicroTensileController.java
patch_controller backend/src/main/java/com/sacl/controller/ImpactTestController.java
