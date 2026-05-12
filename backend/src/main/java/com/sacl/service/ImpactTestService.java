package com.sacl.service;

import com.sacl.model.ImpactTest;
import com.sacl.repository.ImpactTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImpactTestService {

    private final ImpactTestRepository repository;

    public ImpactTest save(ImpactTest entry) {
        return repository.save(entry);
    }

    public List<ImpactTest> findAll() {
        return repository.findAll();
    }

    public ImpactTest findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Impact Test entry not found: " + id));
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
