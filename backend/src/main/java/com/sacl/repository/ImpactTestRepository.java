package com.sacl.repository;

import com.sacl.model.ImpactTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImpactTestRepository extends JpaRepository<ImpactTest, Long> {
}
