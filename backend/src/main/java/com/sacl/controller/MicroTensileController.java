package com.sacl.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.sacl.dto.PageResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import com.sacl.model.MicroTensileTest;
import org.springframework.security.access.prepost.PreAuthorize;
import com.sacl.service.MicroTensileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/micro-tensile")
@RequiredArgsConstructor
public class MicroTensileController {

    private final MicroTensileService service;
    private final com.sacl.service.RejectedRecordService rejectedService;

    @PreAuthorize("hasAnyRole('HOF','HOD','ADMIN')")
    @PostMapping("/reject/{id}")
    public ResponseEntity<Void> reject(@PathVariable Long id, @RequestParam String rejectedBy) {
        MicroTensileTest entry = service.findById(id);
        if (entry != null) {
            rejectedService.archiveAndReject("TENSILE_TEST", id, entry, rejectedBy, entry.getStatus() != null && entry.getStatus().name().equals("QC_ENTRY") ? "HOF" : "HOD", entry.getCreatedBy());
            service.deleteById(id);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<MicroTensileTest> create(@Valid @RequestBody MicroTensileTest entry) {
        return ResponseEntity.ok(service.save(entry));
    }

    @GetMapping
    public ResponseEntity<PageResponse<MicroTensileTest>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<MicroTensileTest> result = service.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MicroTensileTest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PreAuthorize("hasAnyRole('HOF','HOD','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<MicroTensileTest> update(@PathVariable Long id, @Valid @RequestBody MicroTensileTest entry) {
        entry.setId(id);
        return ResponseEntity.ok(service.save(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
