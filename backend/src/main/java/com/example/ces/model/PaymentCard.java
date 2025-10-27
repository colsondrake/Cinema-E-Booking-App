// package com.example.ces.model;

// import org.springframework.data.annotation.Id;
// import org.springframework.data.mongodb.core.mapping.Document;

// @Document(collection = "paymentCards")
// public class PaymentCard {
//     // Define data members
//     @Id
//     private String id;
//     private String cardNumber;
//     private String cardType;
//     private String expiryDate;
//     private String billingAddress;
//     private String userId; // Link to User

//     // Default constructor
//     public PaymentCard() {
//     }

//     // Convenience constructor
//     public PaymentCard(String id, String cardNumber, String cardType,
//             String expiryDate, String billingAddress, String userId) {
//         setId(id);
//         setCardNumber(cardNumber);
//         setCardType(cardType);
//         setExpiryDate(expiryDate);
//         setBillingAddress(billingAddress);
//         setUserId(userId);
//     }

//     // Getters and setters
//     public String getId() {
//         return id;
//     }

//     public void setId(String id) {
//         this.id = id;
//     }

//     public String getCardNumber() {
//         return cardNumber;
//     }

//     public void setCardNumber(String cardNumber) {
//         this.cardNumber = cardNumber;
//     }

//     public String getCardType() {
//         return cardType;
//     }

//     public void setCardType(String cardType) {
//         this.cardType = cardType;
//     }

//     public String getExpiryDate() {
//         return expiryDate;
//     }

//     public void setExpiryDate(String expiryDate) {
//         this.expiryDate = expiryDate;
//     }

//     public String getBillingAddress() {
//         return billingAddress;
//     }

//     public void setBillingAddress(String billingAddress) {
//         this.billingAddress = billingAddress;
//     }

//     public String getUserId() {
//         return userId;
//     }

//     public void setUserId(String userId) {
//         this.userId = userId;
//     }
// }

package com.example.ces.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Document(collection = "paymentCards")
public class PaymentCard {
    @Id
    private String id;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String cardNumber;
    
    private String encryptedCardNumber; // Store encrypted version
    private String lastFourDigits; // Store last 4 digits for display
    
    private String cardType;
    private String expiryDate;
    private String cardholderName;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String cvv;
    
    private String billingAddress; // Keep as String for backward compatibility
    private Address billingAddressObj; // New Address object
    
    @JsonIgnore
    private String userId;

    // Default constructor
    public PaymentCard() {
    }

    // Original constructor for backward compatibility
    public PaymentCard(String id, String cardNumber, String cardType,
            String expiryDate, String billingAddress, String userId) {
        setId(id);
        setCardNumber(cardNumber);
        setCardType(cardType);
        setExpiryDate(expiryDate);
        setBillingAddress(billingAddress);
        setUserId(userId);
    }

    // New constructor with all fields
    public PaymentCard(String cardNumber, String cardType, String expiryDate, 
                       String cardholderName, String cvv, Address billingAddressObj, String userId) {
        setCardNumber(cardNumber);
        setCardType(cardType);
        setExpiryDate(expiryDate);
        setCardholderName(cardholderName);
        setCvv(cvv);
        setBillingAddressObj(billingAddressObj);
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
        // Extract last 4 digits when setting card number
        if (cardNumber != null && cardNumber.length() >= 4) {
            this.lastFourDigits = cardNumber.substring(cardNumber.length() - 4);
        }
    }

    public String getEncryptedCardNumber() {
        return encryptedCardNumber;
    }

    public void setEncryptedCardNumber(String encryptedCardNumber) {
        this.encryptedCardNumber = encryptedCardNumber;
    }

    public String getLastFourDigits() {
        return lastFourDigits;
    }

    public void setLastFourDigits(String lastFourDigits) {
        this.lastFourDigits = lastFourDigits;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType != null ? cardType.toUpperCase() : null;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getCardholderName() {
        return cardholderName;
    }

    public void setCardholderName(String cardholderName) {
        this.cardholderName = cardholderName;
    }

    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    public String getBillingAddress() {
        // Return string representation for backward compatibility
        if (billingAddressObj != null) {
            return billingAddressObj.getFullAddress();
        }
        return billingAddress;
    }

    public void setBillingAddress(String billingAddress) {
        this.billingAddress = billingAddress;
    }

    public Address getBillingAddressObj() {
        return billingAddressObj;
    }

    public void setBillingAddressObj(Address billingAddressObj) {
        this.billingAddressObj = billingAddressObj;
        // Also set string version for backward compatibility
        if (billingAddressObj != null) {
            this.billingAddress = billingAddressObj.getFullAddress();
        }
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    // Display method for UI (shows masked card number)
    public String getMaskedCardNumber() {
        if (lastFourDigits != null) {
            return "**** **** **** " + lastFourDigits;
        }
        return "****";
    }

    @Override
    public String toString() {
        return String.format("%s ending in %s", 
            cardType != null ? cardType : "Card", 
            lastFourDigits != null ? lastFourDigits : "****");
    }
}