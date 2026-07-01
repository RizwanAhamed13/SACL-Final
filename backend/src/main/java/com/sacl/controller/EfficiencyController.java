package com.sacl.controller;

import com.sacl.model.*;
import com.sacl.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/efficiency")
@RequiredArgsConstructor
public class EfficiencyController {

    private final UserRepository userRepository;
    private final QcRegisterRepository qcRepo;
    private final MicroStructureRepository microRepo;
    private final MicroTensileRepository tensileRepo;
    private final ImpactTestRepository impactRepo;
    private final PerformanceFeedbackRepository feedbackRepo;

    @PreAuthorize("hasAnyRole('HOD','ADMIN')")
    @GetMapping("/employees")
    public ResponseEntity<List<Map<String, Object>>> getEmployeeEfficiency() {

        // Gather all records across all forms
        List<QcRegister>          qcAll      = qcRepo.findAll();
        List<MicroStructureAnalysis> microAll = microRepo.findAll();
        List<MicroTensileTest>    tensileAll  = tensileRepo.findAll();
        List<ImpactTest>          impactAll   = impactRepo.findAll();

        // Build a map: employeeId → metrics
        Map<String, Map<String, Object>> metricsMap = new LinkedHashMap<>();

        // Helper: initialise entry for an employee
        java.util.function.Function<String, Map<String, Object>> initEntry = (empId) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("employeeId",    empId);
            m.put("fullName",      "");
            m.put("totalSubmissions", 0);
            m.put("qcCount",       0);
            m.put("microCount",    0);
            m.put("tensileCount",  0);
            m.put("impactCount",   0);
            m.put("hofApproved",   0);
            m.put("hodApproved",   0);
            m.put("issuesCount",   0);
            m.put("remarksList",   new ArrayList<Map<String, String>>());
            m.put("lastActivity",  null);
            return m;
        };

        java.util.function.BiConsumer<String, String> increment = (empId, key) -> {
            metricsMap.computeIfAbsent(empId, initEntry);
            Map<String, Object> m = metricsMap.get(empId);
            m.put(key, ((Number) m.get(key)).intValue() + 1);
        };

        java.util.function.BiConsumer<String, LocalDate> trackDate = (empId, date) -> {
            if (empId == null || date == null) return;
            metricsMap.computeIfAbsent(empId, initEntry);
            Map<String, Object> m = metricsMap.get(empId);
            LocalDate current = m.get("lastActivity") != null ? (LocalDate) m.get("lastActivity") : null;
            if (current == null || date.isAfter(current)) m.put("lastActivity", date);
        };

        java.util.function.BiConsumer<String, Map<String, String>> addRemark = (empId, remarkData) -> {
            metricsMap.computeIfAbsent(empId, initEntry);
            Map<String, Object> m = metricsMap.get(empId);
            @SuppressWarnings("unchecked")
            List<Map<String, String>> rl = (List<Map<String, String>>) m.get("remarksList");
            rl.add(remarkData);
            m.put("issuesCount", ((Number) m.get("issuesCount")).intValue() + 1);
        };

        // --- QC Register ---
        for (QcRegister r : qcAll) {
            String emp = r.getCreatedBy(); if (emp == null || emp.isBlank()) continue;
            metricsMap.computeIfAbsent(emp, initEntry);
            increment.accept(emp, "totalSubmissions");
            increment.accept(emp, "qcCount");
            if (r.getStatus() == RecordStatus.HOF_APPROVED || r.getStatus() == RecordStatus.HOD_APPROVED)
                increment.accept(emp, "hofApproved");
            if (r.getStatus() == RecordStatus.HOD_APPROVED) increment.accept(emp, "hodApproved");
            trackDate.accept(emp, r.getDate());
        }

        // --- Micro Structure ---
        for (MicroStructureAnalysis r : microAll) {
            String emp = r.getCreatedBy(); if (emp == null || emp.isBlank()) continue;
            metricsMap.computeIfAbsent(emp, initEntry);
            increment.accept(emp, "totalSubmissions");
            increment.accept(emp, "microCount");
            if (r.getStatus() == RecordStatus.HOF_APPROVED || r.getStatus() == RecordStatus.HOD_APPROVED)
                increment.accept(emp, "hofApproved");
            if (r.getStatus() == RecordStatus.HOD_APPROVED) increment.accept(emp, "hodApproved");
            trackDate.accept(emp, r.getInspectionDate());
        }

        // --- Tensile Test ---
        for (MicroTensileTest r : tensileAll) {
            String emp = r.getCreatedBy(); if (emp == null || emp.isBlank()) continue;
            metricsMap.computeIfAbsent(emp, initEntry);
            increment.accept(emp, "totalSubmissions");
            increment.accept(emp, "tensileCount");
            if (r.getStatus() == RecordStatus.HOF_APPROVED || r.getStatus() == RecordStatus.HOD_APPROVED)
                increment.accept(emp, "hofApproved");
            if (r.getStatus() == RecordStatus.HOD_APPROVED) increment.accept(emp, "hodApproved");
            trackDate.accept(emp, r.getDateOfInspection());
        }

        // --- Impact Test ---
        for (ImpactTest r : impactAll) {
            String emp = r.getCreatedBy(); if (emp == null || emp.isBlank()) continue;
            metricsMap.computeIfAbsent(emp, initEntry);
            increment.accept(emp, "totalSubmissions");
            increment.accept(emp, "impactCount");
            if (r.getStatus() == RecordStatus.HOF_APPROVED || r.getStatus() == RecordStatus.HOD_APPROVED)
                increment.accept(emp, "hofApproved");
            if (r.getStatus() == RecordStatus.HOD_APPROVED) increment.accept(emp, "hodApproved");
            trackDate.accept(emp, r.getDateOfInspection());
        }

        // --- Performance Feedback (Remarks) ---
        List<PerformanceFeedback> feedbacks = feedbackRepo.findAll();
        for (PerformanceFeedback f : feedbacks) {
            String emp = f.getTargetEmployeeId();
            if (emp == null || emp.isBlank()) continue;
            
            Map<String, String> remarkData = new HashMap<>();
            remarkData.put("form", "Performance");
            remarkData.put("date", f.getCreatedAt() != null ? f.getCreatedAt().toLocalDate().toString() : "N/A");
            remarkData.put("text", f.getFeedbackText());
            remarkData.put("reviewer", f.getReviewerName());
            addRemark.accept(emp, remarkData);
        }

        // --- Enrich with full names from user table ---
        List<User> users = userRepository.findAll();
        Map<String, String> empIdToName = new HashMap<>();
        for (User u : users) {
            if (u.getEmployeeId() != null) empIdToName.put(u.getEmployeeId(), u.getFullName() != null ? u.getFullName() : u.getUsername());
        }

        // --- Compute derived metrics ---
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Map<String, Object>> entry : metricsMap.entrySet()) {
            Map<String, Object> m = entry.getValue();
            m.put("fullName", empIdToName.getOrDefault(entry.getKey(), entry.getKey()));

            int total     = ((Number) m.get("totalSubmissions")).intValue();
            int hodApp    = ((Number) m.get("hodApproved")).intValue();
            int issues    = ((Number) m.get("issuesCount")).intValue();

            double efficiency = total > 0 ? ((total - issues) * 100.0 / total) : 0.0;
            int pending = total - hodApp;

            m.put("pending",         Math.max(0, pending));
            m.put("efficiencyScore", Math.round(efficiency * 10.0) / 10.0);

            result.add(m);
        }

        // Sort by totalSubmissions desc
        result.sort((a, b) -> ((Number)b.get("totalSubmissions")).intValue() - ((Number)a.get("totalSubmissions")).intValue());

        return ResponseEntity.ok(result);
    }
}
