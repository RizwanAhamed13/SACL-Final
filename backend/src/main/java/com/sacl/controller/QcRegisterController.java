package com.sacl.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.sacl.dto.PageResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import com.sacl.model.QcRegister;
import org.springframework.security.access.prepost.PreAuthorize;
import com.sacl.service.QcRegisterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qc-register")
@RequiredArgsConstructor
public class QcRegisterController {

    private final QcRegisterService service;

    @PostMapping
    public ResponseEntity<QcRegister> create(@Valid @RequestBody QcRegister entry) {
        return ResponseEntity.ok(service.save(entry));
    }

    @GetMapping
    public ResponseEntity<PageResponse<QcRegister>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<QcRegister> result = service.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<QcRegister>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String createdBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<QcRegister> result = service.search(
                q, createdBy, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QcRegister> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PreAuthorize("hasAnyRole('USER','HOF','HOD','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<QcRegister> update(@PathVariable Long id, @Valid @RequestBody QcRegister entry) {
        entry.setId(id);
        return ResponseEntity.ok(service.save(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
