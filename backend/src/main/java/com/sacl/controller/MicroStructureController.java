package com.sacl.controller;

import com.sacl.model.MicroStructureAnalysis;
import com.sacl.service.MicroStructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<MicroStructureAnalysis> create(@RequestBody MicroStructureAnalysis entry) {
        return ResponseEntity.ok(service.save(entry));
    }

    @GetMapping
    public ResponseEntity<List<MicroStructureAnalysis>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MicroStructureAnalysis> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MicroStructureAnalysis> update(@PathVariable Long id, @RequestBody MicroStructureAnalysis entry) {
        entry.setId(id);
        return ResponseEntity.ok(service.save(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
