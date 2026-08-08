package com.company.facerecognition.controller;

import com.company.facerecognition.entity.MostWanted;
import com.company.facerecognition.service.MostWantedService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/most-wanted")
public class MostWantedController {

    private final MostWantedService mostWantedService;

    public MostWantedController(MostWantedService mostWantedService) {
        this.mostWantedService = mostWantedService;
    }

    /** Accessible to both USER and ADMIN */
    @GetMapping
    public ResponseEntity<List<MostWanted>> listAll() {
        return ResponseEntity.ok(mostWantedService.listAll());
    }

    /** Accessible to ADMIN only */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<MostWanted> create(@RequestParam("personCode") String personCode,
                                             @RequestParam("fullName") String fullName,
                                             @RequestParam("title") String title,
                                             @RequestParam(value = "crimeDescription", required = false) String crimeDescription,
                                             @RequestParam(value = "rewardAmount", required = false) String rewardAmount,
                                             @RequestParam(value = "dangerLevel", required = false) String dangerLevel,
                                             @RequestParam("image") MultipartFile image) {
        MostWanted record = mostWantedService.create(personCode, fullName, title, crimeDescription, rewardAmount, dangerLevel, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(record);
    }

    /** Accessible to ADMIN only */
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<MostWanted> update(@PathVariable Long id,
                                             @RequestParam("personCode") String personCode,
                                             @RequestParam("fullName") String fullName,
                                             @RequestParam("title") String title,
                                             @RequestParam(value = "crimeDescription", required = false) String crimeDescription,
                                             @RequestParam(value = "rewardAmount", required = false) String rewardAmount,
                                             @RequestParam(value = "dangerLevel", required = false) String dangerLevel,
                                             @RequestParam(value = "image", required = false) MultipartFile image) {
        MostWanted record = mostWantedService.update(id, personCode, fullName, title, crimeDescription, rewardAmount, dangerLevel, image);
        return ResponseEntity.ok(record);
    }

    /** Accessible to ADMIN only */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mostWantedService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
