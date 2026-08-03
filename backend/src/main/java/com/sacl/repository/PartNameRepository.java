package com.sacl.repository;

import com.sacl.model.PartName;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PartNameRepository extends JpaRepository<PartName, Long> {
    boolean existsByName(String name);
    PartName findByName(String name);
    List<PartName> findByActiveTrueOrderByNameAsc();
}
