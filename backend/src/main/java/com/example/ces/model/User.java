package com.example.ces.model;

import org.springframework.data.annotation.Id;

// Abstract User class that Customer and Admin will extend
public abstract class User {
    // Define data members
    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private String password;
    private String homeAddress; // Optional upon registration
    private boolean verified = false;
    private String verificationToken;
    private String resetToken;

    // Default constructor
    public User() {
    }

    // Convenience constructor with id
    public User(String id) {
        setId(id);
    }

    // Convenience constructor with id and password for admins
    public User(String id, String password) {
        setId(id);
        setPassword(password);
    }

    // Convenience constructor
    public User(String id, String name, String email, String password,
            String phone, String homeAddress, boolean verified, String verificationToken, String resetToken) {
        setId(id);
        setName(name);
        setEmail(email);
        setPassword(password);
        setPhone(phone);
        setHomeAddress(homeAddress);
        setVerified(verified);
        setVerificationToken(verificationToken);
        setResetToken(resetToken);

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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getHomeAddress() {
        return homeAddress;
    }

    public void setHomeAddress(String homeAddress) {
        this.homeAddress = homeAddress;
    }

    public boolean getVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

}