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
    // ...existing code...
    public int getBookingId() {
        return bookingId;
    }

    public void setBookingId(int bookingId) {
        this.bookingId = bookingId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Showtime getShowtime() {
        return showtime;
    }

    public void setShowtime(Showtime showtime) {
        this.showtime = showtime;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public TicketTypePrice getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(TicketTypePrice totalAmount) {
        this.totalAmount = totalAmount;
    }

    public int getNumberOfTickets() {
        return numberOfTickets;
    }

    public void setNumberOfTickets(int numberOfTickets) {
        this.numberOfTickets = numberOfTickets;
    }

    public PaymentCard getPaymentCard() {
        return paymentCard;
    }

    public void setPaymentCard(PaymentCard paymentCard) {
        this.paymentCard = paymentCard;
    }

    public Promotion getPromotion() {
        return promotion;
    }

    public void setPromotion(Promotion promotion) {
        this.promotion = promotion;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
    // ...existing code...
}
