package com.example.ces.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.ces.model.User;
import com.example.ces.service.UserService;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ----------------- Get user by ID (profile editing) -----------------
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ----------------- Registration -----------------
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            userService.registerUser(user); // token sent via email internally
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully. Please check your email to verify your account."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ----------------- Email Verification -----------------
    @GetMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestParam("token") String token) {
        boolean verified = userService.verifyUser(token);
        if (verified) {
            return ResponseEntity.ok(Map.of("message", "User verified successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }
    }

    // ----------------- Login -----------------
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginData) {
        try {
            String email = loginData.get("email");
            String password = loginData.get("password");
            User user = userService.login(email, password);
            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "userId", user.getId(),
                    "email", user.getEmail(),
                    "name", user.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ----------------- Forgot Password -----------------
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            userService.initiatePasswordReset(email); // token sent via email internally
            return ResponseEntity.ok(Map.of(
                    "message", "Password reset email sent. Please check your inbox."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ----------------- Reset Password -----------------
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        boolean success = userService.resetPassword(token, newPassword);

        if (success) {
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }
    }
}
