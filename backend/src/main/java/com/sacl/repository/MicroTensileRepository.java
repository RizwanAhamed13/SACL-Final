package com.sacl.repository;

import com.sacl.model.MicroTensileTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MicroTensileRepository extends JpaRepository<MicroTensileTest, Long> {

    List<MicroTensileTest> findAll();

    @Query("SELECT r.createdBy, COUNT(r), " +
           "SUM(CASE WHEN r.status = com.sacl.model.RecordStatus.HOF_APPROVED OR r.status = com.sacl.model.RecordStatus.HOD_APPROVED THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN r.status = com.sacl.model.RecordStatus.HOD_APPROVED THEN 1 ELSE 0 END), " +
           "MAX(r.dateOfInspection) " +
           "FROM MicroTensileTest r WHERE r.createdBy IS NOT NULL AND r.createdBy != '' GROUP BY r.createdBy")
    List<Object[]> getEfficiencyStats();
}
