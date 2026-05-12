package com.sacl.controller;

import com.sacl.model.PartName;
import com.sacl.service.PartNameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/part-names")
@RequiredArgsConstructor
public class PartNameController {

    private final PartNameService service;

    @GetMapping
    public ResponseEntity<List<PartName>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PartName>> getActive() {
        return ResponseEntity.ok(service.findActive());
    }

    @PostMapping
    public ResponseEntity<PartName> create(@RequestBody PartName part) {
        return ResponseEntity.ok(service.create(part));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartName> update(@PathVariable Long id, @RequestBody PartName part) {
        return ResponseEntity.ok(service.update(id, part));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
