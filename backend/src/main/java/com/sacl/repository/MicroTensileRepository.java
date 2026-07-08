package com.sacl.repository;

import com.sacl.model.MicroTensileTest;
import com.sacl.model.RecordStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface MicroTensileRepository extends JpaRepository<MicroTensileTest, Long> {

    List<MicroTensileTest> findAll();

    List<MicroTensileTest> findByStatus(RecordStatus status);

    @Query("SELECT r.createdBy, COUNT(r), " +
           "SUM(CASE WHEN r.status = com.sacl.model.RecordStatus.HOF_APPROVED OR r.status = com.sacl.model.RecordStatus.HOD_APPROVED THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN r.status = com.sacl.model.RecordStatus.HOD_APPROVED THEN 1 ELSE 0 END), " +
           "MAX(r.dateOfInspection) " +
           "FROM MicroTensileTest r WHERE r.createdBy IS NOT NULL AND r.createdBy != '' GROUP BY r.createdBy")
    List<Object[]> getEfficiencyStats();

    @Query("SELECT r FROM MicroTensileTest r WHERE " +
           "(:search = '' OR LOWER(r.item) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(r.heatCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(r.dateCode) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:createdBy IS NULL OR r.createdBy = :createdBy)")
    Page<MicroTensileTest> searchByKeyword(@Param("search") String search, @Param("createdBy") String createdBy, Pageable pageable);
}
