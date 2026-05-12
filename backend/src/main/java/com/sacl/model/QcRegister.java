package com.sacl.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "qc_register")
public class QcRegister {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String disa;
    private LocalDate date;
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
    private String streamInnoculant;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private String shiftChemist;
    private String shiftInchargeQc;
    private String hodQc;
    
    private String hofApprovedBy;
    private String hodApprovedBy;
    private String createdBy;
    private String status = "QC_ENTRY"; // QC_ENTRY, HOF_APPROVED, HOD_APPROVED

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
