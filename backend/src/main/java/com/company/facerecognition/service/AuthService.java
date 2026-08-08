package com.company.facerecognition.service;

import com.company.facerecognition.dto.LoginRequest;
import com.company.facerecognition.dto.LoginResponse;
import com.company.facerecognition.dto.SignupRequest;
import com.company.facerecognition.entity.Role;
import com.company.facerecognition.entity.User;
import com.company.facerecognition.repository.UserRepository;
import com.company.facerecognition.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse registerUser(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email address is already registered. Please login.");
        }

        String derivedUsername = request.getEmail().split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "");
        int suffix = 1;
        String finalUsername = derivedUsername;
        while (userRepository.existsByUsername(finalUsername)) {
            finalUsername = derivedUsername + suffix++;
        }

        Role targetRole = Role.USER;
        if (request.getRole() != null) {
            try {
                targetRole = Role.valueOf(request.getRole().toUpperCase());
            } catch (Exception ignored) {
            }
        }

        // Standard USER accounts are active immediately.
        // OFFICER and ADMIN accounts require Admin Approval (active = false).
        boolean requiresApproval = (targetRole == Role.ADMIN || targetRole == Role.OFFICER);
        boolean isActive = !requiresApproval;

        User newUser = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase())
                .username(finalUsername)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(targetRole)
                .active(isActive)
                .build();

        userRepository.save(newUser);

        if (requiresApproval) {
            return LoginResponse.builder()
                    .token(null)
                    .username(finalUsername)
                    .role(targetRole.name())
                    .expiresInMs(0)
                    .pendingApproval(true)
                    .message("Registration submitted successfully! " + targetRole.name() + " accounts require Admin Approval before login.")
                    .build();
        }

        String token = jwtUtil.generateToken(newUser.getUsername(), newUser.getRole().name());
        return new LoginResponse(token, newUser.getUsername(), newUser.getRole().name(), jwtUtil.getExpirationMs());
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isActive()) {
            if (user.getRole() == Role.ADMIN || user.getRole() == Role.OFFICER) {
                throw new DisabledException("Account registration is pending Admin Approval. Please contact System Administrator.");
            } else {
                throw new DisabledException("Account has been banned or deactivated by System Admin.");
            }
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword()));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new LoginResponse(token, user.getUsername(), user.getRole().name(), jwtUtil.getExpirationMs());
    }
}
