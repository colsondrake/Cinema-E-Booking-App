package com.example.ces.model;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;

public class Showtime {

    @Id
    private String showtimeId; // MUST be String for MongoDB

    private String movieId; // was int → MUST be String to match Movie.id
    private LocalDate date; // you can keep this for older requirements
    private int availableSeats;
    private double basePrice;
    private int seatsBooked;
    private String time;

    // Changed from List<Seat> to List<String> - all seats as seat numbers only
    private List<String> seats = new ArrayList<>();

    private String showroomId; // REQUIRED for Sprint 3 scheduling

    // MUST BE List<String> for seat-selection API
    private List<String> takenSeats = new ArrayList<>();

    // Default constructor
    public Showtime() {
    }

    // Convenience constructor
    public Showtime(String time) {
        this.time = time;
    }

    // ============================
    // Seat booking logic (updated for String seats)
    // ============================

    public synchronized boolean bookSeat(String seatNumber) {
        if (seatNumber == null || seats == null)
            return false;

        if (availableSeats <= 0)
            return false;

        // Check if seat exists and is not already taken
        if (seats.contains(seatNumber) && !takenSeats.contains(seatNumber)) {
            takenSeats.add(seatNumber);
            seatsBooked++;
            availableSeats = Math.max(0, availableSeats - 1);
            return true;
        }
        return false;
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

    public String getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(String showtimeId) {
        this.showtimeId = showtimeId;
    }

    public String getMovieId() {
        return movieId;
    }

    public void setMovieId(String movieId) {
        this.movieId = movieId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(double basePrice) {
        this.basePrice = basePrice;
    }

    public int getSeatsBooked() {
        return seatsBooked;
    }

    public void setSeatsBooked(int seatsBooked) {
        this.seatsBooked = seatsBooked;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    // Updated to return List<String> instead of List<Seat>
    public List<String> getSeats() {
        return seats;
    }

    public void setSeats(List<String> seats) {
        this.seats = seats != null ? seats : new ArrayList<>();
        // Update available seats count
        if (this.availableSeats <= 0) {
            this.availableSeats = this.seats.size() - this.takenSeats.size();
            this.seatsBooked = this.takenSeats.size();
        }
    }

    public void setSeatNumbers(List<String> seatNumbers) {
        this.seats = seatNumbers != null ? seatNumbers : new ArrayList<>();
        // Update available seats count
        this.availableSeats = this.seats.size() - this.takenSeats.size();
    }

    public String getShowroomId() {
        return showroomId;
    }

    public void setShowroomId(String showroomId) {
        this.showroomId = showroomId;
    }

    public List<String> getTakenSeats() {
        return takenSeats;
    }

    public void setTakenSeats(List<String> takenSeats) {
        this.takenSeats = takenSeats != null ? takenSeats : new ArrayList<>();
    }
}