package com.sacl.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "rejected_records")
public class RejectedRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String formType; // e.g., "QC_REGISTER", "IMPACT_TEST"
    private Long originalId;
    
    @JdbcTypeCode(SqlTypes.LONG32VARCHAR)
    @Column
    private String dataJson; // Full record data in JSON format

    private String rejectedBy;
    private LocalDateTime rejectedAt;

    @PrePersist
    protected void onReject() {
        rejectedAt = LocalDateTime.now();
    }
}
