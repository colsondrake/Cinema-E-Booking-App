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
    private String address;
    private PaymentCard paymentCard;
    private String role; 

    // Default constructor 
    public User() {
    }

    // Convenience constructor
    public User(String id, String name, String email, String password,
            String role, String phone, String address, PaymentCard paymentCard) {
        setId(id);
        setName(name);
        setEmail(email);
        setPassword(password);
        setRole(role);
        setPhone(phone);
        setAddress(address);
        setPaymentCard(paymentCard);
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

    public String getAddress() {
        return address;
    }

    public PaymentCard getPaymentCard() {
        return paymentCard;
    }

    public void setPaymentCard(PaymentCard paymentCard) {
        this.paymentCard = paymentCard;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}