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

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE MicroTensileTest r SET r.status = :newStatus, r.hodApprovedBy = :approver WHERE r.id IN :ids AND r.status = :reqStatus")
    int updateStatusForIds(@Param("newStatus") RecordStatus newStatus, @Param("approver") String approver, @Param("ids") List<Long> ids, @Param("reqStatus") RecordStatus reqStatus);

    List<MicroTensileTest> findAll();

    List<MicroTensileTest> findByStatus(RecordStatus status);

    @Query("SELECT r FROM MicroTensileTest r WHERE " +
           "(:search = '' OR LOWER(r.item) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(r.heatCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(r.dateCode) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:createdBy IS NULL OR r.createdBy = :createdBy)")
    Page<MicroTensileTest> searchByKeyword(@Param("search") String search, @Param("createdBy") String createdBy, Pageable pageable);
}
