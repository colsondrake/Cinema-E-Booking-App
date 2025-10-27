package com.example.ces.dto;

import com.example.ces.model.Address;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// public class UserProfileDTO {

//     private String firstName;
//     private String lastName;

//     @Pattern(regexp = "^\\+?1?\\d{10,14}$", message = "Invalid phone number")
//     private String phone;

//     private Address homeAddress;

//     @Size(min = 8, message = "Password must be at least 8 characters long")
//     @Pattern(
//         regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
//         message = "Password must contain at least one uppercase letter, one lowercase letter, and one digit"
//     )
//     private String newPassword;

//     private boolean subscribeToPromotions;

//     // Getters & Setters
//     public String getFirstName() { return firstName; }
//     public void setFirstName(String firstName) { this.firstName = firstName; }

//     public String getLastName() { return lastName; }
//     public void setLastName(String lastName) { this.lastName = lastName; }

//     public String getPhone() { return phone; }
//     public void setPhone(String phone) { this.phone = phone; }

//     public Address getHomeAddress() { return homeAddress; }
//     public void setHomeAddress(Address homeAddress) { this.homeAddress = homeAddress; }

//     public String getNewPassword() { return newPassword; }
//     public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

//     public boolean isSubscribeToPromotions() { return subscribeToPromotions; }
//     public void setSubscribeToPromotions(boolean subscribeToPromotions) {
//         this.subscribeToPromotions = subscribeToPromotions;  // ✅ FIXED
//     }
// }

public class UserProfileDTO {
    private String firstName;
    private String lastName;
    private String phone;
    private Address homeAddress;
    private String newPassword;
    private boolean subscribeToPromotions;

    // Default constructor
    public UserProfileDTO() {
    }

    // Getters and setters
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Address getHomeAddress() {
        return homeAddress;
    }

    public void setHomeAddress(Address homeAddress) {
        this.homeAddress = homeAddress;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public boolean isSubscribeToPromotions() {
        return subscribeToPromotions;
    }

    public void setSubscribeToPromotions(boolean subscribeToPromotions) {
        this.subscribeToPromotions = subscribeToPromotions;
    }
}






