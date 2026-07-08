package com.sacl.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.sacl.dto.PageResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import com.sacl.model.ImpactTest;
import org.springframework.security.access.prepost.PreAuthorize;
import com.sacl.service.ImpactTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/impact-test")
@RequiredArgsConstructor
public class ImpactTestController {

    private final ImpactTestService service;

    @PostMapping
    public ResponseEntity<ImpactTest> create(@Valid @RequestBody ImpactTest entry) {
        return ResponseEntity.ok(service.save(entry));
    }

    @GetMapping
    public ResponseEntity<PageResponse<ImpactTest>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<ImpactTest> result = service.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<ImpactTest>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String createdBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<ImpactTest> result = service.search(
                q, createdBy, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImpactTest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PreAuthorize("hasAnyRole('HOD','ADMIN')")
    @PostMapping("/approve-all")
    @PreAuthorize("hasAnyRole('HOD','ADMIN')")
    @PostMapping("/approve-bulk")
    public ResponseEntity<?> approveBulk(@RequestBody java.util.List<Long> ids, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        String approver = userDetails.getUsername();
        if (userDetails instanceof com.sacl.security.CustomUserDetails) {
            String empId = ((com.sacl.security.CustomUserDetails) userDetails).getEmployeeId();
            approver = (empId != null && !empId.isEmpty()) ? empId : approver;
        }
        int count = service.approveBulk(ids, approver);
        return ResponseEntity.ok(java.util.Collections.singletonMap("approved", count));
    }

    public ResponseEntity<java.util.Map<String, Object>> approveAll(@AuthenticationPrincipal UserDetails principal) {
        String approvedBy = principal != null ? principal.getUsername() : "HOD";
        int count = service.approveAll(approvedBy);
        return ResponseEntity.ok(java.util.Map.of("approved", count, "message", count + " records approved"));
    }

    @PreAuthorize("hasAnyRole('USER','HOF','HOD','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ImpactTest> update(@PathVariable Long id, @Valid @RequestBody ImpactTest entry) {
        entry.setId(id);
        return ResponseEntity.ok(service.save(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
