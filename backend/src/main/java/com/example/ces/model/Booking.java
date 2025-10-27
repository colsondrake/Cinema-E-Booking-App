package com.example.ces.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;

// Booking class to represent a users booking
public class Booking {
    @Id
    private int bookingId;
    private Customer customer;
    private Showtime showtime;
    private LocalDate bookingDate;
    private TicketTypePrice totalAmount;
    private int numberOfTickets;
    private PaymentCard paymentCard;
    private Promotion promotion;
    private BookingStatus status;

    // Constructors
    public Booking() {
    }

    // Getters and Setters
    
}
