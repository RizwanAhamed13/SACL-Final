package com.sacl.repository;

import com.sacl.model.QcRegister;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QcRegisterRepository extends JpaRepository<QcRegister, Long> {

    List<QcRegister> findAll();
}
