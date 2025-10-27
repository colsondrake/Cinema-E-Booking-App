// package com.example.ces.service;

// import java.util.Optional;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import com.example.ces.model.User;
// import com.example.ces.repository.UserRepository;

// @Service
// public class UserService {

//     private final UserRepository userRepository;

//     @Autowired
//     public UserService(UserRepository userRepository) {
//         this.userRepository = userRepository;
//     }

//     /**
//      * Retrieve a user by id.
//      *
//      * @param id user id
//      * @return Optional<User> present if found
//      */
//     public Optional<User> getUserById(String id) {
//         return userRepository.findById(id);
//     }
// }

package com.example.ces.service;

import com.example.ces.model.*;
import com.example.ces.repository.*;
import com.example.ces.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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

        // Update address if this is a WebUser
        if (user instanceof WebUser) {
            WebUser webUser = (WebUser) user;
            
            // Update home address (only 1 allowed)
            if (profileDTO.getHomeAddress() != null) {
                webUser.setHomeAddress(profileDTO.getHomeAddress());
                profileChanged = true;
            }

            // Update subscription preference
            if (profileDTO.isSubscribeToPromotions() != webUser.isSubscribedToPromotions()) {
                webUser.setIsSubscribedToPromotions(profileDTO.isSubscribeToPromotions());
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

        if (!(user instanceof WebUser)) {
            throw new IllegalArgumentException("Only web users can have payment cards");
        }

        WebUser webUser = (WebUser) user;

        // Check if user already has 3 cards
        if (webUser.getPaymentCards() != null && webUser.getPaymentCards().size() >= 3) {
            throw new IllegalArgumentException("Maximum 3 payment cards allowed");
        }

        // Set user ID for the card
        card.setUserId(userId);
        
        // Generate a temporary ID if not present
        if (card.getId() == null) {
            card.setId(UUID.randomUUID().toString());
        }

        // Add to user's cards
        webUser.addPaymentCard(card);
        userRepository.save(webUser);

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
}
