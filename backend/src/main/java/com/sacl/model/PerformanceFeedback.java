package com.sacl.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "mcetbcs043_performance_feedback")
public class PerformanceFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String targetEmployeeId;

    @NotBlank
    @Column(nullable = false, length = 1000)
    private String feedbackText;

    @NotBlank
    @Column(nullable = false)
    private String reviewerName;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
