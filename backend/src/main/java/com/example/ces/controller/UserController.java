package com.example.ces.controller;

import com.example.ces.model.PaymentCard;
import com.example.ces.model.User;
import com.example.ces.service.UserService;
import com.example.ces.service.EmailService;
import com.example.ces.model.VerificationToken;
import com.example.ces.repository.VerificationTokenRepository;
import java.util.UUID;
import com.example.ces.dto.UserProfileDTO;
import com.example.ces.dto.UserRegistrationDTO;
import com.example.ces.dto.PasswordChangeDTO;
import com.example.ces.dto.LoginRequestDTO;
import com.example.ces.dto.ForgotPasswordRequestDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;
    @Autowired
    private com.example.ces.repository.PasswordResetTokenRepository passwordResetTokenRepository;

    /** Fetch user profile by ID */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable String id,
                                            @RequestHeader(value = "X-User-Id", required = false) String callerId,
                                            @RequestHeader(value = "X-User-Role", required = false) String callerRole) {
        // Only owner or ADMIN can fetch full profile
        if (!isAuthorized(callerId, callerRole, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized"));
        }

        return userService.getUserById(id)
                .map(user -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", user.getId());
                    response.put("firstName", user.getFirstName());
                    response.put("lastName", user.getLastName());
                    response.put("email", user.getEmail());
                    response.put("phone", user.getPhone());
                    response.put("emailVerified", user.isEmailVerified());
                    response.put("isActive", user.isActive());
                    response.put("homeAddress", user.getHomeAddress());
                    response.put("paymentCards", user.getPaymentCards());
                    response.put("subscribeToPromotions", user.isSubscribedToPromotions());

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Login endpoint (checks username and password)
     * Accepts JSON body: { "username": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginDTO) {
        try {
            User user = userService.login(loginDTO.getUsername().trim(), loginDTO.getPassword().trim());

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("phone", user.getPhone());
            response.put("role", user.getRole());
            response.put("emailVerified", user.isEmailVerified());
            response.put("isActive", user.isActive());
            response.put("homeAddress", user.getHomeAddress());
            response.put("paymentCards", user.getPaymentCards());
            response.put("subscribeToPromotions", user.isSubscribedToPromotions());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /** Register a new user */
    @PostMapping("")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDTO regDTO) {
        try {
            User created = userService.register(regDTO);
            // Create and persist a VerificationToken tied to the newly created user,
            // then send the registration confirmation email with that token.
            String confirmationToken = UUID.randomUUID().toString();
            try {
                VerificationToken vt = new VerificationToken(confirmationToken, created);
                verificationTokenRepository.save(vt);

                // Optionally store token on the user document for quick reference
                try {
                    created.setVerificationToken(confirmationToken);
                    created.setTokenExpiryDate(vt.getExpiresAt());
                    // userService.register already saved the user; update save via userService if
                    // available.
                    // We attempt to update by calling userService.updateUserProfile as a
                    // lightweight save if present,
                    // otherwise the VerificationToken DBRef is sufficient for verification flows.
                    // (Avoid introducing new service methods in this quick change.)
                } catch (Exception ignored) {
                    // ignore failures to set fields on returned object
                }

                emailService.sendRegistrationConfirmationEmail(created.getEmail(), created.getFirstName(),
                        confirmationToken);
            } catch (Exception e) {
                // Don't fail registration if token persistence or email sending fails; log for
                // debugging
                System.err.println("Failed to create/send verification token: " + e.getMessage());
            }
            Map<String, Object> resp = new HashMap<>();
            resp.put("id", created.getId());
            resp.put("firstName", created.getFirstName());
            resp.put("lastName", created.getLastName());
            resp.put("email", created.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to register user"));
        }
    }

    /** Update user profile */
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable String id,
            @Valid @RequestBody UserProfileDTO profileDTO,
            @RequestParam(required = false) String currentPassword,
            @RequestHeader(value = "X-User-Id", required = false) String callerId,
            @RequestHeader(value = "X-User-Role", required = false) String callerRole) {
        try {
            // Authorization: only the owner or ADMIN can update the profile
            if (!isAuthorized(callerId, callerRole, id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized"));
            }
            if (profileDTO.getNewPassword() != null && !profileDTO.getNewPassword().isEmpty()) {
                if (currentPassword == null || currentPassword.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Current password is required to change password"));
                }
            }
            User updatedUser = userService.updateUserProfile(id, profileDTO, currentPassword);
            return ResponseEntity.ok(Map.of(
                    "message", "Profile updated successfully",
                    "user", Map.of(
                            "id", updatedUser.getId(),
                            "firstName", updatedUser.getFirstName(),
                            "lastName", updatedUser.getLastName(),
                            "email", updatedUser.getEmail(),
                            "phone", updatedUser.getPhone())));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update profile"));
        }
    }

    @PostMapping("/{id}/payment-cards")
    public ResponseEntity<?> addPaymentCard(@PathVariable String id, @Valid @RequestBody PaymentCard card,
                                            @RequestHeader(value = "X-User-Id", required = false) String callerId,
                                            @RequestHeader(value = "X-User-Role", required = false) String callerRole) {
        // Authorization: only owner or ADMIN can add a payment card for the user
        if (!isAuthorized(callerId, callerRole, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized"));
        }
        try {
            PaymentCard savedCard = userService.addPaymentCard(id, card);

            if (savedCard == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Failed to add payment card"));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Payment card added successfully",
                    "card", Map.of(
                            "id", savedCard.getId(),
                            "cardType", savedCard.getCardType(),
                            "lastFourDigits", savedCard.getLastFourDigits(),
                            "expiryDate", savedCard.getExpiryDate(),
                            "cardholderName", savedCard.getCardholderName())));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred while adding payment card"));
        }
    }

    /** Get user's payment cards */
    @GetMapping("/{id}/payment-cards")
    public ResponseEntity<?> getPaymentCards(@PathVariable String id,
                                             @RequestHeader(value = "X-User-Id", required = false) String callerId,
                                             @RequestHeader(value = "X-User-Role", required = false) String callerRole) {
        if (!isAuthorized(callerId, callerRole, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized"));
        }

        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(user.getPaymentCards()))
                .orElse(ResponseEntity.notFound().build());
    }

    /** Change password */
    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable String id, @Valid @RequestBody PasswordChangeDTO dto,
                                            @RequestHeader(value = "X-User-Id", required = false) String callerId,
                                            @RequestHeader(value = "X-User-Role", required = false) String callerRole) {
        // Only owner or ADMIN can change the password
        if (!isAuthorized(callerId, callerRole, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized"));
        }
        try {
            if (!dto.isPasswordMatching()) {
                return ResponseEntity.badRequest().body(Map.of("error", "New passwords do not match"));
            }
            userService.changePassword(id, dto.getCurrentPassword(), dto.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Logout (clear login state). Requires owner or ADMIN */
    @PostMapping("/{id}/logout")
    public ResponseEntity<?> logout(@PathVariable String id,
                                    @RequestHeader(value = "X-User-Id", required = false) String callerId,
                                    @RequestHeader(value = "X-User-Role", required = false) String callerRole) {
        if (!isAuthorized(callerId, callerRole, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Not authorized"));
        }

        try {
            userService.logout(id);
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to logout"));
        }
    }

    /**
     * Forgot Password - request a password reset email by email address.
     * Accepts JSON body: { "email": "user@example.com" }
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody ForgotPasswordRequestDTO dto) {
        String email = dto.getEmail();

        return userService.getUserByEmail(email)
                .map(user -> {
                    // Remove existing reset tokens for this user to avoid multiple valid tokens
                    try {
                        passwordResetTokenRepository.deleteByUserId(user.getId());
                    } catch (Exception ignored) {
                    }

                    // Create and save a new password reset token
                    String token = UUID.randomUUID().toString();
                    com.example.ces.model.PasswordResetToken prt = new com.example.ces.model.PasswordResetToken(token,
                            user.getId(), user.getEmail());
                    passwordResetTokenRepository.save(prt);

                    // Send password reset email
                    String userName = (user.getFirstName() != null && !user.getFirstName().isBlank())
                            ? user.getFirstName()
                            : (user.getFullName() != null ? user.getFullName() : "User");
                    emailService.sendPasswordResetEmail(user.getEmail(), userName, token);

                    Map<String, Object> body = new HashMap<>();
                    body.put("message", "Password reset email sent");
                    body.put("success", true);
                    return ResponseEntity.ok(body);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "error", "User not found")));
    }
    // Helper: simple authorization check — caller must be the owner or have ADMIN role.
    private boolean isAuthorized(String callerId, String callerRole, String targetUserId) {
        if (callerRole != null && callerRole.equalsIgnoreCase("ADMIN")) return true;
        if (callerId == null) return false;
        return callerId.equals(targetUserId);
    }


    // Check if email exists
    @GetMapping("/exists")
    public ResponseEntity<?> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.emailExists(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    // Check if email is verified
    @GetMapping("/verify-email")
    public ResponseEntity<?> checkEmailVerified(@RequestParam String email) {
        boolean verified = userService.isEmailVerified(email);
        return ResponseEntity.ok(Map.of("emailVerified", verified));
    }



   @PostMapping("/change-password-by-email")
   public ResponseEntity<?> changePasswordByEmail(@RequestBody Map<String, String> body) {
       String email = body.get("email");
       String currentPassword = body.get("currentPassword");
       String newPassword = body.get("newPassword");


       try {
           String userId = userService.getUserByEmail(email)
               .map(User::getId)
               .orElseThrow(() -> new IllegalArgumentException("User not found"));


           userService.changePassword(userId, currentPassword, newPassword);
           return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
       } catch (IllegalArgumentException e) {
           return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
       } catch (Exception e) {
           return ResponseEntity.status(500).body(Map.of("error", "Unexpected error occurred"));
       }
   }




}


