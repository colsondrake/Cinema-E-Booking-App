package com.example.ces.controller;

import com.example.ces.model.User;
import com.example.ces.service.AdminUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    // =========================================
    // 1. Get all users
    // =========================================
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    // =========================================
    // 2. Get single user
    // =========================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        try {
            return ResponseEntity.ok(adminUserService.getUserById(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }
    }

    // =========================================
    // 3. Update basic info (name, email, phone, promos)
    // =========================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserBasicInfo(
            @PathVariable String id,
            @RequestBody User updatedData) {
        try {
            User updated = adminUserService.updateUserBasicInfo(id, updatedData);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }
    }

    // =========================================
    // 4. Change role (give/remove admin)
    //    Example: PUT /api/admin/users/{id}/role?role=ADMIN
    // =========================================
    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable String id,
            @RequestParam String role) {
        try {
            User updated = adminUserService.updateUserRole(id, role);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }
    }

    // =========================================
    // 5. Suspend user (isActive = false)
    // =========================================
    @PutMapping("/{id}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable String id) {
        try {
            User updated = adminUserService.suspendUser(id);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }
    }


    // =========================================
    // 6. Delete user
    // =========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            adminUserService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }
    }
}
