package com.sacl.repository;

import com.sacl.model.MicroTensileTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MicroTensileRepository extends JpaRepository<MicroTensileTest, Long> {
}
