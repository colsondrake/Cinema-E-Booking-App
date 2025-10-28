package com.example.ces.controller;

import com.example.ces.model.PasswordResetToken;
import com.example.ces.model.User;
import com.example.ces.repository.PasswordResetTokenRepository;
import com.example.ces.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class PasswordResetController {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;

    public PasswordResetController(PasswordResetTokenRepository passwordResetTokenRepository,
                                   UserRepository userRepository) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.userRepository = userRepository;
    }

    /**
     * Renders a minimal HTML form to accept a new password, given a valid token.
     * Example link: /api/auth/forgot-password?token=XYZ
     */
    @GetMapping(value = "/forgot-password", produces = MediaType.TEXT_HTML_VALUE)
    public String renderResetForm(@RequestParam("token") String token) {
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            return "<html><body><h3>Invalid or missing reset token.</h3></body></html>";
        }

        PasswordResetToken prt = tokenOpt.get();
        if (prt.isExpired() || prt.isUsed()) {
            return "<html><body><h3>This password reset link is invalid or expired.</h3></body></html>";
        }

        // Simple HTML form posts to /api/auth/reset-password
        return "<html><body>" +
                "<h2>Reset your password</h2>" +
                "<form method='POST' action='/api/auth/reset-password'>" +
                "<input type='hidden' name='token' value='" + token + "'/>" +
                "<label>New Password</label><br/>" +
                "<input type='password' name='newPassword' required minlength='8'/>" +
                "<br/><br/>" +
                "<button type='submit'>Save</button>" +
                "</form>" +
                "</body></html>";
    }

    /**
     * Handles the form submission to reset the password.
     */
    @PostMapping(value = "/reset-password")
    public ResponseEntity<?> handleReset(@RequestParam("token") String token,
                                         @RequestParam("newPassword") String newPassword) {
        try {
            if (newPassword == null || newPassword.trim().length() < 8) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters."));
            }

            Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token);
            if (tokenOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or missing token."));
            }

            PasswordResetToken prt = tokenOpt.get();
            if (prt.isExpired() || prt.isUsed()) {
                return ResponseEntity.badRequest().body(Map.of("error", "This reset link is invalid or expired."));
            }

            Optional<User> userOpt = userRepository.findById(prt.getUserId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found for this token."));
            }

            User user = userOpt.get();
            user.setPassword(newPassword); // Note: In production, hash this!
            userRepository.save(user);

            // Invalidate the token
            prt.setUsed(true);
            prt.setExpiryDate(LocalDateTime.now());
            passwordResetTokenRepository.save(prt);

            // Return simple HTML confirmation (works from browser click)
            String html = "<html><body><h3>Password updated successfully.</h3>" +
                    "<p>You can now close this tab and log in.</p></body></html>";
            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
        } catch (Exception e) {
            System.err.println("Failed to reset password: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred."));
        }
    }
}

