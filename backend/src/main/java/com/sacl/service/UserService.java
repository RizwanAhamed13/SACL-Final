package com.sacl.service;

import com.sacl.exception.DuplicateResourceException;
import com.sacl.exception.ResourceNotFoundException;
import com.sacl.model.User;
import com.sacl.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return repo.findAll();
    }

    public User findById(Long id) {
        return repo.findById(id).orElseThrow(() -> {
            log.warn("User not found: {}", id);
            return new ResourceNotFoundException("User not found: " + id);
        });
    }

    @Transactional
    public User create(User user) {
        if (repo.existsByUsername(user.getUsername())) {
            log.warn("Username already exists: {}", user.getUsername());
            throw new DuplicateResourceException("Username already exists: " + user.getUsername());
        }
        if (user.getEmployeeId() != null && !user.getEmployeeId().isBlank() && repo.existsByEmployeeId(user.getEmployeeId())) {
            throw new DuplicateResourceException("Employee ID already exists: " + user.getEmployeeId());
        }
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        User saved = repo.save(user);
        log.info("User created: {}", saved.getUsername());
        return saved;
    }

    @Transactional
    public User update(Long id, User updates) {
        User existing = findById(id);
        existing.setFullName(updates.getFullName());
        existing.setEmail(updates.getEmail());
        existing.setRole(updates.getRole());
        existing.setFormPermissions(updates.getFormPermissions());
        existing.setEmployeeId(updates.getEmployeeId());
        existing.setActive(updates.getActive() != null ? updates.getActive() : existing.getActive());
        if (updates.getPassword() != null && !updates.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updates.getPassword()));
        }
        User saved = repo.save(existing);
        log.info("User updated: {}", saved.getUsername());
        return saved;
    }

    @Transactional
    public void deleteById(Long id) {
        findById(id); // verify exists
        repo.deleteById(id);
        log.info("User deleted: {}", id);
    }
}
