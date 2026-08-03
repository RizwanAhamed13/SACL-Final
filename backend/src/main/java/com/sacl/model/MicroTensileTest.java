package com.sacl.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "mcetbcs043_micro_tensile_test", indexes = {
        @Index(name = "idx_tensile_item", columnList = "item"),
        @Index(name = "idx_tensile_date_of_inspection", columnList = "dateOfInspection")
})
public class MicroTensileTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private LocalDate dateOfInspection;
    private String item;
    private String dateCode;
    private String disa;
    private String heatCode;
    private String mechLocation;

    // JSON blob storing per-location values for multi-location records
    @Column(length = 4000)
    private String locationValues;

    private Double barDiaMm;
    private Double gaugeLengthMm;
    private Double maxLoadKn;
    private Double yieldLoadKn;
    private Double tensileStrength;
    private Double yieldStrength02;
    private Double yieldStrength05;
    private Double elongationPercent;

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
