package com.company.facerecognition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RecognitionResponse {
    private boolean matchFound;
    private String personCode;
    private String personName;
    private String registeredPhotoPath;
    private double confidence;
    private String matchStrength;
    private BoundingBox boundingBox;
}
