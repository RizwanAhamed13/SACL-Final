package com.sacl.controller;

import com.sacl.model.ImpactTest;
import com.sacl.service.ImpactTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<ImpactTest> create(@RequestBody ImpactTest entry) {
        return ResponseEntity.ok(service.save(entry));
    }

    @GetMapping
    public ResponseEntity<List<ImpactTest>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImpactTest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImpactTest> update(@PathVariable Long id, @RequestBody ImpactTest entry) {
        entry.setId(id);
        return ResponseEntity.ok(service.save(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
