package com.example.ces.model;

import java.util.List;

import org.springframework.data.annotation.Id;

public class Showroom {
    @Id
    private int showroomId;
    private Theatre theatre; // Reference to Theatre 
    private List<Seat> seats; // List of Seats in the Showroom

    // Constructors
    public Showroom() {
    }

    // Getters and Setters
    public int getShowroomId() {
        return showroomId;
    }

    public void setShowroomId(int showroomId) {
        this.showroomId = showroomId;
    }

    public Theatre getTheatre() {
        return theatre;
    }

    public void setTheatre(Theatre theatre) {
        this.theatre = theatre;
    }

    public List<Seat> getSeats() {
        return seats;
    }

    public void setSeats(List<Seat> seats) {
        this.seats = seats;
    }
}
