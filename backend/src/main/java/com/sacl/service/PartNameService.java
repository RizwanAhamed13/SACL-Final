package com.sacl.service;

import com.sacl.exception.DuplicateResourceException;
import com.sacl.exception.ResourceNotFoundException;
import com.sacl.model.PartName;
import com.sacl.repository.PartNameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PartNameService {

    private final PartNameRepository repo;

    public List<PartName> findAll() { return repo.findAll(); }

    public List<PartName> findActive() { return repo.findByActiveTrueOrderByNameAsc(); }

    public PartName findById(Long id) {
        return repo.findById(id).orElseThrow(() -> {
            log.warn("Part not found: {}", id);
            return new ResourceNotFoundException("Part not found: " + id);
        });
    }

    public PartName findByName(String name) {
        return repo.findByName(name);
    }

    @Transactional
    public PartName create(PartName part) {
        if (repo.existsByName(part.getName())) {
            log.warn("Part name already exists: {}", part.getName());
            throw new DuplicateResourceException("Part name already exists: " + part.getName());
        }
        PartName saved = repo.save(part);
        log.info("Part name created: {}", saved.getName());
        return saved;
    }

    @Transactional
    public PartName update(Long id, PartName updates) {
        PartName existing = findById(id);
        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setActive(updates.getActive() != null ? updates.getActive() : existing.getActive());
        existing.setMicroLocations(updates.getMicroLocations());
        existing.setMechLocations(updates.getMechLocations());

        // QC Thresholds
        existing.setQcMinC(updates.getQcMinC()); existing.setQcMaxC(updates.getQcMaxC());
        existing.setQcMinSi(updates.getQcMinSi()); existing.setQcMaxSi(updates.getQcMaxSi());
        existing.setQcMinMn(updates.getQcMinMn()); existing.setQcMaxMn(updates.getQcMaxMn());
        existing.setQcMinP(updates.getQcMinP()); existing.setQcMaxP(updates.getQcMaxP());
        existing.setQcMinS(updates.getQcMinS()); existing.setQcMaxS(updates.getQcMaxS());
        existing.setQcMinMg(updates.getQcMinMg()); existing.setQcMaxMg(updates.getQcMaxMg());
        existing.setQcMinCu(updates.getQcMinCu()); existing.setQcMaxCu(updates.getQcMaxCu());
        existing.setQcMinCr(updates.getQcMinCr()); existing.setQcMaxCr(updates.getQcMaxCr());
        existing.setQcMinSn(updates.getQcMinSn()); existing.setQcMaxSn(updates.getQcMaxSn());

        // Micro Thresholds
        existing.setMicroMinNodularity(updates.getMicroMinNodularity()); existing.setMicroMaxNodularity(updates.getMicroMaxNodularity());
        existing.setMicroMinCount(updates.getMicroMinCount()); existing.setMicroMaxCount(updates.getMicroMaxCount());
        existing.setMicroSize(updates.getMicroSize());
        existing.setMicroMinFerrite(updates.getMicroMinFerrite()); existing.setMicroMaxFerrite(updates.getMicroMaxFerrite());
        existing.setMicroMinPearlite(updates.getMicroMinPearlite()); existing.setMicroMaxPearlite(updates.getMicroMaxPearlite());
        existing.setMicroMinCarbide(updates.getMicroMinCarbide()); existing.setMicroMaxCarbide(updates.getMicroMaxCarbide());

        // Tensile Thresholds
        existing.setTensileMinStrength(updates.getTensileMinStrength()); existing.setTensileMaxStrength(updates.getTensileMaxStrength());
        existing.setTensileMinYield(updates.getTensileMinYield()); existing.setTensileMaxYield(updates.getTensileMaxYield());
        existing.setTensileMinYield05(updates.getTensileMinYield05()); existing.setTensileMaxYield05(updates.getTensileMaxYield05());
        existing.setTensileMinElongation(updates.getTensileMinElongation()); existing.setTensileMaxElongation(updates.getTensileMaxElongation());

        // Impact Thresholds
        existing.setImpactMinSpec(updates.getImpactMinSpec()); existing.setImpactMaxSpec(updates.getImpactMaxSpec());
        existing.setImpactNotchTypes(updates.getImpactNotchTypes());
        existing.setImpactMinTRAUnotch(updates.getImpactMinTRAUnotch()); existing.setImpactMaxTRAUnotch(updates.getImpactMaxTRAUnotch());
        existing.setImpactMinTRAVnotch(updates.getImpactMinTRAVnotch()); existing.setImpactMaxTRAVnotch(updates.getImpactMaxTRAVnotch());
        existing.setImpactMinTRAUnnotch(updates.getImpactMinTRAUnnotch()); existing.setImpactMaxTRAUnnotch(updates.getImpactMaxTRAUnnotch());
        existing.setImpactMinSBAUnotch(updates.getImpactMinSBAUnotch()); existing.setImpactMaxSBAUnotch(updates.getImpactMaxSBAUnotch());
        existing.setImpactMinSBAVnotch(updates.getImpactMinSBAVnotch()); existing.setImpactMaxSBAVnotch(updates.getImpactMaxSBAVnotch());
        existing.setImpactMinSBAUnnotch(updates.getImpactMinSBAUnnotch()); existing.setImpactMaxSBAUnnotch(updates.getImpactMaxSBAUnnotch());
        existing.setBarDiaMin(updates.getBarDiaMin()); existing.setBarDiaMax(updates.getBarDiaMax());
        existing.setMicroSizeMin(updates.getMicroSizeMin()); existing.setMicroSizeMax(updates.getMicroSizeMax());

        // Process Parameter Thresholds
        existing.setPpMinPouringTemp(updates.getPpMinPouringTemp()); existing.setPpMaxPouringTemp(updates.getPpMaxPouringTemp());
        existing.setPpMinMgKgs(updates.getPpMinMgKgs()); existing.setPpMaxMgKgs(updates.getPpMaxMgKgs());
        existing.setPpMinStreamInnoculant(updates.getPpMinStreamInnoculant()); existing.setPpMaxStreamInnoculant(updates.getPpMaxStreamInnoculant());
        existing.setPpMinPTimeSec(updates.getPpMinPTimeSec()); existing.setPpMaxPTimeSec(updates.getPpMaxPTimeSec());
        existing.setPpMinResMgConvertor(updates.getPpMinResMgConvertor()); existing.setPpMaxResMgConvertor(updates.getPpMaxResMgConvertor());

        // Corrective Addition Thresholds
        existing.setCorrMinC(updates.getCorrMinC()); existing.setCorrMaxC(updates.getCorrMaxC());
        existing.setCorrMinSi(updates.getCorrMinSi()); existing.setCorrMaxSi(updates.getCorrMaxSi());
        existing.setCorrMinMn(updates.getCorrMinMn()); existing.setCorrMaxMn(updates.getCorrMaxMn());
        existing.setCorrMinS(updates.getCorrMinS()); existing.setCorrMaxS(updates.getCorrMaxS());
        existing.setCorrMinCr(updates.getCorrMinCr()); existing.setCorrMaxCr(updates.getCorrMaxCr());
        existing.setCorrMinCu(updates.getCorrMinCu()); existing.setCorrMaxCu(updates.getCorrMaxCu());
        existing.setCorrMinSn(updates.getCorrMinSn()); existing.setCorrMaxSn(updates.getCorrMaxSn());

        PartName saved = repo.save(existing);
        log.info("Part name updated: {}", saved.getName());
        return saved;
    }

    @Transactional
    public void deleteById(Long id) {
        PartName part = findById(id);
        part.setDeletedAt(LocalDateTime.now());
        repo.save(part);
        log.info("Part name soft-deleted: {}", id);
    }
}
