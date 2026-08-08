package com.company.facerecognition.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

/**
 * Bound from a multipart/form-data request:
 * fields: personCode, fullName ; file part: image
 */
@Getter
@Setter
public class PersonRegisterRequest {

    @NotBlank(message = "personCode is required")
    private String personCode;

    @NotBlank(message = "fullName is required")
    private String fullName;

    private MultipartFile image;

    private java.util.List<MultipartFile> images;
}
