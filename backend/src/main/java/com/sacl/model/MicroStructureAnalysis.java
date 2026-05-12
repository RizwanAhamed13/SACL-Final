package com.sacl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "micro_structure_analysis")
public class MicroStructureAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate inspectionDate;
    private String partName;
    private String dateCode;
    private String heatCode;

    // Micro Structure
    private Double nodularityPercent;
    private String graphiteType;
    private Double countNosPerMm2;
    private String size;
    private Double ferritePercent;
    private Double pearlitePercent;
    private Double carbidePercent;

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
