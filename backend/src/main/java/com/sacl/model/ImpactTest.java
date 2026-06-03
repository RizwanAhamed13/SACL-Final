package com.sacl.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "impact_test", indexes = {
        @Index(name = "idx_impact_part_name", columnList = "partName"),
        @Index(name = "idx_impact_date_of_inspection", columnList = "dateOfInspection")
})
public class ImpactTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateOfInspection;
    private String partName;
    private String dateCode;
    private String specification;

    private Double observedValue1;
    private Double observedValue2;
    private Double observedValue3;
    private String testType;

    @JdbcTypeCode(SqlTypes.LONG32VARCHAR) @Column
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
