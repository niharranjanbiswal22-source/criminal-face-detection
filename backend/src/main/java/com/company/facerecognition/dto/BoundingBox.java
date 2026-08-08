package com.company.facerecognition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class BoundingBox {
    private int x;
    private int y;
    private int width;
    private int height;
    private double detectionConfidence;
}
