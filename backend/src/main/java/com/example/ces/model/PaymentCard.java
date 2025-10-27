package com.example.ces.model;

import org.springframework.data.annotation.Id;

public class PaymentCard {
    // Define data members
    @Id
    private String id;
    private String cardNumber;
    private String cardType;
    private String expiryDate;
    private String billingAddress;
    private String userId; // Link to User

    // Default constructor
    public PaymentCard() {
    }

    // Convenience constructor
    public PaymentCard(String id, String cardNumber, String cardType,
            String expiryDate, String billingAddress, String userId) {
        setId(id);
        setCardNumber(cardNumber);
        setCardType(cardType);
        setExpiryDate(expiryDate);
        setBillingAddress(billingAddress);
        setUserId(userId);
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getBillingAddress() {
        return billingAddress;
    }

    public void setBillingAddress(String billingAddress) {
        this.billingAddress = billingAddress;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
