package com.sacl.controller;

import com.sacl.model.ImpactTest;
import com.sacl.model.MicroStructureAnalysis;
import com.sacl.model.MicroTensileTest;
import com.sacl.model.QcRegister;
import com.sacl.model.RecordStatus;
import com.sacl.model.PartName;
import com.sacl.repository.PartNameRepository;
import com.sacl.repository.ImpactTestRepository;
import com.sacl.repository.MicroStructureRepository;
import com.sacl.repository.MicroTensileRepository;
import com.sacl.repository.QcRegisterRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
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
    private final PartNameRepository partNameRepo;
    private final ObjectMapper objectMapper;

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
            .filter(r -> r.getStatus() == RecordStatus.HOD_APPROVED &&
                         (!hasValue(partName) || matchesAny(r.getPartName(), partName)) &&
                         (!hasValue(dateCode) || matchesAny(r.getDateCode(), dateCode)) &&
                         (!hasValue(heatCode) || matchesAny(r.getHeatCode(), heatCode)))
            .collect(Collectors.toList());

        // Micro Structure
        List<MicroStructureAnalysis> micro = microRepo.findAll().stream()
            .filter(r -> r.getStatus() == RecordStatus.HOD_APPROVED &&
                         (!hasValue(partName) || matchesAny(r.getPartName(), partName)) &&
                         (!hasValue(dateCode) || matchesAny(r.getDateCode(), dateCode)) &&
                         (!hasValue(heatCode) || matchesAny(r.getHeatCode(), heatCode)))
            .collect(Collectors.toList());

        // Tensile Test
        List<MicroTensileTest> tensile = tensileRepo.findAll().stream()
            .filter(r -> r.getStatus() == RecordStatus.HOD_APPROVED &&
                         (!hasValue(partName) || matchesAny(r.getItem(), partName)) &&
                         (!hasValue(dateCode) || matchesAny(r.getDateCode(), dateCode)) &&
                         (!hasValue(heatCode) || matchesAny(r.getHeatCode(), heatCode)))
            .collect(Collectors.toList());

        // Impact Test (no heatCode field)
        List<ImpactTest> impact = impactRepo.findAll().stream()
            .filter(r -> r.getStatus() == RecordStatus.HOD_APPROVED &&
                         (!hasValue(partName) || matchesAny(r.getPartName(), partName)) &&
                         (!hasValue(dateCode) || matchesAny(r.getDateCode(), dateCode)))
            .collect(Collectors.toList());

        Map<String, Object> results = new HashMap<>();
        results.put("qcRegister", qc);
        results.put("microStructure", micro);
        results.put("microTensile", tensile);
        results.put("impactTest", impact);

        return ResponseEntity.ok(results);
    }

    @GetMapping("/material-test-report")
    public ResponseEntity<Map<String, Object>> getMaterialTestReport(
            @RequestParam String partName,
            @RequestParam String dateCode) {

        PartName part = partNameRepo.findByName(partName);
        
        // 1. Fetch QC Register records (HOD APPROVED)
        List<QcRegister> qcRecords = qcRepo.findAll().stream()
            .filter(r -> r.getStatus() == RecordStatus.HOD_APPROVED &&
                         r.getPartName().equalsIgnoreCase(partName) &&
                         r.getDateCode().equalsIgnoreCase(dateCode))
            .collect(Collectors.toList());

        // 2. Fetch Micro Structure records (HOD APPROVED)
        List<MicroStructureAnalysis> microRecords = microRepo.findAll().stream()
            .filter(r -> r.getStatus() == RecordStatus.HOD_APPROVED &&
                         r.getPartName().equalsIgnoreCase(partName) &&
                         r.getDateCode().equalsIgnoreCase(dateCode))
            .collect(Collectors.toList());

        // 3. Fetch Tensile records (HOD APPROVED)
        List<MicroTensileTest> tensileRecords = tensileRepo.findAll().stream()
            .filter(r -> r.getStatus() == RecordStatus.HOD_APPROVED &&
                         r.getItem().equalsIgnoreCase(partName) &&
                         r.getDateCode().equalsIgnoreCase(dateCode))
            .collect(Collectors.toList());

        // Chemistry values lists
        List<String> listC = new ArrayList<>();
        List<String> listSi = new ArrayList<>();
        List<String> listMn = new ArrayList<>();
        List<String> listP = new ArrayList<>();
        List<String> listS = new ArrayList<>();
        List<String> listCu = new ArrayList<>();
        List<String> listCr = new ArrayList<>();

        for (QcRegister r : qcRecords) {
            if (hasValue(r.getCompositionC())) listC.add(r.getCompositionC());
            if (hasValue(r.getCompositionSi())) listSi.add(r.getCompositionSi());
            if (hasValue(r.getCompositionMn())) listMn.add(r.getCompositionMn());
            if (hasValue(r.getCompositionP())) listP.add(r.getCompositionP());
            if (hasValue(r.getCompositionS())) listS.add(r.getCompositionS());
            if (hasValue(r.getCompositionCu())) listCu.add(r.getCompositionCu());
            if (hasValue(r.getCompositionCr())) listCr.add(r.getCompositionCr());
        }

        // Microstructure values
        List<String> graphiteTypes = new ArrayList<>();
        List<String> listSize = new ArrayList<>();
        List<String> listFerrite = new ArrayList<>();

        for (MicroStructureAnalysis r : microRecords) {
            if (hasValue(r.getGraphiteType())) graphiteTypes.add(r.getGraphiteType());
            if (hasValue(r.getSize())) listSize.add(r.getSize());
            if (r.getSizeMin() != null) listSize.add(r.getSizeMin().toString());
            if (r.getSizeMax() != null) listSize.add(r.getSizeMax().toString());
            
            if (hasValue(r.getFerritePercent())) listFerrite.add(r.getFerritePercent());
            if (r.getFerritePercentMin() != null) listFerrite.add(r.getFerritePercentMin().toString());
            if (r.getFerritePercentMax() != null) listFerrite.add(r.getFerritePercentMax().toString());
            
            // Extract from JSON locationValues if present
            extractJsonValues(r.getLocationValues(), "size", listSize);
            extractJsonValues(r.getLocationValues(), "sizeMin", listSize);
            extractJsonValues(r.getLocationValues(), "sizeMax", listSize);
            extractJsonValues(r.getLocationValues(), "ferritePercent", listFerrite);
            extractJsonValues(r.getLocationValues(), "ferritePercentMin", listFerrite);
            extractJsonValues(r.getLocationValues(), "ferritePercentMax", listFerrite);
        }

        // Tensile values
        List<String> listTensile = new ArrayList<>();
        for (MicroTensileTest r : tensileRecords) {
            if (hasValue(r.getTensileStrength())) listTensile.add(r.getTensileStrength());
            // Extract from JSON locationValues if present
            extractJsonValues(r.getLocationValues(), "tensileStrength", listTensile);
        }

        // Calculate min/max observed
        Double[] minMaxC = getMinMaxOfStrings(listC);
        Double[] minMaxSi = getMinMaxOfStrings(listSi);
        Double[] minMaxMn = getMinMaxOfStrings(listMn);
        Double[] minMaxP = getMinMaxOfStrings(listP);
        Double[] minMaxS = getMinMaxOfStrings(listS);
        Double[] minMaxCu = getMinMaxOfStrings(listCu);
        Double[] minMaxCr = getMinMaxOfStrings(listCr);
        Double[] minMaxSize = getMinMaxOfStrings(listSize);
        Double[] minMaxFerrite = getMinMaxOfStrings(listFerrite);
        Double[] minMaxTensile = getMinMaxOfStrings(listTensile);

        // Deduplicate and join graphite types
        String observedGraphite = graphiteTypes.stream()
            .filter(this::hasValue)
            .map(String::trim)
            .distinct()
            .collect(Collectors.joining(", "));

        // Build Response
        Map<String, Object> observedValues = new HashMap<>();
        observedValues.put("c", minMaxMap(minMaxC));
        observedValues.put("si", minMaxMap(minMaxSi));
        observedValues.put("mn", minMaxMap(minMaxMn));
        observedValues.put("p", minMaxMap(minMaxP));
        observedValues.put("s", minMaxMap(minMaxS));
        observedValues.put("cu", minMaxMap(minMaxCu));
        observedValues.put("cr", minMaxMap(minMaxCr));
        observedValues.put("graphiteType", observedGraphite);
        observedValues.put("size", minMaxMap(minMaxSize));
        observedValues.put("ferritePercent", minMaxMap(minMaxFerrite));
        observedValues.put("tensileStrength", minMaxMap(minMaxTensile));

        // Generate deterministic report number and issue date
        int reportNo = Math.abs((partName + "_" + dateCode).hashCode()) % 10000;
        String issueDate = qcRecords.isEmpty() 
            ? java.time.LocalDate.now().toString() 
            : (qcRecords.get(0).getDate() != null ? qcRecords.get(0).getDate().toString() : java.time.LocalDate.now().toString());

        Map<String, Object> response = new HashMap<>();
        response.put("partMetadata", part);
        response.put("observedValues", observedValues);
        response.put("reportNo", reportNo);
        response.put("issueDate", issueDate);

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> minMaxMap(Double[] minMax) {
        Map<String, Object> map = new HashMap<>();
        map.put("min", minMax[0]);
        map.put("max", minMax[1]);
        return map;
    }

    private Double[] getMinMaxOfStrings(List<String> values) {
        if (values == null || values.isEmpty()) {
            return new Double[]{null, null};
        }
        Double min = null;
        Double max = null;
        for (String valStr : values) {
            if (valStr == null || valStr.trim().isEmpty()) {
                continue;
            }
            String str = valStr.trim();
            if (str.contains("-") && !str.startsWith("-")) {
                String[] parts = str.split("-");
                if (parts.length == 2) {
                    try {
                        double low = Double.parseDouble(parts[0].trim());
                        double high = Double.parseDouble(parts[1].trim());
                        if (min == null || low < min) min = low;
                        if (max == null || high > max) max = high;
                    } catch (NumberFormatException e) {
                        // ignore
                    }
                }
            } else {
                try {
                    double num = Double.parseDouble(str);
                    if (min == null || num < min) min = num;
                    if (max == null || num > max) max = num;
                } catch (NumberFormatException e) {
                    // ignore
                }
            }
        }
        return new Double[]{min, max};
    }

    private void extractJsonValues(String json, String fieldKey, List<String> targetList) {
        if (json == null || json.trim().isEmpty()) return;
        try {
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(json);
            if (root.isObject()) {
                java.util.Iterator<Map.Entry<String, com.fasterxml.jackson.databind.JsonNode>> fields = root.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, com.fasterxml.jackson.databind.JsonNode> entry = fields.next();
                    com.fasterxml.jackson.databind.JsonNode locationNode = entry.getValue();
                    if (locationNode.isObject() && locationNode.has(fieldKey)) {
                        com.fasterxml.jackson.databind.JsonNode valNode = locationNode.get(fieldKey);
                        if (!valNode.isNull()) {
                            targetList.add(valNode.asText());
                        }
                    }
                }
            }
        } catch (Exception e) {
            // ignore
        }
    }
}
