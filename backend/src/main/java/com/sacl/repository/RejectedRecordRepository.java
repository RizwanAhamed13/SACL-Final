package com.sacl.repository;

import com.sacl.model.RejectedRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RejectedRecordRepository extends JpaRepository<RejectedRecord, Long> {
}
