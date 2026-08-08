package com.company.facerecognition.controller;

import com.company.facerecognition.dto.UserDto;
import com.company.facerecognition.dto.UserStatusRequest;
import com.company.facerecognition.entity.User;
import com.company.facerecognition.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .fullName(u.getFullName() != null ? u.getFullName() : u.getUsername())
                        .email(u.getEmail() != null ? u.getEmail() : u.getUsername() + "@system.gov")
                        .username(u.getUsername())
                        .role(u.getRole().name())
                        .active(u.isActive())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserDto> updateUserStatus(@PathVariable Long id, @RequestBody UserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if ("admin".equalsIgnoreCase(user.getUsername())) {
            throw new IllegalArgumentException("Default Admin account status cannot be modified.");
        }

        user.setActive(request.isActive());
        userRepository.save(user);

        return ResponseEntity.ok(UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole().name())
                .active(user.isActive())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if ("admin".equalsIgnoreCase(user.getUsername())) {
            throw new IllegalArgumentException("Default Admin account cannot be deleted.");
        }

        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }
}
