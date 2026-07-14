package com.sacl.service;

import com.sacl.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final UserRepository userRepository;

    public boolean hasFormAccess(Authentication authentication, String permission) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (user.getRole() != null && (user.getRole().equalsIgnoreCase("ADMIN") || user.getRole().equalsIgnoreCase("HOD"))) {
                        return true;
                    }
                    String perms = user.getFormPermissions();
                    if (perms == null) {
                        return false;
                    }
                    for (String p : perms.split(",")) {
                        if (p.trim().equalsIgnoreCase(permission)) {
                            return true;
                        }
                    }
                    return false;
                })
                .orElse(false);
    }
}
