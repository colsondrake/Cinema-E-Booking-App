package com.example.ces.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// public class PasswordChangeDTO {
//     @NotBlank(message = "Current password is required")
//     private String currentPassword;
    
//     @NotBlank(message = "New password is required")
//     @Size(min = 8, message = "Password must be at least 8 characters long")
//     @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", 
//              message = "Password must contain at least one uppercase letter, one lowercase letter, and one digit")
//     private String newPassword;
    
//     @NotBlank(message = "Password confirmation is required")
//     private String confirmNewPassword;

//     // Getters and setters
//     public String getCurrentPassword() {
//         return currentPassword;
//     }

//     public void setCurrentPassword(String currentPassword) {
//         this.currentPassword = currentPassword;
//     }

//     public String getNewPassword() {
//         return newPassword;
//     }

//     public void setNewPassword(String newPassword) {
//         this.newPassword = newPassword;
//     }

//     public String getConfirmNewPassword() {
//         return confirmNewPassword;
//     }

//     public void setConfirmNewPassword(String confirmNewPassword) {
//         this.confirmNewPassword = confirmNewPassword;
//     }

//     // Validation method
//     public boolean isPasswordMatching() {
//         return newPassword != null && newPassword.equals(confirmNewPassword);
//     }
// }

public class PasswordChangeDTO {
    private String currentPassword;
    private String newPassword;
    private String confirmNewPassword;

    // Default constructor
    public PasswordChangeDTO() {
    }

    // Getters and setters
    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getConfirmNewPassword() {
        return confirmNewPassword;
    }

    public void setConfirmNewPassword(String confirmNewPassword) {
        this.confirmNewPassword = confirmNewPassword;
    }

    // Validation method
    public boolean isPasswordMatching() {
        return newPassword != null && newPassword.equals(confirmNewPassword);
    }
}






