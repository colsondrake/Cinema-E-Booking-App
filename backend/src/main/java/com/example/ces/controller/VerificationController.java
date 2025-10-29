package com.example.ces.controller;

import com.example.ces.model.User;
import com.example.ces.model.VerificationToken;
import com.example.ces.repository.VerificationTokenRepository;
import com.example.ces.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class VerificationController {

    private final VerificationTokenRepository verificationTokenRepository;
    private final UserRepository userRepository;

    public VerificationController(VerificationTokenRepository verificationTokenRepository,
                                  UserRepository userRepository) {
        this.verificationTokenRepository = verificationTokenRepository;
        this.userRepository = userRepository;
    }

    /** Frontend posts: { "token": "<uuid>" } */
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing token"));
        }

        var vtOpt = verificationTokenRepository.findByToken(token);
        if (vtOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid token"));
        }

        VerificationToken vt = vtOpt.get();
        if (vt.getExpiresAt() != null && vt.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token has expired"));
        }

        var userOpt = userRepository.findById(vt.getUser().getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        user.setEmailVerified(true);
        user.setIsActive(true);
        userRepository.save(user);

        verificationTokenRepository.save(vt);

        return ResponseEntity.ok(Map.of("message", "Email verified"));
    }
}
