package com.example.ces.model;

import org.springframework.data.mongodb.core.mapping.Document;

// Admin class extending User
@Document(collection = "admins")
public class Admin extends User {

    // Default constructor
    public Admin() {
        super();
    }

    // Convenience constructor to create Admin with only id and password (only required fields)
    public Admin(String id, String password) {
        // super(id, password);
    }

    // Admin-specific methods
    public void manageMovies() {
        // Implementation for managing movies
    }
    
    public void managePromotions() {
        // Implementation for managing promotions
    }

    public void manageTicketPrices() {
        // Implementation for managing ticket prices
    }

    public void manageUsers() {
        // Implementation for managing users
    }

    public void manageAdministrators() {
        // Implementation for managing administrators
    }
}
