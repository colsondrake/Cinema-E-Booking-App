package com.example.ces.model;

import java.util.List;

// WebUser class extending User
public class WebUser extends User{
    // Data fields for WebUser class can be added here
    private String shippingAddress;
    private List<PaymentCard> paymentCards; // Max 3 cards per user, Optional upon registration
    private boolean emailVerified = false; // To track if the user has verified their email
    private boolean isSubscribed = false; // To track if the user is subscribed to promotions
    // Default constructor 
    public WebUser() {
        super();
    }

    // Convenience constructor
    public WebUser(String id, String name, String email, String password,
            String phone, String homeAddress, boolean isLoggedIn, 
            List<PaymentCard> paymentCards, String shippingAddress,
            boolean emailVerified, boolean isSubscribed) {
        super(id, name, email, password, phone, homeAddress, isLoggedIn);
        setPaymentCards(paymentCards);
        setShippingAddress(shippingAddress);
        setEmailVerified(emailVerified);
        setIsSubscribed(isSubscribed);
    }

    // Constructor for email verified status
    public WebUser(boolean emailVerified) {
        setEmailVerified(emailVerified);
    }
    // Getters and setters
    public void setPaymentCards(List<PaymentCard> paymentCards) {
        // Enforce maximum of 3 payment cards per user
        if (paymentCards.size() > 3) {
            throw new IllegalArgumentException("A user can have a maximum of 3 payment cards.");
        } else {
            this.paymentCards = paymentCards;
        }
    }

    public List<PaymentCard> getPaymentCards() {
        return paymentCards;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isSubscribed() {
        return isSubscribed;
    }

    public void setIsSubscribed(boolean isSubscribed) {
        this.isSubscribed = isSubscribed;
    }
}
