package com.example.ces.service;

import com.example.ces.model.*;
import com.example.ces.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class TicketDataInitializer {

    @Autowired
    private TicketRepository ticketRepository;

    @EventListener(ContextRefreshedEvent.class)
    public void initializeTicketData() {
        // Don't create any dummy tickets - tickets are only created through bookings
        System.out.println("TicketDataInitializer: Tickets will only be populated through booking creation");
        System.out.println("Current ticket count in database: " + ticketRepository.count());
        
        // Log some info about existing tickets if any
        if (ticketRepository.count() > 0) {
            System.out.println("Existing tickets in database (created through bookings):");
            ticketRepository.findAll().forEach(ticket -> {
                System.out.println("  - Ticket " + ticket.getTicketId() + 
                                 ": Seat " + ticket.getSeatNumber() + 
                                 ", Booking " + ticket.getBookingId() +
                                 ", Showtime " + ticket.getShowtimeId());
            });
        }
    }
}