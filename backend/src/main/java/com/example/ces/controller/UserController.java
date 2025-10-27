// package com.example.ces.controller;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.beans.factory.annotation.Autowired;

// import com.example.ces.model.User;
// import com.example.ces.service.UserService;

// @RestController
// @RequestMapping("/api/users")
// @CrossOrigin(origins = "http://localhost:3000")
// public class UserController {

//     private final UserService userService;

//     @Autowired
//     public UserController(UserService userService) {
//         this.userService = userService;
//     }

//     // GET to return user for profile editing
//     @GetMapping("/{id}")
//     public ResponseEntity<User> getUserById(@PathVariable String id) {
//         return userService.getUserById(id)
//                           .map(ResponseEntity::ok)
//                           .orElseGet(() -> ResponseEntity.notFound().build());
//     }
// }
//______________________________________________________________
// package com.example.ces.controller;

// import com.example.ces.model.PaymentCard;
// import com.example.ces.model.User;
// import com.example.ces.model.WebUser;
// import com.example.ces.service.UserService;
// import com.example.ces.dto.UserProfileDTO;
// import com.example.ces.dto.PasswordChangeDTO;
// import jakarta.validation.Valid;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.http.HttpStatus;
// import org.springframework.web.bind.annotation.*;
// import java.util.Map;
// import java.util.HashMap;

// @RestController
// @RequestMapping("/api/users")
// @CrossOrigin(origins = "http://localhost:3000")
// public class UserController {

//     @Autowired
//     private UserService userService;

//     /** Fetch user profile by ID */
//     @GetMapping("/{id}")
//     public ResponseEntity<?> getUserProfile(@PathVariable String id) {
//         return userService.getUserById(id)
//             .map(user -> {
//                 Map<String, Object> response = new HashMap<>();
//                 response.put("id", user.getId());
//                 response.put("firstName", user.getFirstName());
//                 response.put("lastName", user.getLastName());
//                 response.put("email", user.getEmail());
//                 response.put("phone", user.getPhone());
//                 response.put("emailVerified", user.isEmailVerified());
//                 response.put("isActive", user.isActive());
//                 if (user instanceof WebUser webUser) {
//                     response.put("homeAddress", webUser.getHomeAddress());
//                     response.put("paymentCards", webUser.getPaymentCards());
//                     response.put("subscribeToPromotions", webUser.isSubscribedToPromotions());
//                 }
//                 return ResponseEntity.ok(response);
//             })
//             .orElse(ResponseEntity.notFound().build());
//     }

//     /** Update user profile */
//     @PutMapping("/{id}/profile")
//     public ResponseEntity<?> updateProfile(
//         @PathVariable String id,
//         @Valid @RequestBody UserProfileDTO profileDTO,
//         @RequestParam(required = false) String currentPassword
//     ) {
//         try {
//             if (profileDTO.getNewPassword() != null && !profileDTO.getNewPassword().isEmpty()) {
//                 if (currentPassword == null || currentPassword.isEmpty()) {
//                     return ResponseEntity.badRequest()
//                         .body(Map.of("error", "Current password is required to change password"));
//                 }
//             }

//             User updatedUser = userService.updateUserProfile(id, profileDTO, currentPassword);
//             return ResponseEntity.ok(Map.of(
//                 "message", "Profile updated successfully",
//                 "user", Map.of(
//                     "id", updatedUser.getId(),
//                     "firstName", updatedUser.getFirstName(),
//                     "lastName", updatedUser.getLastName(),
//                     "email", updatedUser.getEmail(),
//                     "phone", updatedUser.getPhone()
//                 )
//             ));
//         } catch (IllegalArgumentException e) {
//             return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//         } catch (Exception e) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(Map.of("error", "Failed to update profile"));
//         }
//     }

//     /** Add new payment card */
//     @PostMapping("/{id}/payment-cards")
//     public ResponseEntity<?> addPaymentCard(@PathVariable String id, @Valid @RequestBody PaymentCard card) {
//         try {
//             PaymentCard savedCard = userService.addPaymentCard(id, card);
//             return ResponseEntity.ok(Map.of(
//                 "message", "Payment card added successfully",
//                 "card", Map.of(
//                     "id", savedCard.getId(),
//                     "cardType", savedCard.getCardType(),
//                     "lastFourDigits", savedCard.getLastFourDigits(),
//                     "expiryDate", savedCard.getExpiryDate(),
//                     "cardholderName", savedCard.getCardholderName()
//                 )
//             ));
//         } catch (IllegalArgumentException e) {
//             return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//         }
//     }

//     /** Get user's payment cards */
//     @GetMapping("/{id}/payment-cards")
//     public ResponseEntity<?> getPaymentCards(@PathVariable String id) {
//         return userService.getUserById(id)
//             .map(user -> {
//                 if (user instanceof WebUser webUser) {
//                     return ResponseEntity.ok(webUser.getPaymentCards());
//                 }
//                 return ResponseEntity.ok(Map.of("cards", new Object[0]));
//             })
//             .orElse(ResponseEntity.notFound().build());
//     }

//     /** Change password */
//     @PostMapping("/{id}/change-password")
//     public ResponseEntity<?> changePassword(@PathVariable String id, @Valid @RequestBody PasswordChangeDTO dto) {
//         try {
//             if (!dto.isPasswordMatching()) {
//                 return ResponseEntity.badRequest().body(Map.of("error", "New passwords do not match"));
//             }
//             userService.changePassword(id, dto.getCurrentPassword(), dto.getNewPassword());
//             return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
//         } catch (IllegalArgumentException e) {
//             return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//         }
//     }
// }

//______________________________________________________________

package com.example.ces.controller;

import com.example.ces.model.PaymentCard;
import com.example.ces.model.User;
import com.example.ces.model.WebUser;
import com.example.ces.service.UserService;
import com.example.ces.dto.UserProfileDTO;
import com.example.ces.dto.PasswordChangeDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    /** Fetch user profile by ID */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable String id) {
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
                if (user instanceof WebUser webUser) {
                    response.put("homeAddress", webUser.getHomeAddress());
                    response.put("paymentCards", webUser.getPaymentCards());
                    response.put("subscribeToPromotions", webUser.isSubscribedToPromotions());
                }
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /** Update user profile */
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(
        @PathVariable String id,
        @Valid @RequestBody UserProfileDTO profileDTO,
        @RequestParam(required = false) String currentPassword
    ) {
        try {
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
                    "phone", updatedUser.getPhone()
                )
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update profile"));
        }
    }

    /** ✅ Fixed Add new payment card (null-safe + robust) */
    @PostMapping("/{id}/payment-cards")
    public ResponseEntity<?> addPaymentCard(@PathVariable String id, @Valid @RequestBody PaymentCard card) {
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
                    "cardholderName", savedCard.getCardholderName()
                )
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred while adding payment card"));
        }
    }

    /** Get user's payment cards */
    @GetMapping("/{id}/payment-cards")
    public ResponseEntity<?> getPaymentCards(@PathVariable String id) {
        return userService.getUserById(id)
            .map(user -> {
                if (user instanceof WebUser webUser) {
                    return ResponseEntity.ok(webUser.getPaymentCards());
                }
                return ResponseEntity.ok(Map.of("cards", new Object[0]));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /** Change password */
    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable String id, @Valid @RequestBody PasswordChangeDTO dto) {
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
}
