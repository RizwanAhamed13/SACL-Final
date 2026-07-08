package com.sacl.service;

import com.sacl.exception.BadRequestException;
import com.sacl.exception.ResourceNotFoundException;
import com.sacl.exception.UnauthorizedException;
import com.sacl.model.QcRegister;
import com.sacl.model.RecordStatus;
import com.sacl.repository.QcRegisterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class QcRegisterService {

    private final QcRegisterRepository repository;

    @Transactional
    public QcRegister save(QcRegister entry) {
        if (entry.getId() != null) {
            QcRegister existing = findById(entry.getId());
            validateStatusTransition(existing.getStatus(), entry.getStatus());
            QcRegister saved = repository.save(entry);
            log.info("QC Register updated: {}", saved.getId());
            return saved;
        }
        entry.setStatus(RecordStatus.QC_ENTRY);
        QcRegister saved = repository.save(entry);
        log.info("QC Register created: {}", saved.getId());
        return saved;
    }

    public Page<QcRegister> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Page<QcRegister> search(String keyword, String createdBy, Pageable pageable) {
        String searchParam = (keyword == null) ? "" : keyword;
        return repository.searchByKeyword(searchParam, createdBy, pageable);
    }

    public QcRegister findById(Long id) {
        return repository.findById(id).orElseThrow(() -> {
            log.warn("QC Register entry not found: {}", id);
            return new ResourceNotFoundException("QC Register entry not found: " + id);
        });
    }

    @Transactional
    public void deleteById(Long id) {
        findById(id);
        repository.deleteById(id);
        log.info("QC Register deleted: {}", id);
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
