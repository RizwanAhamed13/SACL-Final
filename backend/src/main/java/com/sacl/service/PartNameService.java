package com.sacl.service;

import com.sacl.model.PartName;
import com.sacl.repository.PartNameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PartNameService {

    private final PartNameRepository repo;

    public List<PartName> findAll() { return repo.findAll(); }

    public List<PartName> findActive() { return repo.findByActiveTrueOrderByNameAsc(); }

    public PartName findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Part not found: " + id));
    }

    public PartName create(PartName part) {
        if (repo.existsByName(part.getName())) {
            throw new RuntimeException("Part name already exists: " + part.getName());
        }
        return repo.save(part);
    }

    public PartName update(Long id, PartName updates) {
        PartName existing = findById(id);
        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setActive(updates.getActive() != null ? updates.getActive() : existing.getActive());
        return repo.save(existing);
    }

    public void deleteById(Long id) { repo.deleteById(id); }
}
