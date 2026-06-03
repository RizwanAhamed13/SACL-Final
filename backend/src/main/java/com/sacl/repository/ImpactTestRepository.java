package com.sacl.repository;

import com.sacl.model.ImpactTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImpactTestRepository extends JpaRepository<ImpactTest, Long> {

    @Query("SELECT r FROM ImpactTest r WHERE " +
           "(:partName IS NULL OR LOWER(r.partName) LIKE LOWER(CONCAT('%',:partName,'%'))) AND " +
           "(:dateCode IS NULL OR LOWER(r.dateCode) LIKE LOWER(CONCAT('%',:dateCode,'%')))")
    List<ImpactTest> findByFilters(@Param("partName") String partName,
                                   @Param("dateCode") String dateCode);
}
