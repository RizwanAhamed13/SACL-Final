package com.sacl.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "mcetbcs043_part_names")
@SQLRestriction("deleted_at IS NULL")
public class PartName {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    // QC Thresholds (Chemical)
    @Column(name = "qc_min_c")
    private Double qcMinC;

    @Column(name = "qc_max_c")
    private Double qcMaxC;

    @Column(name = "qc_min_si")
    private Double qcMinSi;

    @Column(name = "qc_max_si")
    private Double qcMaxSi;

    @Column(name = "qc_min_mn")
    private Double qcMinMn;

    @Column(name = "qc_max_mn")
    private Double qcMaxMn;

    @Column(name = "qc_min_p")
    private Double qcMinP;

    @Column(name = "qc_max_p")
    private Double qcMaxP;

    @Column(name = "qc_min_s")
    private Double qcMinS;

    @Column(name = "qc_max_s")
    private Double qcMaxS;

    @Column(name = "qc_min_mg")
    private Double qcMinMg;

    @Column(name = "qc_max_mg")
    private Double qcMaxMg;

    @Column(name = "qc_min_cu")
    private Double qcMinCu;

    @Column(name = "qc_max_cu")
    private Double qcMaxCu;

    @Column(name = "qc_min_cr")
    private Double qcMinCr;

    @Column(name = "qc_max_cr")
    private Double qcMaxCr;

    @Column(name = "qc_min_sn")
    private Double qcMinSn;

    @Column(name = "qc_max_sn")
    private Double qcMaxSn;

    // Micro Thresholds
    private Double microMinNodularity;
    private Double microMaxNodularity;
    private Double microMinCount;
    private Double microMaxCount;
    private String microSize;
    private Double microMinFerrite;
    private Double microMaxFerrite;
    private Double microMinPearlite;
    private Double microMaxPearlite;
    private Double microMinCarbide;
    private Double microMaxCarbide;

    // Tensile Thresholds
    private Double tensileMinStrength;
    private Double tensileMaxStrength;
    private Double tensileMinYield;
    private Double tensileMaxYield;
    private Double tensileMinYield05;
    private Double tensileMaxYield05;
    private Double tensileMinElongation;
    private Double tensileMaxElongation;

    // Impact Thresholds (generic fallback)
    private Double impactMinSpec;
    private Double impactMaxSpec;

    // Impact Notch Types config (comma-separated: "Unotch,Vnotch,Unnotch")
    private String impactNotchTypes;

    // Per-notch impact strength thresholds
    private Double impactMinUnnotch;  private Double impactMaxUnnotch;
    private Double impactMinUnotch;   private Double impactMaxUnotch;
    private Double impactMinVnotch;   private Double impactMaxVnotch;

    // Impact per-combination thresholds (location x notch type)
    private Double impactMinTRAUnotch;  private Double impactMaxTRAUnotch;
    private Double impactMinTRAVnotch;  private Double impactMaxTRAVnotch;
    private Double impactMinTRAUnnotch; private Double impactMaxTRAUnnotch;
    private Double impactMinSBAUnotch;  private Double impactMaxSBAUnotch;
    private Double impactMinSBAVnotch;  private Double impactMaxSBAVnotch;
    private Double impactMinSBAUnnotch; private Double impactMaxSBAUnnotch;

    // Process Parameter Thresholds
    private Double ppMinPouringTemp;
    private Double ppMaxPouringTemp;
    private Double ppMinMgKgs;
    private Double ppMaxMgKgs;
    private Double ppMinStreamInnoculant;
    private Double ppMaxStreamInnoculant;
    @Column(name = "pp_min_p_time_sec")
    private Double ppMinPTimeSec;

    @Column(name = "pp_max_p_time_sec")
    private Double ppMaxPTimeSec;

    private Double ppMinResMgConvertor;
    private Double ppMaxResMgConvertor;
    private Double barDiaMin;
    private Double barDiaMax;
    private Double microSizeMin;
    private Double microSizeMax;

    // Corrective Addition Thresholds (Kgs)
    @Column(name = "corr_min_c")
    private Double corrMinC;

    @Column(name = "corr_max_c")
    private Double corrMaxC;

    private Double corrMinSi;
    private Double corrMaxSi;
    private Double corrMinMn;
    private Double corrMaxMn;

    @Column(name = "corr_min_s")
    private Double corrMinS;

    @Column(name = "corr_max_s")
    private Double corrMaxS;

    private Double corrMinCr;
    private Double corrMaxCr;
    private Double corrMinCu;
    private Double corrMaxCu;
    private Double corrMinSn;
    private Double corrMaxSn;

    private String microLocations;
    private String mechLocations;

    // Material Test Report metadata
    private String customer;
    private String partNo;
    private String revNo;
    private String revDate;
    private String material;
    private String specification;

    private Boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
