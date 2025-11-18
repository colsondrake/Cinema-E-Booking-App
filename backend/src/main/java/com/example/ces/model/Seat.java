package com.example.ces.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "seats")
public class Seat {
    // Define fields
    @Id
    private int seatId;
    private int row;
    private String seatNumber;
    private boolean isBooked = false;

    // Default constructor
    public Seat() {
    }

    public Seat(int seatId, int row, String seatNumber) {
        this.seatId = seatId;
        this.row = row;
        this.seatNumber = seatNumber;
    }

    // Methods
    public boolean isBooked() {
        return isBooked;
    }

    public void setBooked(boolean booked) {
        isBooked = booked;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public int getRow() {
        return row;
    }

    public void setRow(int row) {
        this.row = row;
    }
}
