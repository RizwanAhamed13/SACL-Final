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

        java.util.function.BiConsumer<List<Object[]>, String> processStats = (list, countKey) -> {
            for (Object[] row : list) {
                String emp = (String) row[0];
                if (emp == null || emp.isBlank()) continue;
                metricsMap.computeIfAbsent(emp, initEntry);
                Map<String, Object> m = metricsMap.get(emp);
                
                long total = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                long hofApp = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                long hodApp = row[3] != null ? ((Number) row[3]).longValue() : 0L;
                LocalDate date = (LocalDate) row[4];
                
                m.put(countKey, ((Number) m.get(countKey)).intValue() + (int) total);
                m.put("totalSubmissions", ((Number) m.get("totalSubmissions")).intValue() + (int) total);
                m.put("hofApproved", ((Number) m.get("hofApproved")).intValue() + (int) (hofApp + hodApp)); // Since logic was hof or hod, and query handles both
                m.put("hodApproved", ((Number) m.get("hodApproved")).intValue() + (int) hodApp);
                
                if (date != null) {
                    LocalDate current = (LocalDate) m.get("lastActivity");
                    if (current == null || date.isAfter(current)) {
                        m.put("lastActivity", date);
                    }
                }
            }
        };

        java.util.function.BiConsumer<String, Map<String, String>> addRemark = (empId, remarkData) -> {
            metricsMap.computeIfAbsent(empId, initEntry);
            Map<String, Object> m = metricsMap.get(empId);
            @SuppressWarnings("unchecked")
            List<Map<String, String>> rl = (List<Map<String, String>>) m.get("remarksList");
            rl.add(remarkData);
            m.put("issuesCount", ((Number) m.get("issuesCount")).intValue() + 1);
        };

        // Process stats directly from database without loading models into memory
        processStats.accept(qcRepo.getEfficiencyStats(), "qcCount");
        processStats.accept(microRepo.getEfficiencyStats(), "microCount");
        processStats.accept(tensileRepo.getEfficiencyStats(), "tensileCount");
        processStats.accept(impactRepo.getEfficiencyStats(), "impactCount");

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
