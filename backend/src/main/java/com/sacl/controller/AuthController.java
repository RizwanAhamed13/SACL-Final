package com.sacl.controller;

import com.sacl.dto.AuthRequest;
import com.sacl.dto.AuthResponse;
import com.sacl.exception.ResourceNotFoundException;
import com.sacl.model.User;
import com.sacl.repository.UserRepository;
import com.sacl.security.JwtUtil;
import com.sacl.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RateLimitService rateLimitService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest authRequest, HttpServletRequest request) {
        rateLimitService.checkRateLimit(request.getRemoteAddr());

        // Resolve employeeId → username for Spring Security authentication
        User userByEmpId = userRepository.findByEmployeeId(authRequest.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid employee ID or password"));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userByEmpId.getUsername(), authRequest.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String role = user.getRole() != null ? user.getRole().toUpperCase() : "USER";
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        String token = jwtUtil.generateToken(userDetails, role, user.getFormPermissions());

        return ResponseEntity.ok(new AuthResponse(token, user));
    }
}
