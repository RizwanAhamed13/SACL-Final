package com.sacl.service;

import com.sacl.model.PartName;
import com.sacl.repository.PartNameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PartNameService {

    private final PartNameRepository repo;

    public List<PartName> findAll() { return repo.findAll(); }

    public List<PartName> findActive() { return repo.findByActiveTrueOrderByNameAsc(); }

    public PartName findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Part not found: " + id));
    }

    public PartName findByName(String name) {
        return repo.findByName(name);
    }

    public PartName create(PartName part) {
        if (repo.existsByName(part.getName())) {
            throw new RuntimeException("Part name already exists: " + part.getName());
        }
        return repo.save(part);
    }

    public PartName update(Long id, PartName updates) {
        PartName existing = findById(id);
        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setActive(updates.getActive() != null ? updates.getActive() : existing.getActive());
        
        // QC Thresholds
        existing.setQcMinC(updates.getQcMinC());
        existing.setQcMaxC(updates.getQcMaxC());
        existing.setQcMinSi(updates.getQcMinSi());
        existing.setQcMaxSi(updates.getQcMaxSi());
        existing.setQcMinMn(updates.getQcMinMn());
        existing.setQcMaxMn(updates.getQcMaxMn());
        existing.setQcMaxP(updates.getQcMaxP());
        existing.setQcMaxS(updates.getQcMaxS());
        existing.setQcMinMg(updates.getQcMinMg());
        existing.setQcMaxMg(updates.getQcMaxMg());
        existing.setQcMaxCu(updates.getQcMaxCu());
        existing.setQcMaxCr(updates.getQcMaxCr());
        existing.setQcMaxSn(updates.getQcMaxSn());

        // Micro
        existing.setMicroMinNodularity(updates.getMicroMinNodularity());
        existing.setMicroMinCount(updates.getMicroMinCount());
        existing.setMicroSize(updates.getMicroSize());
        existing.setMicroMaxFerrite(updates.getMicroMaxFerrite());
        existing.setMicroMinPearlite(updates.getMicroMinPearlite());
        existing.setMicroMaxPearlite(updates.getMicroMaxPearlite());
        existing.setMicroMaxCarbide(updates.getMicroMaxCarbide());

        // Tensile
        existing.setTensileMinStrength(updates.getTensileMinStrength());
        existing.setTensileMinYield(updates.getTensileMinYield());
        existing.setTensileMinElongation(updates.getTensileMinElongation());

        // Impact
        existing.setImpactMinSpec(updates.getImpactMinSpec());

        return repo.save(existing);
    }

    public void deleteById(Long id) { repo.deleteById(id); }
}
