package com.example.ces.model;

import org.springframework.data.annotation.Id;

public class Ticket {
    // Define fields
    @Id
    private int ticketId;
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
        setTicketId(ticketId);
        setShowtimeId(showtimeId);
        setBookingId(bookingId);
        setType(type);
        setPrice(price);
        setSeat(seat);
    }

    // Convenience constructor accepting String for type
    public Ticket(int ticketId, int showtimeId, int bookingId, String type, double price, Seat seat) {
        this(ticketId, showtimeId, bookingId, (TicketType) null, price, seat);
        setType(type);
    }

    // Getters and setters
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

    // Seat accessors
    public Seat getSeat() {
        return seat;
    }

    public void setSeat(Seat seat) {
        this.seat = seat;
    }

    // Convenience to get the seat number from the Seat object (returns null if seat not set)
    public String getSeatNumber() {
        return seat != null ? seat.getSeatNumber() : null;
    }
}