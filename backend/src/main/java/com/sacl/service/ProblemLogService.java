package com.sacl.service;

import com.sacl.model.ProblemLog;
import com.sacl.repository.ProblemLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProblemLogService {

    private final ProblemLogRepository repository;

    public List<ProblemLog> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return repository.findAllByOrderByCreatedAtDesc();
        }
        return repository.searchByEmployeeNoOrId(query.trim());
    }

    public List<ProblemLog> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public ProblemLog create(ProblemLog log, String username) {
        log.setCreatedBy(username);
        return repository.save(log);
    }

    public ProblemLog update(Long id, ProblemLog updatedLog) {
        return repository.findById(id).map(existingLog -> {
            existingLog.setEmployeeNo(updatedLog.getEmployeeNo());
            existingLog.setProblem(updatedLog.getProblem());
            existingLog.setPartName(updatedLog.getPartName());
            existingLog.setHeatCode(updatedLog.getHeatCode());
            existingLog.setQty(updatedLog.getQty());
            existingLog.setStatus(updatedLog.getStatus());
            existingLog.setReason(updatedLog.getReason());
            return repository.save(existingLog);
        }).orElseThrow(() -> new RuntimeException("Record not found with id " + id));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
