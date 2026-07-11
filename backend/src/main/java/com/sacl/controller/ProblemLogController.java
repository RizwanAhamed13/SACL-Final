package com.sacl.controller;

import com.sacl.model.ProblemLog;
import com.sacl.service.ProblemLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problem-log")
@RequiredArgsConstructor
public class ProblemLogController {

    private final ProblemLogService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HOD') or @securityService.hasFormAccess(authentication, 'PROBLEM_LOG')")
    public ResponseEntity<List<ProblemLog>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','HOD') or @securityService.hasFormAccess(authentication, 'PROBLEM_LOG')")
    public ResponseEntity<List<ProblemLog>> search(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(service.search(query));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HOD') or @securityService.hasFormAccess(authentication, 'PROBLEM_LOG')")
    public ResponseEntity<ProblemLog> create(@Valid @RequestBody ProblemLog log,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.create(log, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HOD') or @securityService.hasFormAccess(authentication, 'PROBLEM_LOG')")
    public ResponseEntity<ProblemLog> update(@PathVariable Long id, @Valid @RequestBody ProblemLog log) {
        return ResponseEntity.ok(service.update(id, log));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HOD')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
