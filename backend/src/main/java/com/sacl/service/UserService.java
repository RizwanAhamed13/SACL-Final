package com.sacl.service;

import com.sacl.model.User;
import com.sacl.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final BCryptPasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return repo.findAll();
    }

    public User findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    public User create(User user) {
        if (repo.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists: " + user.getUsername());
        }
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return repo.save(user);
    }

    public User update(Long id, User updates) {
        User existing = findById(id);
        existing.setFullName(updates.getFullName());
        existing.setEmail(updates.getEmail());
        existing.setRole(updates.getRole());
        existing.setFormPermissions(updates.getFormPermissions());
        existing.setActive(updates.getActive() != null ? updates.getActive() : existing.getActive());
        if (updates.getPassword() != null && !updates.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updates.getPassword()));
        }
        return repo.save(existing);
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }
}
