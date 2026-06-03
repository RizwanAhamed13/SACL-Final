package com.sacl.repository;

import com.sacl.model.MicroTensileTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MicroTensileRepository extends JpaRepository<MicroTensileTest, Long> {

    @Query("SELECT r FROM MicroTensileTest r WHERE " +
           "(:partName IS NULL OR LOWER(r.item) LIKE LOWER(CONCAT('%',:partName,'%'))) AND " +
           "(:dateCode IS NULL OR LOWER(r.dateCode) LIKE LOWER(CONCAT('%',:dateCode,'%'))) AND " +
           "(:heatCode IS NULL OR LOWER(r.heatCode) LIKE LOWER(CONCAT('%',:heatCode,'%')))")
    List<MicroTensileTest> findByFilters(@Param("partName") String partName,
                                         @Param("dateCode") String dateCode,
                                         @Param("heatCode") String heatCode);
}
