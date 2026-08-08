package com.company.facerecognition.repository;

import com.company.facerecognition.entity.MostWanted;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MostWantedRepository extends JpaRepository<MostWanted, Long> {
    List<MostWanted> findAllByOrderByCreatedAtDesc();
}
