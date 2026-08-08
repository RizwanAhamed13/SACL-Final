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
    private String compositionC;

    @Column(name = "composition_si")
    private String compositionSi;

    @Column(name = "composition_mn")
    private String compositionMn;

    @Column(name = "composition_p")
    private String compositionP;

    @Column(name = "composition_s")
    private String compositionS;

    @Column(name = "composition_mg_first")
    private String compositionMgFirst;

    @Column(name = "composition_mg_last")
    private String compositionMgLast;

    @Column(name = "composition_cu")
    private String compositionCu;

    @Column(name = "composition_cr")
    private String compositionCr;

    @Column(name = "composition_sn")
    private String compositionSn;

    private String timeOfPouringStart;
    private String timeOfPouringEnd;
    private String pouringTemp;
    private String ppCode;
    private String treatmentNo;
    private String fcNoHeatNo;
    private String conNo;
    private String tappingTime;

    // Corrective Addition (Kgs)
    @Column(name = "corrective_c")
    private String correctiveC;

    @Column(name = "corrective_si")
    private String correctiveSi;

    @Column(name = "corrective_mn")
    private String correctiveMn;

    @Column(name = "corrective_s")
    private String correctiveS;

    @Column(name = "corrective_cr")
    private String correctiveCr;

    @Column(name = "corrective_cu")
    private String correctiveCu;

    @Column(name = "corrective_sn")
    private String correctiveSn;

    private String tappingWtKgs;
    private String mgKgs;
    private String resMgConvertorPercent;
    private String recMgPercent;
    private String streamInnoculant;

    @JsonProperty("pTimeSec")
    @JsonAlias("ptimeSec")
    private String pTimeSec;
    private String pouringTempStart;
    private String pouringTempEnd;

    @JsonProperty("pTimeSecStart")
    @JsonAlias("ptimeSecStart")
    private String pTimeSecStart;

    @JsonProperty("pTimeSecEnd")
    @JsonAlias("ptimeSecEnd")
    private String pTimeSecEnd;

    @Column(length = 4000)
    private String remarks;



    private String hodQc;

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
