package com.sacl.repository;

import com.sacl.model.PerformanceFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PerformanceFeedbackRepository extends JpaRepository<PerformanceFeedback, Long> {
    List<PerformanceFeedback> findByTargetEmployeeIdOrderByCreatedAtDesc(String targetEmployeeId);
}
