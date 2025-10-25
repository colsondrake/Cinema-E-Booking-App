package com.example.ces.repository;

import com.example.ces.model.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.time.LocalDateTime;

@Repository
public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUserId(String userId);
    Optional<PasswordResetToken> findByEmail(String email);
    void deleteByExpiryDateBefore(LocalDateTime date);
    void deleteByUserId(String userId);
}