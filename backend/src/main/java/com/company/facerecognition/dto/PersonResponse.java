package com.company.facerecognition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class PersonResponse {
    private Long id;
    private String personCode;
    private String fullName;
    private String imagePath;
    private LocalDateTime createdAt;
}
