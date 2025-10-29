package com.example.ces.model;

import java.util.List;

import java.util.ArrayList;

public class Theatre {
    private int theatreId;
    private String name;
    private String location;
    private int numberOfShowrooms;
    private List<Showroom> showrooms = new ArrayList<>();

    public Theatre() {
    }
    
    public void addShowroom(Showroom showroom) {
        this.numberOfShowrooms += 1;
        showrooms.add(showroom);
    }

    public List<Showroom> getShowrooms() {
        // Implementation to return list of showrooms
        return showrooms;
    }

    // Getters and Setters
    public int getTheatreId() {
        return theatreId;
    }

    public void setTheatreId(int theatreId) {
        this.theatreId = theatreId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public int getNumberOfShowrooms() {
        return numberOfShowrooms;
    }

    public void setNumberOfShowrooms(int numberOfShowrooms) {
        this.numberOfShowrooms = numberOfShowrooms;
    }
}
