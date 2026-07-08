package com.sacl.repository;

import com.sacl.model.MicroStructureAnalysis;
import com.sacl.model.RecordStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface MicroStructureRepository extends JpaRepository<MicroStructureAnalysis, Long> {

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE MicroStructureAnalysis r SET r.status = :newStatus, r.approvedBy = :approver, r.approvedAt = CURRENT_TIMESTAMP WHERE r.id IN :ids AND r.status = :reqStatus")
    int updateStatusForIds(@Param("newStatus") RecordStatus newStatus, @Param("approver") String approver, @Param("ids") List<Long> ids, @Param("reqStatus") RecordStatus reqStatus);

    List<MicroStructureAnalysis> findAll();

    List<MicroStructureAnalysis> findByStatus(RecordStatus status);

    @Query("SELECT r.createdBy, COUNT(r), " +
           "SUM(CASE WHEN r.status = com.sacl.model.RecordStatus.HOF_APPROVED OR r.status = com.sacl.model.RecordStatus.HOD_APPROVED THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN r.status = com.sacl.model.RecordStatus.HOD_APPROVED THEN 1 ELSE 0 END), " +
           "MAX(r.inspectionDate) " +
           "FROM MicroStructureAnalysis r WHERE r.createdBy IS NOT NULL AND r.createdBy != '' GROUP BY r.createdBy")
    List<Object[]> getEfficiencyStats();

    @Query("SELECT r FROM MicroStructureAnalysis r WHERE " +
           "(:search = '' OR LOWER(r.partName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(r.heatCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(r.dateCode) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:createdBy IS NULL OR r.createdBy = :createdBy)")
    Page<MicroStructureAnalysis> searchByKeyword(@Param("search") String search, @Param("createdBy") String createdBy, Pageable pageable);
}
