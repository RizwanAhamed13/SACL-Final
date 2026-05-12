package com.sacl.service;

import com.sacl.model.MicroTensileTest;
import com.sacl.repository.MicroTensileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MicroTensileService {

    private final MicroTensileRepository repository;

    public MicroTensileTest save(MicroTensileTest entry) {
        return repository.save(entry);
    }

    public List<MicroTensileTest> findAll() {
        return repository.findAll();
    }

    public MicroTensileTest findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Micro Tensile entry not found: " + id));
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
