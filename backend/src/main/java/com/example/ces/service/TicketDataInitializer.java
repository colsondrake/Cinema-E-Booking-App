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
        // Only initialize if no tickets exist
        if (ticketRepository.count() == 0) {
            createDummyTickets();
            System.out.println("Created dummy tickets");
        } else {
            System.out.println("Tickets already exist in database. Count: " + ticketRepository.count());
        }
    }

    private void createDummyTickets() {
        // Create sample tickets for different showtimes and seat types
        
        // Tickets for Showtime 1 (The Dark Knight - 2:00 PM)
        Ticket ticket1 = new Ticket();
        ticket1.setTicketId(1); // Unique ticket ID
        ticket1.setShowtimeId(1);
        ticket1.setBookingId(1001);
        ticket1.setType(TicketType.ADULT);
        ticket1.setPrice(12.0);
        ticket1.setSeat(new Seat(12323, 1, "A1"));

        Ticket ticket2 = new Ticket();
        ticket2.setTicketId(2); // Unique ticket ID
        ticket2.setShowtimeId(1);
        ticket2.setBookingId(1001);
        ticket2.setType(TicketType.SENIOR);
        ticket2.setPrice(9.0);
        ticket2.setSeat(new Seat(12324, 1, "A2"));

        // Tickets for Showtime 2 (The Dark Knight - 7:30 PM)
        Ticket ticket3 = new Ticket();
        ticket3.setTicketId(3); // Unique ticket ID
        ticket3.setShowtimeId(2);
        ticket3.setBookingId(1002);
        ticket3.setType(TicketType.ADULT);
        ticket3.setPrice(15.0);
        ticket3.setSeat(new Seat(12325, 2, "B5"));

        Ticket ticket4 = new Ticket();
        ticket4.setTicketId(4); // Unique ticket ID
        ticket4.setShowtimeId(2);
        ticket4.setBookingId(1003);
        ticket4.setType(TicketType.CHILD);
        ticket4.setPrice(8.0);
        ticket4.setSeat(new Seat(12326, 3, "C3"));

        // Tickets for Showtime 3 (Inception)
        Ticket ticket5 = new Ticket();
        ticket5.setTicketId(5); // Unique ticket ID
        ticket5.setShowtimeId(3);
        ticket5.setBookingId(1004);
        ticket5.setType(TicketType.ADULT);
        ticket5.setPrice(12.0);
        ticket5.setSeat(new Seat(12327, 4, "D1"));

        Ticket ticket6 = new Ticket();
        ticket6.setTicketId(6); // Unique ticket ID
        ticket6.setShowtimeId(3);
        ticket6.setBookingId(1004);
        ticket6.setType(TicketType.ADULT);
        ticket6.setPrice(12.0);
        ticket6.setSeat(new Seat(12328, 4, "D2"));

        // Save all tickets
        List<Ticket> dummyTickets = Arrays.asList(
            ticket1, ticket2, ticket3, ticket4, ticket5, ticket6
        );

        try {
            List<Ticket> savedTickets = ticketRepository.saveAll(dummyTickets);
            System.out.println("🎫 Successfully saved " + savedTickets.size() + " tickets");
            
            // Print each saved ticket for verification
            savedTickets.forEach(ticket -> 
                System.out.println("   - Ticket " + ticket.getTicketId() + 
                                 ": Showtime " + ticket.getShowtimeId() + 
                                 ", Seat " + ticket.getSeatNumber())
            );
        } catch (Exception e) {
            System.err.println("Error saving tickets: " + e.getMessage());
            e.printStackTrace();
        }
    }
}