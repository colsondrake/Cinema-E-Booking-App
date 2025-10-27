package com.example.ces.model;

import org.springframework.data.mongodb.core.mapping.Document;

// Admin class extending User
@Document(collection = "admins")
public class Admin extends User {

    // Default constructor
    public Admin() {
        super();
    }

    // Convenience constructor
    public Admin(String id, String name, String email, String password,
            String phone, String homeAddress, boolean verified,
            String verificationToken, String resetToken) {
        super(id, name, email, password, phone, homeAddress, verified,
                verificationToken, resetToken);
    }

    // Admin-specific methods can be added here later
}