package com.example.ces.model;

public class TicketTypePrice {
    private TicketType ticketType;
    private double price;

    // Determine Ticket price based on tickettype and price TO DO
    public double TicketTypePrice(TicketType ticketType, double price) {
        // logic for determining price based on ticket type
        // Implement when needed
        return 0.0; // Placeholder return value
    }

    public TicketType getTicketType() {
        return ticketType;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }


}
