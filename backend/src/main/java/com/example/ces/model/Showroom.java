package com.example.ces.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "showrooms")
public class Showroom {

    @Id
    private String showroomId; // Must be String for MongoDB

    private String name; // Optional but helpful for UI (e.g., "Showroom 1")
    private int capacity; // Required for seat-generation and display

    // Default constructor
    public Showroom() {
    }

    public Showroom(String showroomId, String name, int capacity) {
        this.showroomId = showroomId;
        this.name = name;
        this.capacity = capacity;
    }

    public String getShowroomId() {
        return showroomId;
    }

    public void setShowroomId(String showroomId) {
        this.showroomId = showroomId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }
}
