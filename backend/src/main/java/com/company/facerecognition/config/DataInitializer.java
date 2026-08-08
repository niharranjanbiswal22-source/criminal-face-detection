package com.company.facerecognition.config;

import com.company.facerecognition.entity.Role;
import com.company.facerecognition.entity.User;
import com.company.facerecognition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Seeds default accounts on startup so the system is usable out of the box. */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.default-admin.username}")
    private String defaultAdminUsername;

    @Value("${app.default-admin.password}")
    private String defaultAdminPassword;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername(defaultAdminUsername)) {
            User admin = User.builder()
                    .fullName("System Administrator")
                    .email("admin@system.gov")
                    .username(defaultAdminUsername)
                    .password(passwordEncoder.encode(defaultAdminPassword))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded default admin user: " + defaultAdminUsername);
        }

        if (!userRepository.existsByUsername("user")) {
            User standardUser = User.builder()
                    .fullName("Standard User")
                    .email("user@system.gov")
                    .username("user")
                    .password(passwordEncoder.encode("User@123"))
                    .role(Role.USER)
                    .active(true)
                    .build();
            userRepository.save(standardUser);
            System.out.println("Seeded default user account: user / User@123");
        }

        if (!userRepository.existsByUsername("officer1")) {
            User officer = User.builder()
                    .fullName("Police Officer 1")
                    .email("officer1@system.gov")
                    .username("officer1")
                    .password(passwordEncoder.encode("Officer@123"))
                    .role(Role.OFFICER)
                    .active(true)
                    .build();
            userRepository.save(officer);
            System.out.println("Seeded default officer account: officer1 / Officer@123");
        }
    }
}
