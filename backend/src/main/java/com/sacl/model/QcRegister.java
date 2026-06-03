package com.sacl.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "qc_register", indexes = {
        @Index(name = "idx_qc_part_name", columnList = "partName"),
        @Index(name = "idx_qc_date", columnList = "date"),
        @Index(name = "idx_qc_date_code", columnList = "dateCode")
})
public class QcRegister {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String disa;
    private LocalDate date;

    @NotBlank
    private String partName;

    private String dateCode;
    private String heatCode;
    private Integer qtyMoulds;

    // Metal Composition (%)
    private Double compositionC;
    private Double compositionSi;
    private Double compositionMn;
    private Double compositionP;
    private Double compositionS;
    private Double compositionMgFl;
    private Double compositionCu;
    private Double compositionCr;
    private Double compositionSn;

    private String timeOfPouring;
    private Double pouringTemp;
    private String ppCode;
    private String treatmentNo;
    private String fcNoHeatNo;
    private String conNo;
    private String tappingTime;

    // Corrective Addition (Kgs)
    private Double correctiveC;
    private Double correctiveSi;
    private Double correctiveMn;
    private Double correctiveS;
    private Double correctiveCr;
    private Double correctiveCu;
    private Double correctiveSn;

    private Double tappingWtKgs;
    private Double mgKgs;
    private Double resMgConvertorPercent;
    private Double recMgPercent;
    private Double streamInnoculant;
    private Double pTimeSec;
    private Double pouringTempStart;
    private Double pouringTempEnd;
    private Double pTimeSecStart;
    private Double pTimeSecEnd;

    @JdbcTypeCode(SqlTypes.LONG32VARCHAR) @Column
    private String remarks;

    private String hodQc;

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
