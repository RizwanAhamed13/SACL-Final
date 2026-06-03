package com.sacl.controller;

import com.sacl.dto.PageResponse;
import com.sacl.model.ImpactTest;
import com.sacl.service.ImpactTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/impact-test")
@RequiredArgsConstructor
public class ImpactTestController {

    private final ImpactTestService service;
    private final com.sacl.service.RejectedRecordService rejectedService;

    @PostMapping("/reject/{id}")
    public ResponseEntity<Void> reject(@PathVariable Long id, @RequestParam String rejectedBy) {
        ImpactTest entry = service.findById(id);
        if (entry != null) {
            rejectedService.archiveAndReject("IMPACT_TEST", id, entry, rejectedBy);
            service.deleteById(id);
        }
        return ResponseEntity.noContent().build();
    }

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

    @GetMapping("/{id}")
    public ResponseEntity<ImpactTest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

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
