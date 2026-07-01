package com.sacl.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "mcetbcs043_qc_register", indexes = {
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
    @Column(name = "composition_c")
    private Double compositionC;

    @Column(name = "composition_si")
    private Double compositionSi;

    @Column(name = "composition_mn")
    private Double compositionMn;

    @Column(name = "composition_p")
    private Double compositionP;

    @Column(name = "composition_s")
    private Double compositionS;

    @Column(name = "composition_mg_first")
    private Double compositionMgFirst;

    @Column(name = "composition_mg_last")
    private Double compositionMgLast;

    @Column(name = "composition_cu")
    private Double compositionCu;

    @Column(name = "composition_cr")
    private Double compositionCr;

    @Column(name = "composition_sn")
    private Double compositionSn;

    private String timeOfPouringStart;
    private String timeOfPouringEnd;
    private Double pouringTemp;
    private String ppCode;
    private String treatmentNo;
    private String fcNoHeatNo;
    private String conNo;
    private String tappingTime;

    // Corrective Addition (Kgs)
    @Column(name = "corrective_c")
    private Double correctiveC;

    @Column(name = "corrective_si")
    private Double correctiveSi;

    @Column(name = "corrective_mn")
    private Double correctiveMn;

    @Column(name = "corrective_s")
    private Double correctiveS;

    @Column(name = "corrective_cr")
    private Double correctiveCr;

    @Column(name = "corrective_cu")
    private Double correctiveCu;

    @Column(name = "corrective_sn")
    private Double correctiveSn;

    private Double tappingWtKgs;
    private Double mgKgs;
    private Double resMgConvertorPercent;
    private Double recMgPercent;
    private Double streamInnoculant;

    @JsonProperty("pTimeSec")
    @JsonAlias("ptimeSec")
    private Double pTimeSec;
    private Double pouringTempStart;
    private Double pouringTempEnd;

    @JsonProperty("pTimeSecStart")
    @JsonAlias("ptimeSecStart")
    private Double pTimeSecStart;

    @JsonProperty("pTimeSecEnd")
    @JsonAlias("ptimeSecEnd")
    private Double pTimeSecEnd;

    @Column(length = 4000)
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
