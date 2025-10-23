package com.example.ces.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "users")
public class User {
    // Define data members
    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private String password;
    private String shippingAddress;
    private String homeAddress; // Optional upon registration
    private List<PaymentCard> paymentCards; // Max 3 cards per user, Optional upon registration
    private String role; // Either "customer (user)" or "admin"
    private boolean isRegistered = false; // To track if the user has completed registration
    private boolean isSubscribed = false; // To track if the user is subscribed to promotions

    // Default constructor 
    public User() {
    }

    // Convenience constructor
    public User(String id, String name, String email, String password,
            String role, String phone, String shippingAddress, String homeAddress, 
            List<PaymentCard> paymentCards, boolean isRegistered, boolean isSubscribed) {
        setId(id);
        setName(name);
        setEmail(email);
        setPassword(password);
        setRole(role);
        setPhone(phone);
        setShippingAddress(shippingAddress);
        setHomeAddress(homeAddress);
        setPaymentCards(paymentCards);
        setIsRegistered(isRegistered);
        setIsSubscribed(isSubscribed);
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public List<PaymentCard> getPaymentCards() {
        return paymentCards;
    }

    public void setPaymentCards(List<PaymentCard> paymentCards) {
        // Enforce maximum of 3 payment cards per user
        if (paymentCards.size() > 3) {
            throw new IllegalArgumentException("A user can have a maximum of 3 payment cards.");
        } else {
            this.paymentCards = paymentCards;
        }
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getHomeAddress() {
        return homeAddress;
    }

    public void setHomeAddress(String homeAddress) {
        this.homeAddress = homeAddress;
    }

    public boolean getIsRegistered() {
        return isRegistered;
    }

    public void setIsRegistered(boolean isRegistered) {
        this.isRegistered = isRegistered;
    }

    public boolean getIsSubscribed() {
        return isSubscribed;
    }

    public void setIsSubscribed(boolean isSubscribed) {
        this.isSubscribed = isSubscribed;
    }
}