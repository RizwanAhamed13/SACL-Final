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
    public CommandLineRunner initAdmin(UserRepository userRepository) {
        return args -> {
            System.out.println("Checking and reactivating all Admin users...");
            userRepository.findAll().forEach(user -> {
                if (user.getRole() != null && user.getRole().equalsIgnoreCase("Admin")) {
                    if (user.getActive() == null || !user.getActive()) {
                        user.setActive(true);
                        userRepository.save(user);
                        System.out.println("User '" + user.getUsername() + "' with Admin role has been reactivated.");
                    }
                }
            });

            // Also ensure 'admin' user is active just in case
            userRepository.findByUsername("admin").ifPresent(user -> {
                if (user.getActive() == null || !user.getActive()) {
                    user.setActive(true);
                    userRepository.save(user);
                    System.out.println("User 'admin' has been reactivated.");
                }
            });
        };
    }
}
