package com.example.ces.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

// Admin class extending User
@Document(collection = "admins")
public class Admin extends User {
    // Additional fields and methods specific to Admin will be added here when needed

    // Default constructor
    public Admin() {
        super();
    }

    // Convenience constructor
    public Admin(String id, String name, String email, String password,
            String phone, String homeAddress, boolean isLoggedIn) {
        super(id, name, email, password, phone, homeAddress, isLoggedIn);
    }

    // Methods for admin-specific functionalities will be added here when needed
    
}
