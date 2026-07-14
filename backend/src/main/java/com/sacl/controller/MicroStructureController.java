package com.sacl.controller;

import com.sacl.dto.PageResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import com.sacl.model.MicroStructureAnalysis;
import org.springframework.security.access.prepost.PreAuthorize;
import com.sacl.service.MicroStructureService;
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
@RequestMapping("/api/micro-structure")
@RequiredArgsConstructor
public class MicroStructureController {

    private final MicroStructureService service;

    @PostMapping
    public ResponseEntity<MicroStructureAnalysis> create(@Valid @RequestBody MicroStructureAnalysis entry) {
        return ResponseEntity.ok(service.save(entry));
    }

    @GetMapping
    public ResponseEntity<PageResponse<MicroStructureAnalysis>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<MicroStructureAnalysis> result = service.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<MicroStructureAnalysis>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String createdBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<MicroStructureAnalysis> result = service.search(
                q, createdBy, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MicroStructureAnalysis> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PreAuthorize("hasAnyRole('HOD','ADMIN')")
    @PostMapping("/approve-bulk")
    public ResponseEntity<?> approveBulk(@RequestBody java.util.List<Long> ids, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        String approver = userDetails.getUsername();
        int count = service.approveBulk(ids, approver);
        return ResponseEntity.ok(java.util.Collections.singletonMap("approved", count));
    }

    @PreAuthorize("hasAnyRole('HOD','ADMIN')")
    @PostMapping("/approve-all")
    public ResponseEntity<java.util.Map<String, Object>> approveAll(@AuthenticationPrincipal UserDetails principal) {
        String approvedBy = principal != null ? principal.getUsername() : "HOD";
        int count = service.approveAll(approvedBy);
        return ResponseEntity.ok(java.util.Map.of("approved", count, "message", count + " records approved"));
    }

    @PreAuthorize("hasAnyRole('USER','HOF','HOD','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<MicroStructureAnalysis> update(@PathVariable Long id, @Valid @RequestBody MicroStructureAnalysis entry) {
        entry.setId(id);
        return ResponseEntity.ok(service.save(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
