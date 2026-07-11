package com.sacl.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "mcetbcs043_problem_log", indexes = {
        @Index(name = "idx_problem_employee", columnList = "employeeNo")
})
public class ProblemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String employeeNo;

    @NotBlank
    @Column(nullable = false)
    private String problem;

    @NotBlank
    @Column(nullable = false)
    private String partName;

    private String heatCode;

    private Integer qty;

    private String status;

    private String reason;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private String createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
