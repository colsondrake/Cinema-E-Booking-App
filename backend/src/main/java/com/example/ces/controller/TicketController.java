package com.example.ces.controller;

import com.example.ces.model.Ticket;
import com.example.ces.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    /**
     * Create a single ticket
     */
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Ticket ticket) {
        try {
            Ticket createdTicket = ticketService.createTicket(ticket);
            return ResponseEntity.ok(createdTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Create multiple tickets (for group bookings)
     */
    @PostMapping("/batch")
    public ResponseEntity<?> createTickets(@RequestBody List<Ticket> tickets) {
        try {
            List<Ticket> createdTickets = ticketService.createTickets(tickets);
            return ResponseEntity.ok(createdTickets);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all tickets
     */
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get ticket by ID
     */
    @GetMapping("/{ticketId}")
    public ResponseEntity<?> getTicketById(@PathVariable String ticketId) {
        Optional<Ticket> ticket = ticketService.getTicketById(ticketId);
        if (ticket.isPresent()) {
            return ResponseEntity.ok(ticket.get());
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get tickets by booking ID
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<Ticket>> getTicketsByBookingId(@PathVariable int bookingId) {
        List<Ticket> tickets = ticketService.getTicketsByBookingId(bookingId);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get tickets by showtime ID
     */
    @GetMapping("/showtime/{showtimeId}")
    public ResponseEntity<List<Ticket>> getTicketsByShowtimeId(@PathVariable int showtimeId) {
        List<Ticket> tickets = ticketService.getTicketsByShowtimeId(showtimeId);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Check seat availability for a showtime
     */
    @GetMapping("/showtime/{showtimeId}/seat/{seatNumber}/available")
    public ResponseEntity<Map<String, Boolean>> checkSeatAvailability(
            @PathVariable int showtimeId, 
            @PathVariable String seatNumber) {
        boolean available = ticketService.isSeatAvailable(showtimeId, seatNumber);
        return ResponseEntity.ok(Map.of("available", available));
    }

    /**
     * Get booked seats for a showtime
     */
    @GetMapping("/showtime/{showtimeId}/booked-seats")
    public ResponseEntity<List<String>> getBookedSeats(@PathVariable int showtimeId) {
        List<String> bookedSeats = ticketService.getBookedSeats(showtimeId);
        return ResponseEntity.ok(bookedSeats);
    }

    /**
     * Update ticket
     */
    @PutMapping("/{ticketId}")
    public ResponseEntity<?> updateTicket(@PathVariable String ticketId, @RequestBody Ticket ticket) {
        try {
            Ticket updatedTicket = ticketService.updateTicket(ticketId, ticket);
            return ResponseEntity.ok(updatedTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete ticket
     */
    @DeleteMapping("/{ticketId}")
    public ResponseEntity<?> deleteTicket(@PathVariable String ticketId) {
        try {
            ticketService.deleteTicket(ticketId);
            return ResponseEntity.ok(Map.of("message", "Ticket deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete ticket"));
        }
    }

    /**
     * Get total revenue for a showtime
     */
    @GetMapping("/showtime/{showtimeId}/revenue")
    public ResponseEntity<Map<String, Double>> getShowtimeRevenue(@PathVariable int showtimeId) {
        double revenue = ticketService.getTotalRevenueByShowtime(showtimeId);
        return ResponseEntity.ok(Map.of("totalRevenue", revenue));
    }
}