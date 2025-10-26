package com.example.ces.model;

import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "users")
public class Customer extends User {

    private String shippingAddress;
    private List<PaymentCard> paymentCards; // Max 3 cards per user
    private boolean isSubscribed = false; // Promotions
    private UserStatus status; // Active, Inactive, Suspended

    // Default constructor
    public Customer() {
        super();
    }

    // Convenience constructor with id
    public Customer(String id) {
        super(id);
    }

    // Full constructor
    public Customer(String id, String name, String email, String password,
            String phone, String homeAddress, boolean verified,
            String verificationToken, String resetToken,
            List<PaymentCard> paymentCards, String shippingAddress,
            boolean isSubscribed) {
        super(id, name, email, password, phone, homeAddress, verified,
                verificationToken, resetToken);
        setPaymentCards(paymentCards);
        this.shippingAddress = shippingAddress;
        this.isSubscribed = isSubscribed;
    }

    // ---------------- Getters & Setters ----------------

    public List<PaymentCard> getPaymentCards() {
        return paymentCards;
    }

    public void setPaymentCards(List<PaymentCard> paymentCards) {
        if (paymentCards != null && paymentCards.size() > 3) {
            throw new IllegalArgumentException("A user can have a maximum of 3 payment cards.");
        }
        this.paymentCards = paymentCards;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public boolean isSubscribed() {
        return isSubscribed;
    }

    public void setSubscribed(boolean isSubscribed) {
        this.isSubscribed = isSubscribed;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }
}
