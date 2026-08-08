package com.company.facerecognition.repository;

import com.company.facerecognition.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonRepository extends JpaRepository<Person, Long> {
    Optional<Person> findByPersonCode(String personCode);
    boolean existsByPersonCode(String personCode);
}
