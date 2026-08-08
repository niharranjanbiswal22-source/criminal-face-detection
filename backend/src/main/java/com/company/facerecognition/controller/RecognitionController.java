package com.company.facerecognition.controller;

import com.company.facerecognition.dto.RecognitionResponse;
import com.company.facerecognition.service.FaceRecognitionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/recognition")
public class RecognitionController {

    private final FaceRecognitionService faceRecognitionService;

    public RecognitionController(FaceRecognitionService faceRecognitionService) {
        this.faceRecognitionService = faceRecognitionService;
    }

    @PostMapping(value = {"/search", "/identify"}, consumes = "multipart/form-data")
    public ResponseEntity<RecognitionResponse> search(@RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(faceRecognitionService.search(image));
    }
}
