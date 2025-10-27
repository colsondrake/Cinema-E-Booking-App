package com.example.ces.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "showtimes")
public class Showtime {
    // Define fields
    @Id
    private int showtimeId;
    private int movieId;
    private LocalDate date; // Implement when needed
    private int availableSeats; // To track available seats
    private double basePrice;
    private int seatsBooked; // To track number of seats booked
    private String time;
    private List<Seat> seats = new ArrayList<>(); // list of seat objects

    // Default constructor
    public Showtime() {
    }

    // Convenience constructor
    public Showtime(String time) {
        setTime(time);
    }

    // Book a seat by seat number
    public synchronized boolean bookSeat(String seatNumber) {
        if (seatNumber == null || seats == null) return false;

        // check availability
        if (availableSeats <= 0) return false;

        for (Seat seat : seats) {
            String sNum = String.valueOf(seat.getSeatNumber());
            if (Objects.equals(sNum, seatNumber)) {
                // seat found
                if (Boolean.TRUE.equals(seat.isBooked())) {
                    return false; // already booked
                }
                // mark booked and update counters
                seat.setBooked(true);
                seatsBooked++;
                availableSeats = Math.max(0, availableSeats - 1);
                return true;
            }
        }
        return false; // seat not found
    }

    public boolean checkAvailability() {
        return availableSeats > 0;
    }

    public int getRemainingSeats() {
        return availableSeats;
    }

    public void updateAvailableSeats(int availableSeats) {
        this.availableSeats -= seatsBooked;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    // Accessors for seat list
    public List<Seat> getSeats() {
        return seats;
    }

    public void setSeats(List<Seat> seats) {
        this.seats = seats != null ? seats : new ArrayList<>();
        // if availableSeats is not initialized, calculate it
        if (this.availableSeats <= 0) {
            int unbooked = 0;
            for (Seat s : this.seats) {
                if (!Boolean.TRUE.equals(s.isBooked())) unbooked++;
            }
            this.availableSeats = unbooked;
            this.seatsBooked = this.seats.size() - unbooked;
        }
    }
}