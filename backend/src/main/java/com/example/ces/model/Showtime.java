package com.example.ces.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "showtimes")
public class Showtime {
    // Define fields
    @Id
    private int showtimeId;
    private int movieId;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDate date;
    private int availableSeats; // To track available seats
    private double basePrice;
    private int seatsBooked; // To track number of seats booked

    // Default constructor
    public Showtime() {
    }

    /* IN PROGRESS BOOKSEAT METHOD
    public boolean bookSeat(String seatNumber) {
        // Find the seat by seatNumber
        
        if (seat.isBooked()) {
            return false; // Seat already booked
        } else if (availableSeats <= 0) {
            return false; // No available seats
        } else {
            seat.setBooked(true);
            updateAvailableSeats(availableSeats);
            seatsBooked ++;
            return true;
        }
    } 
    */ 

    public boolean checkAvailability() {
        return availableSeats > 0;
    }

    public int getRemainingSeats() {
        return availableSeats;
    }

    public void updateAvailableSeats(int availableSeats) {
        this.availableSeats -= seatsBooked;
    }
}
