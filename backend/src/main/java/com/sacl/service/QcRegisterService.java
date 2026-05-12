package com.sacl.service;

import com.sacl.model.QcRegister;
import com.sacl.repository.QcRegisterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QcRegisterService {

    private final QcRegisterRepository repository;

    public QcRegister save(QcRegister entry) {
        return repository.save(entry);
    }

    public List<QcRegister> findAll() {
        return repository.findAll();
    }

    public QcRegister findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("QC Register entry not found: " + id));
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
