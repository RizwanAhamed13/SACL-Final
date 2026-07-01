package com.sacl.controller;

import com.sacl.model.PerformanceFeedback;
import com.sacl.repository.PerformanceFeedbackRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance-feedback")
@RequiredArgsConstructor
public class PerformanceFeedbackController {

    private final PerformanceFeedbackRepository repository;

    @PreAuthorize("hasAnyRole('HOF','HOD','ADMIN')")
    @GetMapping("/{employeeId}")
    public ResponseEntity<List<PerformanceFeedback>> getFeedback(@PathVariable String employeeId) {
        return ResponseEntity.ok(repository.findByTargetEmployeeIdOrderByCreatedAtDesc(employeeId));
    }

    @PreAuthorize("hasAnyRole('HOF','HOD','ADMIN')")
    @PostMapping
    public ResponseEntity<PerformanceFeedback> createFeedback(@Valid @RequestBody PerformanceFeedback feedback) {
        return ResponseEntity.ok(repository.save(feedback));
    }
}
