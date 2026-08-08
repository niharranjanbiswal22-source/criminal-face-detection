package com.company.facerecognition.repository;

import com.company.facerecognition.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = :loginVal OR u.email = :loginVal")
    Optional<User> findByUsernameOrEmail(@Param("loginVal") String loginVal);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
