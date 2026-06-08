package com.sacl.repository;

import com.sacl.model.MicroTensileTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MicroTensileRepository extends JpaRepository<MicroTensileTest, Long> {

    List<MicroTensileTest> findAll();
}
