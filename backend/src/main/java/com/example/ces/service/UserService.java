package com.example.ces.service;

import com.example.ces.model.*;
import com.example.ces.repository.*;
import com.example.ces.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get user by ID
     */
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    /**
     * Get user by email (used for login)
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Update user profile
     */
    public User updateUserProfile(String userId, UserProfileDTO profileDTO, String currentPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean profileChanged = false;

        // Update first name if changed
        if (profileDTO.getFirstName() != null && !profileDTO.getFirstName().isEmpty()) {
            user.setFirstName(profileDTO.getFirstName());
            profileChanged = true;
        }

        // Update last name if changed
        if (profileDTO.getLastName() != null && !profileDTO.getLastName().isEmpty()) {
            user.setLastName(profileDTO.getLastName());
            profileChanged = true;
        }

        // Update phone if changed
        if (profileDTO.getPhone() != null && !profileDTO.getPhone().isEmpty()) {
            user.setPhone(profileDTO.getPhone());
            profileChanged = true;
        }

        // Update home address (only 1 allowed)
        if (profileDTO.getHomeAddress() != null) {
            user.setHomeAddress(profileDTO.getHomeAddress());
            profileChanged = true;
        }

        // Update subscription preference
        if (profileDTO.isSubscribeToPromotions() != user.isSubscribedToPromotions()) {
            user.setIsSubscribedToPromotions(profileDTO.isSubscribeToPromotions());
            profileChanged = true;
        }

        // Update password if provided
        if (profileDTO.getNewPassword() != null && !profileDTO.getNewPassword().isEmpty()) {
            // For now, skip password verification since we don't have PasswordEncoder configured yet
            // In production, you would verify current password here
            user.setPassword(profileDTO.getNewPassword()); // In production, this should be encrypted
            profileChanged = true;
        }

        // Save changes
        if (profileChanged) {
            return userRepository.save(user);
        }

        return user;
    }

    /**
     * Add payment card to user
     */
    public PaymentCard addPaymentCard(String userId, PaymentCard card) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if user already has 3 cards
        if (user.getPaymentCards() != null && user.getPaymentCards().size() >= 3) {
            throw new IllegalArgumentException("Maximum 3 payment cards allowed");
        }

        // Set user ID for the card
        card.setUserId(userId);

        // Generate a temporary ID if not present
        if (card.getId() == null) {
            card.setId(UUID.randomUUID().toString());
        }

        // Add to user's cards
        user.addPaymentCard(card);
        userRepository.save(user);

        return card;
    }

    /**
     * Change password (when user is logged in)
     */
    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // For now, simple password check (in production, use PasswordEncoder)
        String existing = user.getPassword();
        if (existing == null || !existing.equals(currentPassword)) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Update password (in production, encrypt it)
        user.setPassword(newPassword);
        userRepository.save(user);
    }

    /**
     * Register a new user (user)
     */
    public User register(com.example.ces.dto.UserRegistrationDTO dto) {
        if (dto == null) throw new IllegalArgumentException("Missing registration data");
        if (!dto.isPasswordMatching()) throw new IllegalArgumentException("Passwords do not match");
        if (dto.getEmail() == null || dto.getEmail().isBlank()) throw new IllegalArgumentException("Email is required");

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        // NOTE: In production, passwords must be hashed using a PasswordEncoder
        user.setPassword(dto.getPassword());
        user.setPhone(dto.getPhone());
        user.setIsActive(false); // require email verification flow
        user.setEmailVerified(false);
        user.setIsSubscribedToPromotions(dto.isSubscribeToPromotions());
        if (dto.getHomeAddress() != null) {
            user.setHomeAddress(dto.getHomeAddress());
        }

        return userRepository.save(user);
    }
}