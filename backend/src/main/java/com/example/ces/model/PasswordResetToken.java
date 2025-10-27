package com.example.ces.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "passwordResetTokens")
public class PasswordResetToken {
    @Id
    private String id;
    private String token;
    private String userId;
    private String email;
    private LocalDateTime expiryDate;
    private boolean used = false;

    // Default constructor
    public PasswordResetToken() {
    }

    // Constructor with token and user
    public PasswordResetToken(String token, String userId, String email) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.expiryDate = LocalDateTime.now().plusHours(24); // Token expires in 24 hours
    }

    // Check if token is expired
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }
}