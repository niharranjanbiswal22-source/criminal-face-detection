package com.company.facerecognition.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "most_wanted")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MostWanted {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "person_code", nullable = false, length = 50)
    private String personCode;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "crime_description", length = 1000)
    private String crimeDescription;

    @Column(name = "reward_amount", length = 50)
    private String rewardAmount;

    @Column(name = "danger_level", length = 50)
    private String dangerLevel; // e.g. CRITICAL, EXTREME, HIGH

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
