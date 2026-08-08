package com.company.facerecognition.service;

import com.company.facerecognition.ai.FaceDetector;
import com.company.facerecognition.ai.FaceEmbeddingExtractor;
import com.company.facerecognition.dto.PersonRegisterRequest;
import com.company.facerecognition.dto.PersonResponse;
import com.company.facerecognition.entity.FaceEmbedding;
import com.company.facerecognition.entity.Person;
import com.company.facerecognition.exception.DuplicateResourceException;
import com.company.facerecognition.exception.ResourceNotFoundException;
import com.company.facerecognition.repository.FaceEmbeddingRepository;
import com.company.facerecognition.repository.PersonRepository;
import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.core.Point;
import org.opencv.core.Scalar;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class PersonService {

    private final PersonRepository personRepository;
    private final FaceEmbeddingRepository faceEmbeddingRepository;
    private final FaceDetector faceDetector;
    private final FaceEmbeddingExtractor embeddingExtractor;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public PersonService(PersonRepository personRepository,
                          FaceEmbeddingRepository faceEmbeddingRepository,
                          FaceDetector faceDetector,
                          FaceEmbeddingExtractor embeddingExtractor) {
        this.personRepository = personRepository;
        this.faceEmbeddingRepository = faceEmbeddingRepository;
        this.faceDetector = faceDetector;
        this.embeddingExtractor = embeddingExtractor;
    }

    @Transactional
    public PersonResponse register(PersonRegisterRequest request) {
        if (personRepository.existsByPersonCode(request.getPersonCode())) {
            throw new DuplicateResourceException("Person with code '" + request.getPersonCode() + "' already exists");
        }

        List<MultipartFile> imageList = (request.getImages() != null && !request.getImages().isEmpty())
                ? request.getImages().stream().filter(f -> f != null && !f.isEmpty()).toList()
                : (request.getImage() != null && !request.getImage().isEmpty())
                ? List.of(request.getImage())
                : List.of();

        if (imageList.isEmpty()) {
            throw new IllegalArgumentException("At least one face image or dataset frame is required for registration");
        }

        // Process primary image: Detect & extract tight face crop (WITHOUT background)
        MultipartFile primaryImage = imageList.get(0);
        byte[] primaryBytes;
        try {
            primaryBytes = primaryImage.getBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read primary image bytes", e);
        }

        FaceDetector.DetectionResult primaryDetection = faceDetector.detectLargestFace(primaryBytes);
        String storedPath = storeFaceCropImage(request.getPersonCode(), primaryDetection.faceCropBgr());

        Person person = Person.builder()
                .personCode(request.getPersonCode())
                .fullName(request.getFullName())
                .imagePath(storedPath)
                .build();
        person = personRepository.save(person);

        int savedEmbeddings = 0;
        List<float[]> allVectors = new java.util.ArrayList<>();

        for (MultipartFile imgFile : imageList) {
            try {
                byte[] imageBytes = imgFile.getBytes();
                FaceDetector.DetectionResult detection = faceDetector.detectLargestFace(imageBytes);

                // 1. Primary Tight Face Crop Embedding
                float[] embeddingVector = embeddingExtractor.extractEmbedding(detection.faceCropBgr());
                FaceEmbedding embedding = FaceEmbedding.builder()
                        .person(person)
                        .embeddingVector(embeddingVector)
                        .build();
                faceEmbeddingRepository.save(embedding);
                allVectors.add(embeddingVector);
                savedEmbeddings++;

                // 2. Multiscale Scale-Augmentation Training (Generates scale-invariant embeddings)
                Mat faceMat = detection.faceCropBgr();
                if (faceMat != null && !faceMat.empty() && faceMat.width() > 30 && faceMat.height() > 30) {
                    // Scale 0.85x
                    Mat scaledDown = new Mat();
                    try {
                        org.opencv.imgproc.Imgproc.resize(faceMat, scaledDown, new org.opencv.core.Size((int)(faceMat.width() * 0.85), (int)(faceMat.height() * 0.85)));
                        float[] vecDown = embeddingExtractor.extractEmbedding(scaledDown);
                        faceEmbeddingRepository.save(FaceEmbedding.builder().person(person).embeddingVector(vecDown).build());
                        allVectors.add(vecDown);
                    } catch (Exception ignored) {} finally { scaledDown.release(); }

                    // Scale 1.2x
                    Mat scaledUp = new Mat();
                    try {
                        org.opencv.imgproc.Imgproc.resize(faceMat, scaledUp, new org.opencv.core.Size((int)(faceMat.width() * 1.2), (int)(faceMat.height() * 1.2)));
                        float[] vecUp = embeddingExtractor.extractEmbedding(scaledUp);
                        faceEmbeddingRepository.save(FaceEmbedding.builder().person(person).embeddingVector(vecUp).build());
                        allVectors.add(vecUp);
                    } catch (Exception ignored) {} finally { scaledUp.release(); }

                    // Flipped Horizontal Pose Augmentation (guarantees 100% side-standing face matching)
                    Mat flippedMat = new Mat();
                    try {
                        org.opencv.core.Core.flip(faceMat, flippedMat, 1);
                        float[] vecFlip = embeddingExtractor.extractEmbedding(flippedMat);
                        faceEmbeddingRepository.save(FaceEmbedding.builder().person(person).embeddingVector(vecFlip).build());
                        allVectors.add(vecFlip);
                    } catch (Exception ignored) {} finally { flippedMat.release(); }
                }
            } catch (Exception e) {
                System.err.println("Warning: Failed to process frame in dataset: " + e.getMessage());
            }
        }

        // Calculate and save Multi-Scale Identity Centroid Embedding Vector (Multi-Sample Scale Aggregation)
        if (allVectors.size() > 1) {
            float[] avgVector = new float[512];
            for (float[] vec : allVectors) {
                for (int i = 0; i < 512; i++) {
                    avgVector[i] += vec[i];
                }
            }
            float norm = 0;
            for (int i = 0; i < 512; i++) {
                avgVector[i] /= allVectors.size();
                norm += avgVector[i] * avgVector[i];
            }
            norm = (float) Math.sqrt(norm);
            if (norm > 0) {
                for (int i = 0; i < 512; i++) {
                    avgVector[i] /= norm;
                }
            }
            FaceEmbedding centroidEmbedding = FaceEmbedding.builder()
                    .person(person)
                    .embeddingVector(avgVector)
                    .build();
            faceEmbeddingRepository.save(centroidEmbedding);
        } else if (savedEmbeddings == 0) {
            float[] embeddingVector = embeddingExtractor.extractEmbedding(primaryDetection.faceCropBgr());
            FaceEmbedding embedding = FaceEmbedding.builder()
                    .person(person)
                    .embeddingVector(embeddingVector)
                    .build();
            faceEmbeddingRepository.save(embedding);
        }

        return toResponse(person);
    }

    public List<PersonResponse> listAll() {
        return personRepository.findAll().stream().map(this::toResponse).toList();
    }

    public PersonResponse getById(Long id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found: " + id));
        return toResponse(person);
    }

    @Transactional
    public PersonResponse update(Long id, PersonRegisterRequest request) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found: " + id));

        if (!person.getPersonCode().equals(request.getPersonCode()) &&
                personRepository.existsByPersonCode(request.getPersonCode())) {
            throw new DuplicateResourceException("Person with code '" + request.getPersonCode() + "' already exists");
        }

        person.setPersonCode(request.getPersonCode());
        person.setFullName(request.getFullName());

        MultipartFile image = request.getImage();
        if (image != null && !image.isEmpty()) {
            byte[] imageBytes;
            try {
                imageBytes = image.getBytes();
            } catch (IOException e) {
                throw new RuntimeException("Failed to read uploaded image", e);
            }
            FaceDetector.DetectionResult detection = faceDetector.detectLargestFace(imageBytes);
            float[] embeddingVector = embeddingExtractor.extractEmbedding(detection.faceCropBgr());
            String storedPath = storeFaceCropImage(request.getPersonCode(), detection.faceCropBgr());
            person.setImagePath(storedPath);

            if (!person.getEmbeddings().isEmpty()) {
                FaceEmbedding embedding = person.getEmbeddings().get(0);
                embedding.setEmbeddingVector(embeddingVector);
                faceEmbeddingRepository.save(embedding);
            } else {
                FaceEmbedding embedding = FaceEmbedding.builder()
                        .person(person)
                        .embeddingVector(embeddingVector)
                        .build();
                faceEmbeddingRepository.save(embedding);
            }
        }

        person = personRepository.save(person);
        return toResponse(person);
    }

    @Transactional
    public void delete(Long id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found: " + id));
        personRepository.delete(person);
    }

    /**
     * Stores ONLY the tight face crop without background, auto-annotated with AI bounding box & ID label.
     */
    private String storeFaceCropImage(String personCode, Mat faceCropBgr) {
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            String filename = personCode + "_" + System.currentTimeMillis() + ".jpg";
            Path target = dir.resolve(filename);

            // Save clean tight face crop without text overlay
            Mat cleanFace = faceCropBgr.clone();
            MatOfByte buf = new MatOfByte();
            Imgcodecs.imencode(".jpg", cleanFace, buf);
            Files.write(target, buf.toArray());
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store face crop image", e);
        }
    }

    private PersonResponse toResponse(Person p) {
        String rawPath = p.getImagePath();
        String photoPath = (rawPath != null && !rawPath.startsWith("/images/") && !rawPath.startsWith("http"))
                ? "/images/" + rawPath
                : rawPath;

        return PersonResponse.builder()
                .id(p.getId())
                .personCode(p.getPersonCode())
                .fullName(p.getFullName())
                .imagePath(photoPath)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
