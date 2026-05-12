package com.sacl.service;

import com.sacl.model.MicroStructureAnalysis;
import com.sacl.repository.MicroStructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MicroStructureService {

    private final MicroStructureRepository repository;

    public MicroStructureAnalysis save(MicroStructureAnalysis entry) {
        return repository.save(entry);
    }

    public List<MicroStructureAnalysis> findAll() {
        return repository.findAll();
    }

    public MicroStructureAnalysis findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Micro Structure entry not found: " + id));
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
