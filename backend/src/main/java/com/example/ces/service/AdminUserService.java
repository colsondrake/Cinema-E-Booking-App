package com.example.ces.service;

import com.example.ces.model.User;
import com.example.ces.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =========================================
    // 1. List all users
    // =========================================
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // =========================================
    // 2. Get single user
    // =========================================
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }

    // =========================================
    // 3. Update basic info (name, email, phone, promos)
    // =========================================
    public User updateUserBasicInfo(String id, User updatedData) {
        User existing = getUserById(id);

        existing.setFirstName(updatedData.getFirstName());
        existing.setLastName(updatedData.getLastName());
        existing.setEmail(updatedData.getEmail());
        existing.setPhone(updatedData.getPhone());
        existing.setIsSubscribedToPromotions(updatedData.isSubscribedToPromotions());

        existing.setLastModified(LocalDateTime.now());

        return userRepository.save(existing);
    }

    // =========================================
    // 4. Change role (USER / CUSTOMER / ADMIN)
    // =========================================
    public User updateUserRole(String id, String newRole) {
        if (newRole == null || newRole.isBlank()) {
            throw new IllegalArgumentException("Role is required.");
        }

        String normalized = newRole.toUpperCase();

        if (!normalized.equals("ADMIN") &&
            !normalized.equals("USER")) {
            throw new IllegalArgumentException("Invalid role: " + newRole);
        }

        User existing = getUserById(id);
        existing.setRole(normalized);
        existing.setLastModified(LocalDateTime.now());

        return userRepository.save(existing);
    }

    // =========================================
    // 5. Suspend (set isActive = false)
    // =========================================
    public User suspendUser(String id) {
        User existing = getUserById(id);
        existing.setIsActive(false);
        existing.setLastModified(LocalDateTime.now());
        return userRepository.save(existing);
    }

    // =========================================
    // 7. Delete user
    // =========================================
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found.");
        }
        userRepository.deleteById(id);
    }
}
