package com.sacl.repository;

import com.sacl.model.ProblemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemLogRepository extends JpaRepository<ProblemLog, Long> {

    @Query("SELECT p FROM ProblemLog p WHERE LOWER(p.employeeNo) LIKE LOWER(CONCAT('%', :query, '%')) OR CAST(p.id AS string) LIKE CONCAT('%', :query, '%') ORDER BY p.createdAt DESC")
    List<ProblemLog> searchByEmployeeNoOrId(@Param("query") String query);

    List<ProblemLog> findAllByOrderByCreatedAtDesc();
}
