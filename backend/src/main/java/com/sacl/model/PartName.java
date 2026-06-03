package com.sacl.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.SQLRestriction;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "part_names")
@SQLRestriction("deleted_at IS NULL")
public class PartName {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    // QC Thresholds (Chemical)
    private Double qcMinC;
    private Double qcMaxC;
    private Double qcMinSi;
    private Double qcMaxSi;
    private Double qcMinMn;
    private Double qcMaxMn;
    private Double qcMinP;
    private Double qcMaxP;
    private Double qcMinS;
    private Double qcMaxS;
    private Double qcMinMg;
    private Double qcMaxMg;
    private Double qcMinCu;
    private Double qcMaxCu;
    private Double qcMinCr;
    private Double qcMaxCr;
    private Double qcMinSn;
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

    // Impact Thresholds
    private Double impactMinSpec;
    private Double impactMaxSpec;

    // Process Parameter Thresholds
    private Double ppMinPouringTemp;
    private Double ppMaxPouringTemp;
    private Double ppMinMgKgs;
    private Double ppMaxMgKgs;
    private Double ppMinStreamInnoculant;
    private Double ppMaxStreamInnoculant;
    private Double ppMinPTimeSec;
    private Double ppMaxPTimeSec;

    // Corrective Addition Thresholds (Kgs)
    private Double corrMinC;
    private Double corrMaxC;
    private Double corrMinSi;
    private Double corrMaxSi;
    private Double corrMinMn;
    private Double corrMaxMn;
    private Double corrMinS;
    private Double corrMaxS;
    private Double corrMinCr;
    private Double corrMaxCr;
    private Double corrMinCu;
    private Double corrMaxCu;
    private Double corrMinSn;
    private Double corrMaxSn;

    private String microLocations;
    private String mechLocations;

    private Boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
