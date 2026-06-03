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

        String pn = (partName != null && partName.isEmpty()) ? null : partName;
        String dc = (dateCode != null && dateCode.isEmpty()) ? null : dateCode;
        String hc = (heatCode != null && heatCode.isEmpty()) ? null : heatCode;

        Map<String, Object> results = new HashMap<>();
        results.put("qcRegister", qcRepo.findByFilters(pn, dc, hc));
        results.put("microStructure", microRepo.findByFilters(pn, dc, hc));
        results.put("microTensile", tensileRepo.findByFilters(pn, dc, hc));
        results.put("impactTest", impactRepo.findByFilters(pn, dc));

        return ResponseEntity.ok(results);
    }
}
