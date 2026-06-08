package com.sacl.repository;

import com.sacl.model.MicroStructureAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MicroStructureRepository extends JpaRepository<MicroStructureAnalysis, Long> {

    List<MicroStructureAnalysis> findAll();
}
