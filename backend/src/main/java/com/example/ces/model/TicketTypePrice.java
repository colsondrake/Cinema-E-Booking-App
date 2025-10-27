package com.example.ces.model;

public class TicketTypePrice {
    private TicketType ticketType;
    private double price;

    // Determine Ticket price based on tickettype and price
    public TicketTypePrice(TicketType ticketType, double price) {
        this.ticketType = ticketType;
    }
}
