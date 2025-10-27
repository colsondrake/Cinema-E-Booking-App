// package com.example.ces.model;

// import org.springframework.data.annotation.Id;
// import org.springframework.data.mongodb.core.mapping.Document;
// import java.util.List;

// // WebUser class extending User
// @Document(collection = "users")
// public class WebUser extends User{
//     // Data fields for WebUser class can be added here
//     private String shippingAddress;
//     private List<PaymentCard> paymentCards; // Max 3 cards per user, Optional upon registration
//     private boolean emailVerified = false; // To track if the user has verified their email
//     private boolean isSubscribed = false; // To track if the user is subscribed to promotions
    
//     // Default constructor 
//     public WebUser() {
//         super();
//     }

//     // Convenience constructor with id
//     public WebUser(String id) {
//         super(id);
//     }
//     // Convenience constructor
//     public WebUser(String id, String name, String email, String password,
//             String phone, String homeAddress, boolean isLoggedIn, 
//             List<PaymentCard> paymentCards, String shippingAddress,
//             boolean emailVerified, boolean isSubscribed) {
//         super(id, name, email, password, phone, homeAddress, isLoggedIn);
//         setPaymentCards(paymentCards);
//         setShippingAddress(shippingAddress);
//         setEmailVerified(emailVerified);
//         setIsSubscribed(isSubscribed);
//     }

//     // Constructor for email verified status
//     public WebUser(boolean emailVerified) {
//         setEmailVerified(emailVerified);
//     }
//     // Getters and setters
//     public void setPaymentCards(List<PaymentCard> paymentCards) {
//         // Enforce maximum of 3 payment cards per user
//         if (paymentCards.size() > 3) {
//             throw new IllegalArgumentException("A user can have a maximum of 3 payment cards.");
//         } else {
//             this.paymentCards = paymentCards;
//         }
//     }

//     public List<PaymentCard> getPaymentCards() {
//         return paymentCards;
//     }

//     public void setShippingAddress(String shippingAddress) {
//         this.shippingAddress = shippingAddress;
//     }

//     public String getShippingAddress() {
//         return shippingAddress;
//     }

//     public boolean isEmailVerified() {
//         return emailVerified;
//     }

//     public void setEmailVerified(boolean emailVerified) {
//         this.emailVerified = emailVerified;
//     }

//     public boolean isSubscribed() {
//         return isSubscribed;
//     }

//     public void setIsSubscribed(boolean isSubscribed) {
//         this.isSubscribed = isSubscribed;
//     }
// }

package com.example.ces.model;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.util.ArrayList;
import java.util.List;

/**
 * WebUser class extends User and represents standard cinema users.
 * Supports 1 home address, up to 3 payment cards, and subscription preferences.
 */
@Document(collection = "users")
public class WebUser extends User {

    private Address homeAddress; // Users can have only 1 home address
    private String shippingAddress; // For backward compatibility with older records

    @DBRef
    private List<PaymentCard> paymentCards = new ArrayList<>(); // Max 3 cards per user

    private boolean isSubscribed = false; // For backward compatibility
    private boolean isSubscribedToPromotions = false; // Current flag for promotions

    // ---------------- Constructors ----------------

    public WebUser() {
        super();
        setRole("USER");
    }

    public WebUser(String id) {
        super(id);
        setRole("USER");
    }

    // Backward-compatible constructor (with old fields)
    public WebUser(String id, String name, String email, String password,
                   String phone, String homeAddress, boolean isLoggedIn,
                   List<PaymentCard> paymentCards, String shippingAddress,
                   boolean emailVerified, boolean isSubscribed) {
        super(id, name, email, password, phone, homeAddress, isLoggedIn);
        setPaymentCards(paymentCards);
        setShippingAddress(shippingAddress);
        setEmailVerified(emailVerified);
        setIsSubscribed(isSubscribed);
        setIsSubscribedToPromotions(isSubscribed);
        setRole("USER");
    }

    // Modern constructor (used internally by service)
    public WebUser(String id, String firstName, String lastName, String email,
                   String password, String phone, boolean isLoggedIn,
                   boolean emailVerified, boolean isActive,
                   Address homeAddress, List<PaymentCard> paymentCards,
                   boolean isSubscribedToPromotions) {
        super(id, firstName, lastName, email, password, phone,
              isLoggedIn, emailVerified, isActive, "USER");
        setHomeAddress(homeAddress);
        setPaymentCards(paymentCards);
        setIsSubscribedToPromotions(isSubscribedToPromotions);
        setIsSubscribed(isSubscribedToPromotions);
    }

    // Constructor used for quick initialization of verification status
    public WebUser(boolean emailVerified) {
        super();
        setEmailVerified(emailVerified);
        setRole("USER");
    }

    // ---------------- Address Handling ----------------

    @Override
    public String getHomeAddress() {
        if (homeAddress != null) {
            return homeAddress.getFullAddress();
        }
        return shippingAddress; // fallback for legacy users
    }

    public Address getHomeAddressObj() {
        return homeAddress;
    }

    public void setHomeAddress(Address homeAddress) {
        this.homeAddress = homeAddress;
    }

    @Override
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

    // ---------------- Payment Card Handling ----------------

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

    // ---------------- Subscription Handling ----------------

    public boolean isSubscribed() {
        return isSubscribed || isSubscribedToPromotions;
    }

    public void setSubscribed(boolean isSubscribed) {
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

    // ---------------- Email Verification Override ----------------

    @Override
    public boolean isEmailVerified() {
        return super.isEmailVerified();
    }

    @Override
    public void setEmailVerified(boolean emailVerified) {
        super.setEmailVerified(emailVerified);
    }

    // ---------------- Utility ----------------

    @Override
    public String toString() {
        return String.format("WebUser{id='%s', name='%s', email='%s', verified=%s, subscribed=%s}",
                getId(), getFullName(), getEmail(), isEmailVerified(), isSubscribedToPromotions());
    }
}
