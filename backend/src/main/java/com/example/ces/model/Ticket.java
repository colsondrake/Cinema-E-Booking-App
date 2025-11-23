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
    private String seatNumber; // Only seatNumber as String - no Seat object

    // Default constructor
    public Ticket() {
    }

    // Convenience constructor (using enum)
    public Ticket(int ticketId, int showtimeId, int bookingId, TicketType type, double price, String seatNumber) {
        this.ticketId = ticketId;
        this.showtimeId = showtimeId;
        this.bookingId = bookingId;
        this.type = type;
        this.price = price;
        this.seatNumber = seatNumber;
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

    // Simplified seat methods - only work with seatNumber string
    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    // Deprecated Seat object methods - keep for compatibility but don't use Seat objects
    @Deprecated
    public void setSeat(Seat seat) {
        // Don't use Seat objects - extract seatNumber only if needed for compatibility
        if (seat != null) {
            this.seatNumber = seat.getSeatNumber();
        }
    }

    @Deprecated
    public Seat getSeat() {
        // Return null to indicate we don't use Seat objects
        return null;
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
                ", seatNumber='" + seatNumber + '\'' +
                '}';
    }
}