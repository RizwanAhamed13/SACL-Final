package com.sacl.repository;

import com.sacl.model.QcRegister;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QcRegisterRepository extends JpaRepository<QcRegister, Long> {
}
