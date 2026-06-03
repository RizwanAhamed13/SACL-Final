package com.sacl.controller;

import com.sacl.dto.PageResponse;
import com.sacl.model.MicroStructureAnalysis;
import com.sacl.service.MicroStructureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/micro-structure")
@RequiredArgsConstructor
public class MicroStructureController {

    private final MicroStructureService service;
    private final com.sacl.service.RejectedRecordService rejectedService;

    @PostMapping("/reject/{id}")
    public ResponseEntity<Void> reject(@PathVariable Long id, @RequestParam String rejectedBy) {
        MicroStructureAnalysis entry = service.findById(id);
        if (entry != null) {
            rejectedService.archiveAndReject("MICRO_STRUCTURE", id, entry, rejectedBy);
            service.deleteById(id);
        }
        return ResponseEntity.noContent().build();
    }

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

    @GetMapping("/{id}")
    public ResponseEntity<MicroStructureAnalysis> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

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
