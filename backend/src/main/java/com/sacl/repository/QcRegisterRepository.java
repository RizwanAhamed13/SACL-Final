package com.sacl.repository;

import com.sacl.model.QcRegister;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QcRegisterRepository extends JpaRepository<QcRegister, Long> {

    @Query("SELECT r FROM QcRegister r WHERE " +
           "(:partName IS NULL OR LOWER(r.partName) LIKE LOWER(CONCAT('%',:partName,'%'))) AND " +
           "(:dateCode IS NULL OR LOWER(r.dateCode) LIKE LOWER(CONCAT('%',:dateCode,'%'))) AND " +
           "(:heatCode IS NULL OR LOWER(r.heatCode) LIKE LOWER(CONCAT('%',:heatCode,'%')))")
    List<QcRegister> findByFilters(@Param("partName") String partName,
                                   @Param("dateCode") String dateCode,
                                   @Param("heatCode") String heatCode);
}
