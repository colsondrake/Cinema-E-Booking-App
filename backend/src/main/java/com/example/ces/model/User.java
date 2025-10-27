// package com.example.ces.model;

// import org.springframework.data.annotation.Id;

// // Abstract User class that WebUser and Admin will extend
// public abstract class User {
//     // Define data members
//     @Id
//     private String id;
//     private String name;
//     private String email;
//     private String phone;
//     private String password;
//     private String homeAddress; // Optional upon registration
//     private boolean isLoggedIn = false; // To track if the user is currently logged in

//     // Default constructor
//     public User() {
//     }

//     // Convenience constructor with id
//     public User(String id) {
//         setId(id);
//     }

//     // Convenience constructor
//     public User(String id, String name, String email, String password,
//             String phone, String homeAddress, boolean isLoggedIn) {
//         setId(id);
//         setName(name);
//         setEmail(email);
//         setPassword(password);
//         setPhone(phone);
//         setHomeAddress(homeAddress);
//         setIsLoggedIn(isLoggedIn);
//     }

//     // Getters and setters
//     public String getId() {
//         return id;
//     }

//     public void setId(String id) {
//         this.id = id;
//     }

//     public String getName() {
//         return name;
//     }

//     public void setName(String name) {
//         this.name = name;
//     }

//     public String getEmail() {
//         return email;
//     }

//     public void setEmail(String email) {
//         this.email = email;
//     }

//     public String getPassword() {
//         return password;
//     }

//     public void setPassword(String password) {
//         this.password = password;
//     }

//     public String getPhone() {
//         return phone;
//     }

//     public void setPhone(String phone) {
//         this.phone = phone;
//     }

//     public String getHomeAddress() {
//         return homeAddress;
//     }

//     public void setHomeAddress(String homeAddress) {
//         this.homeAddress = homeAddress;
//     }

//     public boolean getIsLoggedIn() {
//         return isLoggedIn;
//     }

//     public void setIsLoggedIn(boolean isLoggedIn) {
//         this.isLoggedIn = isLoggedIn;
//     }
// }

package com.example.ces.model;

import org.springframework.data.annotation.Id;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import org.springframework.data.mongodb.core.mapping.Field;

// Abstract User class that WebUser and Admin will extend
public abstract class User {
    // Define data members
    @Id
    private String id;
    private String firstName;  // Changed from 'name' to split into firstName/lastName
    private String lastName;
    private String email;
    private String phone;
    @JsonIgnore // Don't send password in JSON responses
    private String password;
    private boolean isLoggedIn = false;

    @Field("emailVerified")
    private boolean emailVerified = false; // To track if the user has verified their email
    private boolean isActive = false; // Active/Inactive status
    private String role; // "USER" or "ADMIN"
    private LocalDateTime createdAt;
    private LocalDateTime lastModified;
    private String verificationToken;
    private LocalDateTime tokenExpiryDate;

    // Default constructor
    public User() {
        this.createdAt = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
    }

    // Convenience constructor with id
    public User(String id) {
        this();
        setId(id);
    }

    // Updated convenience constructor for backward compatibility
    public User(String id, String name, String email, String password,
            String phone, String homeAddress, boolean isLoggedIn) {
        this();
        setId(id);
        // Split name into first and last (for backward compatibility)
        if (name != null && name.contains(" ")) {
            String[] parts = name.split(" ", 2);
            setFirstName(parts[0]);
            setLastName(parts.length > 1 ? parts[1] : "");
        } else {
            setFirstName(name);
            setLastName("");
        }
        setEmail(email);
        setPassword(password);
        setPhone(phone);
        setIsLoggedIn(isLoggedIn);
    }

    // New full constructor
    public User(String id, String firstName, String lastName, String email, 
                String password, String phone, boolean isLoggedIn, 
                boolean emailVerified, boolean isActive, String role) {
        this();
        setId(id);
        setFirstName(firstName);
        setLastName(lastName);
        setEmail(email);
        setPassword(password);
        setPhone(phone);
        setIsLoggedIn(isLoggedIn);
        setEmailVerified(emailVerified);
        setIsActive(isActive);
        setRole(role);
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
        this.lastModified = LocalDateTime.now();
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
        this.lastModified = LocalDateTime.now();
    }

    // Keep getName() for backward compatibility
    public String getName() {
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        }
        return firstName != null ? firstName : "";
    }

    public void setName(String name) {
        if (name != null && name.contains(" ")) {
            String[] parts = name.split(" ", 2);
            setFirstName(parts[0]);
            setLastName(parts.length > 1 ? parts[1] : "");
        } else {
            setFirstName(name);
            setLastName("");
        }
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
        this.lastModified = LocalDateTime.now();
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
        this.lastModified = LocalDateTime.now();
    }

    // Keep old method name for backward compatibility
    public String getHomeAddress() {
        // This is now handled in WebUser with proper Address object
        return null;
    }

    public void setHomeAddress(String homeAddress) {
        // This is now handled in WebUser with proper Address object
    }

    public boolean getVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastModified() {
        return lastModified;
    }

    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }

    public LocalDateTime getTokenExpiryDate() {
        return tokenExpiryDate;
    }

    public void setTokenExpiryDate(LocalDateTime tokenExpiryDate) {
        this.tokenExpiryDate = tokenExpiryDate;
    }
}