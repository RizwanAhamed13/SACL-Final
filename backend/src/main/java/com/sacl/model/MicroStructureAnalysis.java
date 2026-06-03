package com.sacl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "micro_structure_analysis", indexes = {
        @Index(name = "idx_micro_part_name", columnList = "partName"),
        @Index(name = "idx_micro_inspection_date", columnList = "inspectionDate")
})
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

    @Lob @Column
    private String remarks;

    private String approvedBy;

    private String hofApprovedBy;
    private String hodApprovedBy;
    private String createdBy;

    @Enumerated(EnumType.STRING)
    private RecordStatus status = RecordStatus.QC_ENTRY;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
