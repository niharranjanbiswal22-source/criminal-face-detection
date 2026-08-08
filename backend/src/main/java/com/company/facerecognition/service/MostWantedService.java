package com.company.facerecognition.service;

import com.company.facerecognition.entity.MostWanted;
import com.company.facerecognition.exception.ResourceNotFoundException;
import com.company.facerecognition.repository.MostWantedRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class MostWantedService {

    private final MostWantedRepository mostWantedRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public MostWantedService(MostWantedRepository mostWantedRepository) {
        this.mostWantedRepository = mostWantedRepository;
    }

    public List<MostWanted> listAll() {
        return mostWantedRepository.findAllByOrderByCreatedAtDesc();
    }

    public MostWanted getById(Long id) {
        return mostWantedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Most wanted record not found: " + id));
    }

    @Transactional
    public MostWanted create(String personCode, String fullName, String title, String crimeDescription,
                             String rewardAmount, String dangerLevel, MultipartFile image) {
        String storedPath = storeImage(personCode, image);
        MostWanted record = MostWanted.builder()
                .personCode(personCode)
                .fullName(fullName)
                .title(title)
                .crimeDescription(crimeDescription)
                .rewardAmount(rewardAmount)
                .dangerLevel(dangerLevel != null ? dangerLevel : "HIGH")
                .imagePath(storedPath)
                .build();
        return mostWantedRepository.save(record);
    }

    @Transactional
    public MostWanted update(Long id, String personCode, String fullName, String title,
                             String crimeDescription, String rewardAmount, String dangerLevel, MultipartFile image) {
        MostWanted record = getById(id);
        record.setPersonCode(personCode);
        record.setFullName(fullName);
        record.setTitle(title);
        record.setCrimeDescription(crimeDescription);
        record.setRewardAmount(rewardAmount);
        if (dangerLevel != null) record.setDangerLevel(dangerLevel);

        if (image != null && !image.isEmpty()) {
            String storedPath = storeImage(personCode, image);
            record.setImagePath(storedPath);
        }
        return mostWantedRepository.save(record);
    }

    @Transactional
    public void delete(Long id) {
        MostWanted record = getById(id);
        mostWantedRepository.delete(record);
    }

    private String storeImage(String personCode, MultipartFile image) {
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            String extension = getExtension(image.getOriginalFilename());
            String filename = "wanted_" + personCode + "_" + System.currentTimeMillis() + extension;
            Path target = dir.resolve(filename);
            Files.copy(image.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/images/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded most wanted image", e);
        }
    }

    private String getExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) return ".jpg";
        return originalFilename.substring(originalFilename.lastIndexOf('.'));
    }
}
