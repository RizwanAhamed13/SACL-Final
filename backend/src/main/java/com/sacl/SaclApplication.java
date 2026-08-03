package com.sacl;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.sacl.repository.UserRepository;
import com.sacl.model.User;

@SpringBootApplication
public class SaclApplication {
    public static void main(String[] args) {
        SpringApplication.run(SaclApplication.class, args);
    }

    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            // Force reset any user with EmployeeID EMP043 to default password
            userRepository.findAll().forEach(user -> {
                if ("EMP043".equals(user.getEmployeeId())) {
                    user.setPassword(passwordEncoder.encode("Rizwan@25012007"));
                    user.setActive(true);
                    userRepository.save(user);
                    System.out.println("Force-reset password for Admin (EMP043) on startup.");
                }
            });

            if (userRepository.count() == 0 || userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmployeeId("EMP043");
                admin.setPassword(passwordEncoder.encode("Rizwan@25012007"));
                admin.setFullName("Administrator");
                admin.setEmail("admin@sacl.com");
                admin.setRole("ADMIN");
                admin.setActive(true);
                userRepository.save(admin);
                System.out.println("Default admin created — EmployeeID: EMP043");
            }
        };
    }
}
