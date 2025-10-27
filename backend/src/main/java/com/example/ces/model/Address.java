// package com.example.ces.model;

// import jakarta.validation.constraints.NotBlank;

// public class Address {

//     @NotBlank(message = "Street address is required")
//     private String street;

//     @NotBlank(message = "City is required")
//     private String city;

//     @NotBlank(message = "State is required")
//     private String state;

//     @NotBlank(message = "ZIP code is required")
//     private String zipCode;

//     @NotBlank(message = "Country is required")
//     private String country = "USA";

//     public Address() {}

//     public Address(String street, String city, String state, String zipCode, String country) {
//         this.street = street;
//         this.city = city;
//         this.state = state;
//         this.zipCode = zipCode;
//         this.country = country;
//     }

//     // Getters & Setters
//     public String getStreet() { return street; }
//     public void setStreet(String street) { this.street = street; }

//     public String getCity() { return city; }
//     public void setCity(String city) { this.city = city; }

//     public String getState() { return state; }
//     public void setState(String state) { this.state = state; }

//     public String getZipCode() { return zipCode; }
//     public void setZipCode(String zipCode) { this.zipCode = zipCode; }

//     public String getCountry() { return country; }
//     public void setCountry(String country) { this.country = country; }
// }

package com.example.ces.model;

public class Address {
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country = "USA";

    // Default constructor
    public Address() {
    }

    // Full constructor
    public Address(String street, String city, String state, String zipCode, String country) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country != null ? country : "USA";
    }

    // Getters and setters
    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (street != null && !street.isEmpty()) {
            sb.append(street);
        }
        if (city != null && !city.isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(city);
        }
        if (state != null && !state.isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(state);
        }
        if (zipCode != null && !zipCode.isEmpty()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(zipCode);
        }
        if (country != null && !country.isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(country);
        }
        return sb.toString();
    }

    @Override
    public String toString() {
        return getFullAddress();
    }
}