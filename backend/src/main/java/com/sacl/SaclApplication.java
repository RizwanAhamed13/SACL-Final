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
            if (userRepository.count() == 0 || userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setFullName("Administrator");
                admin.setEmail("admin@example.com");
                admin.setRole("ADMIN");
                admin.setActive(true);
                userRepository.save(admin);
                System.out.println("Default admin user created with username 'admin' and password 'admin'");
            } else {
                userRepository.findByUsername("admin").ifPresent(user -> {
                    if (user.getActive() == null || !user.getActive()) {
                        user.setActive(true);
                        userRepository.save(user);
                        System.out.println("User 'admin' has been reactivated.");
                    }
                });
            }
        };
    }
}
