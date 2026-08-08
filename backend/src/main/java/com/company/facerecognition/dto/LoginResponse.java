package com.company.facerecognition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private String username;
    private String role;
    private long expiresInMs;
    private boolean pendingApproval;
    private String message;

    public LoginResponse(String token, String username, String role, long expiresInMs) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.expiresInMs = expiresInMs;
        this.pendingApproval = false;
        this.message = "Authentication successful";
    }
}
