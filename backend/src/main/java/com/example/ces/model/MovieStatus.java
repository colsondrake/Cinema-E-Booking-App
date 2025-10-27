package com.example.ces.model;

import com.fasterxml.jackson.annotation.JsonCreator;

// MovieStatus class to describe the status of a movie
public enum MovieStatus {
    Active("Now Running"),
    ComingSoon("Coming Soon");

    @JsonCreator
    public static MovieStatus fromString(String value) {
        if (value == null) return null;
        String s = value.trim().toUpperCase().replaceAll("\\s+","_");
        try {
            return MovieStatus.valueOf(s);
        } catch (IllegalArgumentException e) {
            return null; // or return a default
        }
    }
    
    private String status;

    private MovieStatus(String status) {
        setStatus(status);
    }

    private void setStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
