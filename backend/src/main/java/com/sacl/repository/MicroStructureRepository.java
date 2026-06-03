package com.sacl.repository;

import com.sacl.model.MicroStructureAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MicroStructureRepository extends JpaRepository<MicroStructureAnalysis, Long> {

    @Query("SELECT r FROM MicroStructureAnalysis r WHERE " +
           "(:partName IS NULL OR LOWER(r.partName) LIKE LOWER(CONCAT('%',:partName,'%'))) AND " +
           "(:dateCode IS NULL OR LOWER(r.dateCode) LIKE LOWER(CONCAT('%',:dateCode,'%'))) AND " +
           "(:heatCode IS NULL OR LOWER(r.heatCode) LIKE LOWER(CONCAT('%',:heatCode,'%')))")
    List<MicroStructureAnalysis> findByFilters(@Param("partName") String partName,
                                               @Param("dateCode") String dateCode,
                                               @Param("heatCode") String heatCode);
}
