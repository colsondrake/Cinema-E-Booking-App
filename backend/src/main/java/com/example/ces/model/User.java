package com.example.ces.model;

import org.springframework.data.annotation.Id;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.util.ArrayList;
import java.util.List;

/**
 * User is now a concrete class. Role differentiates between normal users and admins.
 * Customer-specific functionality (address, payment cards, subscriptions) was migrated here
 * so existing code that relied on Customer can continue to work if Customer continues to extend User.
 */
@Document(collection = "users")
public class User {
    // Data members
    @Id
    private String id;
    private String firstName;
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

    // --- Customer-specific fields to use when role is USER ---
    private Address homeAddress; // Users can have only 1 home address
    private String shippingAddress; // For backward compatibility
    @DBRef
    private List<PaymentCard> paymentCards = new ArrayList<>(); // Max 3 cards per user
    private boolean isSubscribed = false; // Backward compatibility
    private boolean isSubscribedToPromotions = false; // Current flag

    // ---------------- Constructors ----------------

    // Default constructor
    public User() {
        this.createdAt = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
        // default role is USER; Admin subclass can override to "ADMIN"
        setRole("USER");
    }

    // Convenience constructor with id
    public User(String id) {
        this();
        setId(id);
    }

    // New full constructor
    public User(String id, String name, String email,
                String password, String phone, boolean isLoggedIn,
                boolean emailVerified, boolean isActive) {
        this();
        setId(id);
        setName(name);
        setEmail(email);
        setPassword(password);
        setPhone(phone);
        setIsLoggedIn(isLoggedIn);
        setEmailVerified(emailVerified);
        setIsActive(isActive);
    }

    // Constructor for admins (minimal)
    public User(String id, String password) {
        this();
        setRole("ADMIN");
        setId(id);
        setPassword(password);
    }

    // Constructor for email verification
    public User(String email, String verificationToken, LocalDateTime tokenExpiryDate) {
        this();
        setEmail(email);
        setVerificationToken(verificationToken);
        setTokenExpiryDate(tokenExpiryDate);
    }

    // ---------------- Getters / Setters (core) ----------------

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

    // getName() for combining first and last names
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
        if (firstName == null && lastName == null) return "";
        if (firstName == null) return lastName;
        if (lastName == null) return firstName;
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

    public boolean getIsLoggedIn() {
        return isLoggedIn;
    }

    public void setIsLoggedIn(boolean isLoggedIn) {
        this.isLoggedIn = isLoggedIn;
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

    // ---------------- Home Address ----------------

    /**
     * Returns a string representation of the user's home address.
     * If a full Address object exists, returns its full address string,
     * otherwise falls back to the legacy shippingAddress string.
     */
    public String getHomeAddress() {
        if (homeAddress != null) {
            return homeAddress.getFullAddress();
        }
        return shippingAddress;
    }

    public Address getHomeAddressObj() {
        return homeAddress;
    }

    public void setHomeAddress(Address homeAddress) {
        this.homeAddress = homeAddress;
    }

    /**
     * Legacy setter that accepts a single-line address string and keeps
     * it in shippingAddress (legacy) and populates a simple Address object.
     */
    public void setHomeAddress(String homeAddressStr) {
        if (homeAddressStr != null && !homeAddressStr.isEmpty()) {
            Address addr = new Address();
            addr.setStreet(homeAddressStr);
            this.homeAddress = addr;
        }
        this.shippingAddress = homeAddressStr;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    // ---------------- Payment cards ----------------

    public List<PaymentCard> getPaymentCards() {
        return paymentCards;
    }

    public void setPaymentCards(List<PaymentCard> paymentCards) {
        if (paymentCards != null && paymentCards.size() > 3) {
            throw new IllegalArgumentException("A user can have a maximum of 3 payment cards.");
        }
        this.paymentCards = (paymentCards != null) ? paymentCards : new ArrayList<>();
    }

    public void addPaymentCard(PaymentCard card) {
        if (this.paymentCards == null) {
            this.paymentCards = new ArrayList<>();
        }
        if (this.paymentCards.size() >= 3) {
            throw new IllegalArgumentException("A user can have a maximum of 3 payment cards.");
        }
        this.paymentCards.add(card);
    }

    public void removePaymentCard(String cardId) {
        if (this.paymentCards != null) {
            this.paymentCards.removeIf(card -> card.getId().equals(cardId));
        }
    }

    // ---------------- Subscription handling ----------------

    public boolean isSubscribed() {
        return isSubscribed || isSubscribedToPromotions;
    }

    public void setIsSubscribed(boolean isSubscribed) {
        this.isSubscribed = isSubscribed;
        this.isSubscribedToPromotions = isSubscribed;
    }

    public boolean isSubscribedToPromotions() {
        return isSubscribedToPromotions || isSubscribed;
    }

    public void setIsSubscribedToPromotions(boolean isSubscribedToPromotions) {
        this.isSubscribedToPromotions = isSubscribedToPromotions;
        this.isSubscribed = isSubscribedToPromotions;
    }

    // ---------------- Utility ----------------

    @Override
    public String toString() {
        return String.format("User{id='%s', name='%s', email='%s', verified=%s, subscribed=%s, role=%s}",
                getId(), getFullName(), getEmail(), isEmailVerified(), isSubscribedToPromotions(), getRole());
    }
}