package com.sacl.controller;

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
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final QcRegisterRepository qcRepo;
    private final MicroStructureRepository microRepo;
    private final MicroTensileRepository tensileRepo;
    private final ImpactTestRepository impactRepo;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(required = false) String partName,
            @RequestParam(required = false) String dateCode,
            @RequestParam(required = false) String heatCode) {

        Map<String, Object> results = new HashMap<>();

        // Filter QC Register
        results.put("qcRegister", qcRepo.findAll().stream()
                .filter(r -> (partName == null || partName.isEmpty() || (r.getPartName() != null && r.getPartName().toLowerCase().contains(partName.toLowerCase()))) &&
                             (dateCode == null || dateCode.isEmpty() || (r.getDateCode() != null && r.getDateCode().toLowerCase().contains(dateCode.toLowerCase()))) &&
                             (heatCode == null || heatCode.isEmpty() || (r.getHeatCode() != null && r.getHeatCode().toLowerCase().contains(heatCode.toLowerCase()))))
                .collect(Collectors.toList()));

        // Filter Micro Structure
        results.put("microStructure", microRepo.findAll().stream()
                .filter(r -> (partName == null || partName.isEmpty() || (r.getPartName() != null && r.getPartName().toLowerCase().contains(partName.toLowerCase()))) &&
                             (dateCode == null || dateCode.isEmpty() || (r.getDateCode() != null && r.getDateCode().toLowerCase().contains(dateCode.toLowerCase()))) &&
                             (heatCode == null || heatCode.isEmpty() || (r.getHeatCode() != null && r.getHeatCode().toLowerCase().contains(heatCode.toLowerCase()))))
                .collect(Collectors.toList()));

        // Filter Micro Tensile
        results.put("microTensile", tensileRepo.findAll().stream()
                .filter(r -> (partName == null || partName.isEmpty() || (r.getItem() != null && r.getItem().toLowerCase().contains(partName.toLowerCase()))) &&
                             (dateCode == null || dateCode.isEmpty() || (r.getDateCode() != null && r.getDateCode().toLowerCase().contains(dateCode.toLowerCase()))) &&
                             (heatCode == null || heatCode.isEmpty() || (r.getHeatCode() != null && r.getHeatCode().toLowerCase().contains(heatCode.toLowerCase()))))
                .collect(Collectors.toList()));

        // Filter Impact Test (Impact test doesn't have heatCode usually, but we'll check)
        results.put("impactTest", impactRepo.findAll().stream()
                .filter(r -> (partName == null || partName.isEmpty() || (r.getPartName() != null && r.getPartName().toLowerCase().contains(partName.toLowerCase()))) &&
                             (dateCode == null || dateCode.isEmpty() || (r.getDateCode() != null && r.getDateCode().toLowerCase().contains(dateCode.toLowerCase()))))
                .collect(Collectors.toList()));

        return ResponseEntity.ok(results);
    }
}
