package com.example.ces.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tickets")
public class Ticket {
    
    @Id
    private String id; // MongoDB auto-generated ID
    
    private int ticketId; // Your business logic ID
    private int showtimeId;
    private int bookingId;
    private TicketType type;
    private double price;
    private Seat seat;

    // Default constructor
    public Ticket() {
    }

    // Convenience constructor (using enum)
    public Ticket(int ticketId, int showtimeId, int bookingId, TicketType type, double price, Seat seat) {
        this.ticketId = ticketId;
        this.showtimeId = showtimeId;
        this.bookingId = bookingId;
        this.type = type;
        this.price = price;
        this.seat = seat;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getTicketId() {
        return ticketId;
    }

    public void setTicketId(int ticketId) {
        this.ticketId = ticketId;
    }

    public int getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(int showtimeId) {
        this.showtimeId = showtimeId;
    }

    public int getBookingId() {
        return bookingId;
    }

    public void setBookingId(int bookingId) {
        this.bookingId = bookingId;
    }

    public TicketType getType() {
        return type;
    }

    public void setType(TicketType type) {
        this.type = type;
    }

    // Convenience setter that accepts a String and maps it to the enum
    public void setType(String type) {
        if (type == null) {
            this.type = null;
            return;
        }
        String s = type.trim();
        for (TicketType tt : TicketType.values()) {
            if (tt.name().equalsIgnoreCase(s)) {
                this.type = tt;
                return;
            }
        }
        this.type = null;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public Seat getSeat() {
        return seat;
    }

    public void setSeat(Seat seat) {
        this.seat = seat;
    }
    
    public void setSeat(int seatId, int row, String seatNumber) {
        this.seat = new Seat(seatId, row, seatNumber);
    }

    // Convenience to get the seat number from the Seat object
    public String getSeatNumber() {
        return seat != null ? seat.getSeatNumber() : null;
    }

    @Override
    public String toString() {
        return "Ticket{" +
                "id='" + id + '\'' +
                ", ticketId=" + ticketId +
                ", showtimeId=" + showtimeId +
                ", bookingId=" + bookingId +
                ", type=" + type +
                ", price=" + price +
                ", seat=" + seat +
                '}';
    }
}