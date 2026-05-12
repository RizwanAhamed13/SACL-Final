package com.sacl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "micro_tensile_test")
public class MicroTensileTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateOfInspection;
    private String item;
    private String dateCode;
    private String heatCode;

    private Double barDiaMm;
    private Double gaugeLengthMm;
    private Double maxLoadKn;
    private Double yieldLoadKn;
    private Double tensileStrength;
    private Double yieldStrength02;
    private Double yieldStrength05;
    private Double elongationPercent;

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
