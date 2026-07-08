package com.sacl.service;

import com.sacl.exception.BadRequestException;
import com.sacl.exception.ResourceNotFoundException;
import com.sacl.exception.UnauthorizedException;
import com.sacl.model.ImpactTest;
import com.sacl.model.RecordStatus;
import com.sacl.repository.ImpactTestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImpactTestService {

    private final ImpactTestRepository repository;

    @Transactional
    public ImpactTest save(ImpactTest entry) {
        if (entry.getId() != null) {
            ImpactTest existing = findById(entry.getId());
            validateStatusTransition(existing.getStatus(), entry.getStatus());
            ImpactTest saved = repository.save(entry);
            log.info("Impact Test updated: {}", saved.getId());
            return saved;
        }
        entry.setStatus(RecordStatus.QC_ENTRY);
        ImpactTest saved = repository.save(entry);
        log.info("Impact Test created: {}", saved.getId());
        return saved;
    }

    public Page<ImpactTest> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Page<ImpactTest> search(String keyword, String createdBy, Pageable pageable) {
        String searchParam = (keyword == null) ? "" : keyword;
        return repository.searchByKeyword(searchParam, createdBy, pageable);
    }

    @Transactional
    @Transactional
    public int approveBulk(java.util.List<Long> ids, String approver) {
        return repository.updateStatusForIds(RecordStatus.HOD_APPROVED, approver, ids, RecordStatus.HOF_APPROVED);
    }

    public int approveAll(String approvedBy) {
        String role = getCurrentUserRole();
        if (!role.contains("HOD") && !role.contains("ADMIN")) {
            throw new UnauthorizedException("Only HOD or ADMIN role can bulk approve records");
        }
        List<ImpactTest> pending = repository.findByStatus(RecordStatus.HOF_APPROVED);
        pending.forEach(r -> {
            r.setStatus(RecordStatus.HOD_APPROVED);
            r.setHodApprovedBy(approvedBy);
        });
        repository.saveAll(pending);
        log.info("Impact Test bulk approved {} records by {}", pending.size(), approvedBy);
        return pending.size();
    }

    public ImpactTest findById(Long id) {
        return repository.findById(id).orElseThrow(() -> {
            log.warn("Impact Test entry not found: {}", id);
            return new ResourceNotFoundException("Impact Test entry not found: " + id);
        });
    }

    @Transactional
    public void deleteById(Long id) {
        findById(id);
        repository.deleteById(id);
        log.info("Impact Test deleted: {}", id);
    }

    private void validateStatusTransition(RecordStatus current, RecordStatus next) {
        if (current == next) return;
        String role = getCurrentUserRole();
        if (current == RecordStatus.QC_ENTRY && next == RecordStatus.HOF_APPROVED) {
            if (!role.contains("HOF") && !role.contains("ADMIN")) {
                throw new UnauthorizedException("Only HOF role can approve QC_ENTRY records");
            }
        } else if (current == RecordStatus.HOF_APPROVED && next == RecordStatus.HOD_APPROVED) {
            if (!role.contains("HOD") && !role.contains("ADMIN")) {
                throw new UnauthorizedException("Only HOD or ADMIN role can approve HOF_APPROVED records");
            }
        } else {
            throw new BadRequestException("Invalid status transition from " + current + " to " + next);
        }
    }

    private String getCurrentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return "";
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst().orElse("");
    }
}
