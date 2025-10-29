package com.example.ces.service;

import com.example.ces.model.*;
import com.example.ces.repository.*;
import com.example.ces.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.ces.service.EmailService;
import com.example.ces.util.AESEncryptionService;

import java.util.*;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // ✅ inject BCryptPasswordEncoder

    @Autowired
    private AESEncryptionService encryptionService;

    @Autowired
    private EmailService emailService;

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
     * Login user with email/password
     */
    public User login(String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Email and password must not be empty");
        }

        // Trim input to avoid accidental whitespace issues
        String trimmedEmail = email.trim();
        String trimmedPassword = password.trim();

        User user = userRepository.findByEmail(trimmedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Debugging: Uncomment if login fails to see what's being compared
        System.out.println("Login password: " + trimmedPassword);
        System.out.println("Stored hash: " + user.getPassword());
        System.out.println("Matches? " + passwordEncoder.matches(trimmedPassword,
                user.getPassword()));

        if (!passwordEncoder.matches(trimmedPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Mark user as logged in and persist (helps demo logout/session behavior)
        try {
            user.setIsLoggedIn(true);
            userRepository.save(user);
        } catch (Exception ignored) {}

        return user;
    }

    /**
     * Logout user (clear logged-in flag)
     */
    public void logout(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setIsLoggedIn(false);
        userRepository.save(user);
    }

    /**
     * Update user profile
     */
    public User updateUserProfile(String userId, UserProfileDTO profileDTO, String currentPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean profileChanged = false;

        if (profileDTO.getFirstName() != null && !profileDTO.getFirstName().isEmpty()) {
            user.setFirstName(profileDTO.getFirstName());
            profileChanged = true;
        }

        if (profileDTO.getLastName() != null && !profileDTO.getLastName().isEmpty()) {
            user.setLastName(profileDTO.getLastName());
            profileChanged = true;
        }

        if (profileDTO.getPhone() != null && !profileDTO.getPhone().isEmpty()) {
            user.setPhone(profileDTO.getPhone());
            profileChanged = true;
        }

        if (profileDTO.getHomeAddress() != null) {
            user.setHomeAddress(profileDTO.getHomeAddress());
            profileChanged = true;
        }

        if (profileDTO.isSubscribeToPromotions() != user.isSubscribedToPromotions()) {
            user.setIsSubscribedToPromotions(profileDTO.isSubscribeToPromotions());
            profileChanged = true;
        }

        // ✅ Update password securely
        if (profileDTO.getNewPassword() != null && !profileDTO.getNewPassword().isEmpty()) {
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                throw new IllegalArgumentException("Current password is incorrect");
            }
            user.setPassword(passwordEncoder.encode(profileDTO.getNewPassword())); // ✅ hash new password
            profileChanged = true;
        }

        if (profileChanged) {
            User saved = userRepository.save(user);
            try {
                // Send notification email about profile change (best-effort)
                String userName = (saved.getFirstName() != null && !saved.getFirstName().isBlank()) ? saved.getFirstName() : saved.getFullName();
                emailService.sendProfileChangeNotification(saved.getEmail(), userName, "profile updated");
            } catch (Exception ignored) {
                // Do not fail the operation if email sending fails
            }
            return saved;
        }

        return user;
    }

    /**
     * Add payment card to user
     */
    public PaymentCard addPaymentCard(String userId, PaymentCard card) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getPaymentCards() != null && user.getPaymentCards().size() >= 3) {
            throw new IllegalArgumentException("Maximum 3 payment cards allowed");
        }

        card.setUserId(userId);

        // Encrypt sensitive payment information before persisting
        if (card.getCardNumber() != null && !card.getCardNumber().isEmpty()) {
            // store encrypted full number
            card.setEncryptedCardNumber(encryptionService.encrypt(card.getCardNumber()));
            // ensure last four digits are set (PaymentCard#setCardNumber extracts these)
            if (card.getLastFourDigits() == null || card.getLastFourDigits().isEmpty()) {
                String cn = card.getCardNumber();
                if (cn.length() >= 4) {
                    card.setLastFourDigits(cn.substring(cn.length() - 4));
                }
            }
            // Remove plain card number so it's not stored in cleartext
            card.setCardNumber(null);
        }

        if (card.getCvv() != null && !card.getCvv().isEmpty()) {
            card.setEncryptedCvv(encryptionService.encrypt(card.getCvv()));
            // remove plaintext
            card.setCvv(null);
        }

        if (card.getId() == null) {
            card.setId(UUID.randomUUID().toString());
        }

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

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword)); // ✅ hashed
        userRepository.save(user);
    }

    /**
     * Register a new user (user)
     */
    public User register(UserRegistrationDTO dto) {
        if (dto == null)
            throw new IllegalArgumentException("Missing registration data");
        if (!dto.isPasswordMatching())
            throw new IllegalArgumentException("Passwords do not match");
        if (dto.getEmail() == null || dto.getEmail().isBlank())
            throw new IllegalArgumentException("Email is required");

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword())); // ✅ hash before save
        user.setPhone(dto.getPhone());
        user.setIsActive(false);
        user.setIsSubscribedToPromotions(dto.isSubscribeToPromotions());

        if (dto.getHomeAddress() != null) {
            user.setHomeAddress(dto.getHomeAddress());
        }

        return userRepository.save(user);
    }
}
