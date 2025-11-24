package com.example.ces.service;

import com.example.ces.model.*;
import com.example.ces.repository.TicketRepository;
import com.example.ces.repository.ShowtimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private ShowtimeRepository showtimeRepository;

    /**
     * Create a new ticket
     */
    public Ticket createTicket(Ticket ticket) {
        // Validate showtime exists
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(String.valueOf(ticket.getShowtimeId()));
        if (showtimeOpt.isEmpty()) {
            throw new RuntimeException("Showtime not found with id: " + ticket.getShowtimeId());
        }
        
        Showtime showtime = showtimeOpt.get();
        String seatNumber = ticket.getSeatNumber();
        
        // Check if seat is already in takenSeats array
        if (showtime.getTakenSeats().contains(seatNumber)) {
            throw new RuntimeException("Seat " + seatNumber + " is already booked for this showtime");
        }
        
        // Check if seat exists in available seats array (now List<String>)
        if (!showtime.getSeats().contains(seatNumber)) {
            throw new RuntimeException("Seat " + seatNumber + " does not exist for this showtime");
        }
        
        // Save ticket (no Seat object needed)
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Update showtime's takenSeats array
        showtime.getTakenSeats().add(seatNumber);
        showtimeRepository.save(showtime);
        
        return savedTicket;
    }

    /**
     * Create multiple tickets (for group bookings)
     */
    public List<Ticket> createTickets(List<Ticket> tickets) {
        if (tickets.isEmpty()) {
            return tickets;
        }
        
        // Get showtime (assuming all tickets are for same showtime)
        int showtimeId = tickets.get(0).getShowtimeId();
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(String.valueOf(showtimeId));
        if (showtimeOpt.isEmpty()) {
            throw new RuntimeException("Showtime not found with id: " + showtimeId);
        }
        
        Showtime showtime = showtimeOpt.get();
        List<String> seatNumbers = tickets.stream()
                .map(Ticket::getSeatNumber)
                .toList();
        
        // Validate all seats are available
        for (String seatNumber : seatNumbers) {
            if (showtime.getTakenSeats().contains(seatNumber)) {
                throw new RuntimeException("Seat " + seatNumber + " is already booked for this showtime");
            }
            
            if (!showtime.getSeats().contains(seatNumber)) {
                throw new RuntimeException("Seat " + seatNumber + " does not exist for this showtime");
            }
        }
        
        // Save all tickets
        List<Ticket> savedTickets = ticketRepository.saveAll(tickets);
        
        // Update showtime's takenSeats array with all new seats
        showtime.getTakenSeats().addAll(seatNumbers);
        showtimeRepository.save(showtime);
        
        return savedTickets;
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
     * Check if a seat is available for a showtime using showtime's takenSeats array
     */
    public boolean isSeatAvailable(int showtimeId, String seatNumber) {
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(String.valueOf(showtimeId));
        if (showtimeOpt.isEmpty()) {
            return false;
        }
        
        Showtime showtime = showtimeOpt.get();
        
        // Check if seat exists and is not taken (both are List<String> now)
        return showtime.getSeats().contains(seatNumber) && 
               !showtime.getTakenSeats().contains(seatNumber);
    }

    /**
     * Get booked seats for a showtime from showtime's takenSeats array
     */
    public List<String> getBookedSeats(int showtimeId) {
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(String.valueOf(showtimeId));
        if (showtimeOpt.isEmpty()) {
            throw new RuntimeException("Showtime not found with id: " + showtimeId);
        }
        
        return showtimeOpt.get().getTakenSeats();
    }

    /**
     * Get available seats for a showtime - now returns List<String>
     */
    public List<String> getAvailableSeats(int showtimeId) {
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(String.valueOf(showtimeId));
        if (showtimeOpt.isEmpty()) {
            throw new RuntimeException("Showtime not found with id: " + showtimeId);
        }
        
        Showtime showtime = showtimeOpt.get();
        return showtime.getSeats().stream()
                .filter(seatNumber -> !showtime.getTakenSeats().contains(seatNumber))
                .toList();
    }

    /**
     * Delete ticket and free up the seat
     */
    public void deleteTicket(String ticketId) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            
            // Remove from takenSeats array in showtime
            Optional<Showtime> showtimeOpt = showtimeRepository.findById(String.valueOf(ticket.getShowtimeId()));
            if (showtimeOpt.isPresent()) {
                Showtime showtime = showtimeOpt.get();
                showtime.getTakenSeats().remove(ticket.getSeatNumber());
                showtimeRepository.save(showtime);
            }
            
            ticketRepository.deleteById(ticketId);
        }
    }

    /**
     * Update ticket
     */
    public Ticket updateTicket(String ticketId, Ticket updatedTicket) {
        Optional<Ticket> existingTicketOpt = ticketRepository.findById(ticketId);
        if (existingTicketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found with id: " + ticketId);
        }
        
        Ticket existingTicket = existingTicketOpt.get();
        String oldSeatNumber = existingTicket.getSeatNumber();
        String newSeatNumber = updatedTicket.getSeatNumber();
        
        // If seat number is changing, update showtime arrays
        if (!oldSeatNumber.equals(newSeatNumber)) {
            Optional<Showtime> showtimeOpt = showtimeRepository.findById(String.valueOf(existingTicket.getShowtimeId()));
            if (showtimeOpt.isPresent()) {
                Showtime showtime = showtimeOpt.get();
                
                // Check if new seat is available
                if (showtime.getTakenSeats().contains(newSeatNumber)) {
                    throw new RuntimeException("Seat " + newSeatNumber + " is already booked");
                }
                
                if (!showtime.getSeats().contains(newSeatNumber)) {
                    throw new RuntimeException("Seat " + newSeatNumber + " does not exist");
                }
                
                // Update seat arrays
                showtime.getTakenSeats().remove(oldSeatNumber);
                showtime.getTakenSeats().add(newSeatNumber);
                showtimeRepository.save(showtime);
            }
        }
        
        // Update ticket fields
        existingTicket.setShowtimeId(updatedTicket.getShowtimeId());
        existingTicket.setBookingId(updatedTicket.getBookingId());
        existingTicket.setType(updatedTicket.getType());
        existingTicket.setPrice(updatedTicket.getPrice());
        existingTicket.setSeatNumber(updatedTicket.getSeatNumber());
        
        return ticketRepository.save(existingTicket);
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

    /**
     * Get seat count statistics for a showtime
     */
    public SeatStatistics getSeatStatistics(int showtimeId) {
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(String.valueOf(showtimeId));
        if (showtimeOpt.isEmpty()) {
            throw new RuntimeException("Showtime not found with id: " + showtimeId);
        }
        
        Showtime showtime = showtimeOpt.get();
        int totalSeats = showtime.getSeats().size();
        int takenSeats = showtime.getTakenSeats().size();
        int availableSeats = totalSeats - takenSeats;
        
        return new SeatStatistics(totalSeats, takenSeats, availableSeats);
    }

    // Inner class for seat statistics
    public static class SeatStatistics {
        private final int totalSeats;
        private final int takenSeats;
        private final int availableSeats;
        
        public SeatStatistics(int totalSeats, int takenSeats, int availableSeats) {
            this.totalSeats = totalSeats;
            this.takenSeats = takenSeats;
            this.availableSeats = availableSeats;
        }
        
        public int getTotalSeats() { return totalSeats; }
        public int getTakenSeats() { return takenSeats; }
        public int getAvailableSeats() { return availableSeats; }
    }
}