package com.example.ces.service;

import com.example.ces.model.*;
import com.example.ces.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    /**
     * Create a new ticket
     */
    public Ticket createTicket(Ticket ticket) {
        // Validate that seat isn't already taken for this showtime
        List<Ticket> existingTickets = ticketRepository.findByShowtimeIdAndSeat_SeatNumber(
            ticket.getShowtimeId(), 
            ticket.getSeatNumber()
        );
        
        if (!existingTickets.isEmpty()) {
            throw new RuntimeException("Seat " + ticket.getSeatNumber() + " is already booked for this showtime");
        }
        
        return ticketRepository.save(ticket);
    }

    /**
     * Create multiple tickets (for group bookings)
     */
    public List<Ticket> createTickets(List<Ticket> tickets) {
        // Validate all seats are available
        for (Ticket ticket : tickets) {
            List<Ticket> existingTickets = ticketRepository.findByShowtimeIdAndSeat_SeatNumber(
                ticket.getShowtimeId(), 
                ticket.getSeatNumber()
            );
            
            if (!existingTickets.isEmpty()) {
                throw new RuntimeException("Seat " + ticket.getSeatNumber() + " is already booked for this showtime");
            }
        }
        
        return ticketRepository.saveAll(tickets);
    }

    /**
     * Get all tickets for a booking
     */
    public List<Ticket> getTicketsByBookingId(int bookingId) {
        return ticketRepository.findByBookingId(bookingId);
    }

    /**
     * Get all tickets for a showtime
     */
    public List<Ticket> getTicketsByShowtimeId(int showtimeId) {
        return ticketRepository.findByShowtimeId(showtimeId);
    }

    /**
     * Get ticket by ID
     */
    public Optional<Ticket> getTicketById(String ticketId) {
        return ticketRepository.findById(ticketId);
    }

    /**
     * Get all tickets
     */
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    /**
     * Check if a seat is available for a showtime
     */
    public boolean isSeatAvailable(int showtimeId, String seatNumber) {
        List<Ticket> existingTickets = ticketRepository.findByShowtimeIdAndSeat_SeatNumber(
            showtimeId, seatNumber
        );
        return existingTickets.isEmpty();
    }

    /**
     * Get booked seats for a showtime
     */
    public List<String> getBookedSeats(int showtimeId) {
        List<Ticket> tickets = ticketRepository.findByShowtimeId(showtimeId);
        return tickets.stream()
                .map(Ticket::getSeatNumber)
                .filter(seatNumber -> seatNumber != null)
                .toList();
    }

    /**
     * Delete ticket
     */
    public void deleteTicket(String ticketId) {
        ticketRepository.deleteById(ticketId);
    }

    /**
     * Update ticket
     */
    public Ticket updateTicket(String ticketId, Ticket updatedTicket) {
        Optional<Ticket> existingTicket = ticketRepository.findById(ticketId);
        if (existingTicket.isPresent()) {
            Ticket ticket = existingTicket.get();
            ticket.setShowtimeId(updatedTicket.getShowtimeId());
            ticket.setBookingId(updatedTicket.getBookingId());
            ticket.setType(updatedTicket.getType());
            ticket.setPrice(updatedTicket.getPrice());
            ticket.setSeat(updatedTicket.getSeat());
            return ticketRepository.save(ticket);
        }
        throw new RuntimeException("Ticket not found with id: " + ticketId);
    }

    /**
     * Get total revenue for a showtime
     */
    public double getTotalRevenueByShowtime(int showtimeId) {
        List<Ticket> tickets = ticketRepository.findByShowtimeId(showtimeId);
        return tickets.stream()
                .mapToDouble(Ticket::getPrice)
                .sum();
    }
}