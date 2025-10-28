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
    //private final VerificationTokenRepository verificationTokenRepository;
    //private final EmailService emailService;

    /* 
    public UserService(UserRepository userRepository,
                       VerificationTokenRepository verificationTokenRepository,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.emailService = emailService;
    }
    */
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

        // Update address if this is a Customer
        if (user instanceof Customer) {
            Customer Customer = (Customer) user;
            
            // Update home address (only 1 allowed)
            if (profileDTO.getHomeAddress() != null) {
                Customer.setHomeAddress(profileDTO.getHomeAddress());
                profileChanged = true;
            }

            // Update subscription preference
            if (profileDTO.isSubscribeToPromotions() != Customer.isSubscribedToPromotions()) {
                Customer.setIsSubscribedToPromotions(profileDTO.isSubscribeToPromotions());
                profileChanged = true;
            }
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

        if (!(user instanceof Customer)) {
            throw new IllegalArgumentException("Only web users can have payment cards");
        }

        Customer customer = (Customer) user;

        // Check if user already has 3 cards
        if (customer.getPaymentCards() != null && customer.getPaymentCards().size() >= 3) {
            throw new IllegalArgumentException("Maximum 3 payment cards allowed");
        }

        // Set user ID for the card
        card.setUserId(userId);
        
        // Generate a temporary ID if not present
        if (card.getId() == null) {
            card.setId(UUID.randomUUID().toString());
        }

        // Add to user's cards
        customer.addPaymentCard(card);
        userRepository.save(customer);

        return card;
    }

    /**
     * Change password (when user is logged in)
     */
    public void changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // For now, simple password check (in production, use PasswordEncoder)
        if (!user.getPassword().equals(currentPassword)) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Update password (in production, encrypt it)
        user.setPassword(newPassword);
        userRepository.save(user);
    }

    /**
     * Register a new user (Customer)
     */
    public User register(com.example.ces.dto.UserRegistrationDTO dto) {
        if (dto == null) throw new IllegalArgumentException("Missing registration data");
        if (!dto.isPasswordMatching()) throw new IllegalArgumentException("Passwords do not match");
        if (dto.getEmail() == null || dto.getEmail().isBlank()) throw new IllegalArgumentException("Email is required");

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Customer customer = new Customer();
        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setEmail(dto.getEmail());
        // NOTE: In production, passwords must be hashed using a PasswordEncoder
        customer.setPassword(dto.getPassword());
        customer.setPhone(dto.getPhone());
        customer.setIsActive(false); // require email verification flow
        customer.setIsSubscribedToPromotions(dto.isSubscribeToPromotions());
        if (dto.getHomeAddress() != null) {
            customer.setHomeAddress(dto.getHomeAddress());
        }

        return userRepository.save(customer);

        //String token = java.util.UUID.randomUUID().toString();
        //VerificationToken vt = new VerificationToken(token, saved);
        //verificationTokenRepository.save(vt);

        //emailService.sendRegistrationConfirmationEmail(saved.getEmail(), saved.getFirstName(), token);

        //return saved;

        
    }
}