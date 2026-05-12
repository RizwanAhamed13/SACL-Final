package com.sacl.model;

import jakarta.persistence.*;
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
    
    @Column(columnDefinition = "LONGTEXT")
    private String dataJson; // Full record data in JSON format

    private String rejectedBy;
    private LocalDateTime rejectedAt;

    @PrePersist
    protected void onReject() {
        rejectedAt = LocalDateTime.now();
    }
}
