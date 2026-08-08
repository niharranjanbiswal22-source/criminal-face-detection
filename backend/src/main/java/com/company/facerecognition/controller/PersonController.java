package com.company.facerecognition.controller;

import com.company.facerecognition.dto.PersonRegisterRequest;
import com.company.facerecognition.dto.PersonResponse;
import com.company.facerecognition.service.PersonService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/persons")
public class PersonController {

    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    /** ADMIN only — enforced in SecurityConfig */
    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<PersonResponse> register(@Valid @ModelAttribute PersonRegisterRequest request) {
        PersonResponse response = personService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PersonResponse>> listAll() {
        return ResponseEntity.ok(personService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(personService.getById(id));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<PersonResponse> update(@PathVariable Long id, @Valid @ModelAttribute PersonRegisterRequest request) {
        return ResponseEntity.ok(personService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        personService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
