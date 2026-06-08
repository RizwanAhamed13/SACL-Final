package com.sacl.repository;

import com.sacl.model.ImpactTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImpactTestRepository extends JpaRepository<ImpactTest, Long> {

    List<ImpactTest> findAll();
}
