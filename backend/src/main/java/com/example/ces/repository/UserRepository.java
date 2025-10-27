package com.example.ces.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.ces.model.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email); // for registration check

    Optional<User> findByVerificationToken(String token);

    Optional<User> findByResetToken(String token);
}
