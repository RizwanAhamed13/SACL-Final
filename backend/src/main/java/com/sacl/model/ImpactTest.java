package com.sacl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "impact_test")
public class ImpactTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateOfInspection;
    private String partName;
    private String dateCode;
    private String specification;

    private Double observedValue1;
    private Double observedValue2;
    private Double observedValue3;
    private String testType;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private String approvedBy;
    
    private String hofApprovedBy;
    private String hodApprovedBy;
    private String createdBy;
    private String status = "QC_ENTRY";

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
