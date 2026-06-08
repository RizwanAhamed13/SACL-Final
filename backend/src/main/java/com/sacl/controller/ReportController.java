package com.sacl.controller;

import com.sacl.model.ImpactTest;
import com.sacl.model.MicroStructureAnalysis;
import com.sacl.model.MicroTensileTest;
import com.sacl.model.QcRegister;
import com.sacl.repository.ImpactTestRepository;
import com.sacl.repository.MicroStructureRepository;
import com.sacl.repository.MicroTensileRepository;
import com.sacl.repository.QcRegisterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final QcRegisterRepository qcRepo;
    private final MicroStructureRepository microRepo;
    private final MicroTensileRepository tensileRepo;
    private final ImpactTestRepository impactRepo;

    private boolean hasValue(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private boolean matchesAny(String value, String... filters) {
        if (value == null) return false;
        String v = value.toLowerCase();
        for (String f : filters) {
            if (hasValue(f) && v.contains(f.trim().toLowerCase())) return true;
        }
        return false;
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(required = false) String partName,
            @RequestParam(required = false) String dateCode,
            @RequestParam(required = false) String heatCode) {

        boolean anyFilter = hasValue(partName) || hasValue(dateCode) || hasValue(heatCode);

        // QC Register
        List<QcRegister> qc = qcRepo.findAll().stream()
            .filter(r -> !anyFilter ||
                matchesAny(r.getPartName(), partName) ||
                matchesAny(r.getDateCode(), dateCode) ||
                matchesAny(r.getHeatCode(), heatCode))
            .collect(Collectors.toList());

        // Micro Structure
        List<MicroStructureAnalysis> micro = microRepo.findAll().stream()
            .filter(r -> !anyFilter ||
                matchesAny(r.getPartName(), partName) ||
                matchesAny(r.getDateCode(), dateCode) ||
                matchesAny(r.getHeatCode(), heatCode))
            .collect(Collectors.toList());

        // Tensile Test
        List<MicroTensileTest> tensile = tensileRepo.findAll().stream()
            .filter(r -> !anyFilter ||
                matchesAny(r.getItem(), partName) ||
                matchesAny(r.getDateCode(), dateCode) ||
                matchesAny(r.getHeatCode(), heatCode))
            .collect(Collectors.toList());

        // Impact Test (no heatCode field)
        List<ImpactTest> impact = impactRepo.findAll().stream()
            .filter(r -> !anyFilter ||
                matchesAny(r.getPartName(), partName) ||
                matchesAny(r.getDateCode(), dateCode))
            .collect(Collectors.toList());

        Map<String, Object> results = new HashMap<>();
        results.put("qcRegister", qc);
        results.put("microStructure", micro);
        results.put("microTensile", tensile);
        results.put("impactTest", impact);

        return ResponseEntity.ok(results);
    }
}
