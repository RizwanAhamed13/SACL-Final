package com.sacl.controller;

import com.sacl.model.MicroTensileTest;
import com.sacl.service.MicroTensileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/micro-tensile")
@RequiredArgsConstructor
public class MicroTensileController {

    private final MicroTensileService service;
    private final com.sacl.service.RejectedRecordService rejectedService;

    @PostMapping("/reject/{id}")
    public ResponseEntity<Void> reject(@PathVariable Long id, @RequestParam String rejectedBy) {
        MicroTensileTest entry = service.findById(id);
        if (entry != null) {
            rejectedService.archiveAndReject("TENSILE_TEST", id, entry, rejectedBy);
            service.deleteById(id);
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<MicroTensileTest> create(@RequestBody MicroTensileTest entry) {
        return ResponseEntity.ok(service.save(entry));
    }

    @GetMapping
    public ResponseEntity<List<MicroTensileTest>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MicroTensileTest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MicroTensileTest> update(@PathVariable Long id, @RequestBody MicroTensileTest entry) {
        entry.setId(id);
        return ResponseEntity.ok(service.save(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
