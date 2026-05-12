package com.sacl.repository;

import com.sacl.model.MicroStructureAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MicroStructureRepository extends JpaRepository<MicroStructureAnalysis, Long> {
}
