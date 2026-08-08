package com.company.facerecognition.service;

import com.company.facerecognition.ai.FaceDetector;
import com.company.facerecognition.ai.FaceEmbeddingExtractor;
import com.company.facerecognition.dto.RecognitionResponse;
import com.company.facerecognition.entity.FaceEmbedding;
import com.company.facerecognition.repository.FaceEmbeddingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class FaceRecognitionService {

    private final FaceDetector faceDetector;
    private final FaceEmbeddingExtractor embeddingExtractor;
    private final FaceEmbeddingRepository faceEmbeddingRepository;

    @Value("${face.recognition.threshold.possible:0.80}")
    private double possibleMatchThreshold;

    @Value("${face.recognition.threshold.strong:0.88}")
    private double strongMatchThreshold;

    @Value("${face.recognition.threshold.high:0.94}")
    private double highConfidenceThreshold;

    public FaceRecognitionService(FaceDetector faceDetector,
                                   FaceEmbeddingExtractor embeddingExtractor,
                                   FaceEmbeddingRepository faceEmbeddingRepository) {
        this.faceDetector = faceDetector;
        this.embeddingExtractor = embeddingExtractor;
        this.faceEmbeddingRepository = faceEmbeddingRepository;
    }

    public RecognitionResponse search(MultipartFile queryImage) {
        byte[] imageBytes;
        try {
            imageBytes = queryImage.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read uploaded image", e);
        }

        FaceDetector.DetectionResult detection;
        try {
            detection = faceDetector.detectLargestFace(imageBytes);
        } catch (com.company.facerecognition.exception.NoFaceDetectedException e) {
            return RecognitionResponse.builder()
                    .matchFound(false)
                    .confidence(0.0)
                    .matchStrength("NO_FACE_DETECTED")
                    .boundingBox(null)
                    .build();
        }

        float[] queryEmbedding = embeddingExtractor.extractEmbedding(detection.faceCropBgr());
        float[] flippedQueryEmbedding = null;
        if (detection.faceCropBgr() != null && !detection.faceCropBgr().empty()) {
            org.opencv.core.Mat flippedCrop = new org.opencv.core.Mat();
            try {
                org.opencv.core.Core.flip(detection.faceCropBgr(), flippedCrop, 1);
                flippedQueryEmbedding = embeddingExtractor.extractEmbedding(flippedCrop);
            } catch (Exception ignored) {} finally { flippedCrop.release(); }
        }

        List<FaceEmbedding> allEmbeddings = faceEmbeddingRepository.findAll();

        FaceEmbedding bestMatch = null;
        double bestScore = -1.0;

        // Group embeddings by Person to score against multi-angle pose clusters
        java.util.Map<com.company.facerecognition.entity.Person, List<FaceEmbedding>> personEmbeddingsMap = allEmbeddings.stream()
                .collect(java.util.stream.Collectors.groupingBy(FaceEmbedding::getPerson));

        for (java.util.Map.Entry<com.company.facerecognition.entity.Person, List<FaceEmbedding>> entry : personEmbeddingsMap.entrySet()) {
            List<FaceEmbedding> poseCluster = entry.getValue();
            double personMaxScore = -1.0;
            FaceEmbedding personBestPose = null;

            for (FaceEmbedding candidate : poseCluster) {
                double scoreDirect = FaceEmbeddingExtractor.cosineSimilarity(queryEmbedding, candidate.getEmbeddingVector());
                double scoreFlipped = (flippedQueryEmbedding != null) ? FaceEmbeddingExtractor.cosineSimilarity(flippedQueryEmbedding, candidate.getEmbeddingVector()) : 0;
                double score = Math.max(scoreDirect, scoreFlipped);
                if (score > personMaxScore) {
                    personMaxScore = score;
                    personBestPose = candidate;
                }
            }

            if (personMaxScore > bestScore) {
                bestScore = personMaxScore;
                bestMatch = personBestPose;
            }
        }

        if (bestMatch == null || bestScore < possibleMatchThreshold) {
            return RecognitionResponse.builder()
                    .matchFound(false)
                    .confidence(Math.max(Math.round(bestScore * 10000.0) / 10000.0, 0))
                    .matchStrength("NO_MATCH")
                    .boundingBox(detection.boundingBox())
                    .build();
        }

        String strength;
        if (bestScore >= highConfidenceThreshold) {
            strength = "HIGH_CONFIDENCE";
        } else if (bestScore >= strongMatchThreshold) {
            strength = "STRONG_MATCH";
        } else {
            strength = "POSSIBLE_MATCH";
        }

        String rawPath = bestMatch.getPerson().getImagePath();
        String photoPath = (rawPath != null && !rawPath.startsWith("/images/") && !rawPath.startsWith("http"))
                ? "/images/" + rawPath
                : rawPath;

        return RecognitionResponse.builder()
                .matchFound(true)
                .personCode(bestMatch.getPerson().getPersonCode())
                .personName(bestMatch.getPerson().getFullName())
                .registeredPhotoPath(photoPath)
                .confidence(Math.round(bestScore * 10000.0) / 10000.0)
                .matchStrength(strength)
                .boundingBox(detection.boundingBox())
                .build();
    }
}
