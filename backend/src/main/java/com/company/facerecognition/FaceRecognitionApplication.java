package com.company.facerecognition;

import nu.pattern.OpenCV;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Face Recognition Surveillance System (MVP).
 * Loads native OpenCV libraries on startup.
 */
@SpringBootApplication
public class FaceRecognitionApplication {

    public static void main(String[] args) {
        // Loads the bundled native OpenCV library (org.openpnp:opencv ships this helper)
        OpenCV.loadLocally();
        SpringApplication.run(FaceRecognitionApplication.class, args);
    }
}
