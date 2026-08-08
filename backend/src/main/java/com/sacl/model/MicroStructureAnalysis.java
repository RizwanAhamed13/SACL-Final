package com.sacl.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "mcetbcs043_micro_structure_analysis", indexes = {
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
    private String disa;
    private String heatCode;
    private String microLocation;

    // JSON blob storing per-location values for multi-location records
    @Column(length = 4000)
    private String locationValues;

    // Micro Structure
    private String nodularityPercent;
    private String graphiteType;
    private String countNosPerMm2;
    private Double countNosPerMm2Min;
    private Double countNosPerMm2Max;
    private String size;
    private String ferritePercent;
    private String pearlitePercent;
    private String carbidePercent;
    private Double ferritePercentMin;
    private Double ferritePercentMax;
    private Double pearlitePercentMin;
    private Double pearlitePercentMax;
    private Double carbidePercentMin;
    private Double carbidePercentMax;
    private Double sizeMin;
    private Double sizeMax;

    @Column(length = 4000)
    private String remarks;



    private String approvedBy;

    private String hofApprovedBy;
    private String hodApprovedBy;

    @Column(length = 1000)
    private String hodApprovedFields;

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
