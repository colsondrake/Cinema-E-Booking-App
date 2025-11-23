package com.example.ces.service;

import com.example.ces.model.*;
import com.example.ces.repository.BookingRepository;
import com.example.ces.repository.TicketRepository;
import com.example.ces.repository.ShowtimeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final ShowtimeRepository showtimeRepository;
    private final Random random = new Random();

    public BookingService(BookingRepository bookingRepository, 
                         TicketRepository ticketRepository,
                         ShowtimeRepository showtimeRepository) {
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.showtimeRepository = showtimeRepository;
    }

    /**
     * Create a booking with tickets and update showtime's takenSeats
     */
    public Booking createBooking(User user, Showtime showtime, List<String> seatNumbers, 
                               List<TicketType> ticketTypes, List<Double> ticketPrices) {
        
        // Validate inputs
        if (seatNumbers.size() != ticketTypes.size() || seatNumbers.size() != ticketPrices.size()) {
            throw new IllegalArgumentException("Seat numbers, ticket types, and prices must have the same count");
        }
        
        System.out.println("Creating booking with seats: " + seatNumbers + " for showtime " + showtime.getShowtimeId());
        
        // Check if any seats are already taken
        validateSeatsAvailable(showtime.getShowtimeId(), seatNumbers);
        
        // Create booking first
        Booking booking = new Booking();
        booking.setBookingId(generateBookingId());
        booking.setUser(user);
        booking.setShowtime(showtime);
        booking.setBookingDate(LocalDate.now());
        booking.setNumberOfTickets(seatNumbers.size());
        booking.setStatus(BookingStatus.Confirmed);
        
        // Save booking to get MongoDB ID
        Booking savedBooking = bookingRepository.save(booking);
        System.out.println("Created booking " + savedBooking.getBookingId());
        
        // Create tickets and save them to the TICKETS TABLE
        List<Ticket> tickets = createTicketsForBooking(savedBooking, seatNumbers, ticketTypes, ticketPrices);
        
        // Update booking with tickets array
        savedBooking.setTickets(tickets);
        
        // Update showtime's takenSeats with the booked seat numbers
        addSeatsToShowtimeTakenSeats(showtime.getShowtimeId(), seatNumbers);
        
        // Save final booking
        Booking finalBooking = bookingRepository.save(savedBooking);
        
        System.out.println("✅ Booking " + finalBooking.getBookingId() + " created with seats: " + 
                         getSeatNumbersFromTickets(tickets));
        
        return finalBooking;
    }
    
    /**
     * Delete a booking and remove its seat numbers from showtime's takenSeats
     */
    public void deleteBooking(String bookingId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            
            // Get seat numbers from tickets before deletion
            List<String> seatNumbers = getSeatNumbersFromTickets(booking.getTickets());
            
            System.out.println("Deleting booking " + booking.getBookingId() + " and releasing seats: " + seatNumbers);
            
            // Delete all associated tickets from TICKETS TABLE
            for (Ticket ticket : booking.getTickets()) {
                ticketRepository.deleteById(ticket.getId());
            }
            
            // Remove seats from showtime's takenSeats
            removeSeatsFromShowtimeTakenSeats(booking.getShowtime().getShowtimeId(), seatNumbers);
            
            // Delete booking
            bookingRepository.deleteById(bookingId);
            
            System.out.println("✅ Deleted booking and released seats from takenSeats: " + seatNumbers);
        }
    }
    
    /**
     * Update booking status and handle seat management for cancellations
     */
    public Booking updateBookingStatus(String bookingId, BookingStatus newStatus) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new IllegalArgumentException("Booking not found: " + bookingId);
        }
        
        Booking booking = bookingOpt.get();
        BookingStatus oldStatus = booking.getStatus();
        
        if (oldStatus == newStatus) {
            return booking; // No change needed
        }
        
        List<String> seatNumbers = getSeatNumbersFromTickets(booking.getTickets());
        
        System.out.println("Updating booking " + booking.getBookingId() + " status from " + 
                         oldStatus + " to " + newStatus + " (seats: " + seatNumbers + ")");
        
        // Handle seat management based on status change
        if (newStatus == BookingStatus.Cancelled && oldStatus != BookingStatus.Cancelled) {
            // Booking being cancelled - remove seats from takenSeats
            removeSeatsFromShowtimeTakenSeats(booking.getShowtime().getShowtimeId(), seatNumbers);
            System.out.println("Released seats from takenSeats due to cancellation: " + seatNumbers);
            
        } else if (oldStatus == BookingStatus.Cancelled && newStatus != BookingStatus.Cancelled) {
            // Booking being reactivated - add seats back to takenSeats
            addSeatsToShowtimeTakenSeats(booking.getShowtime().getShowtimeId(), seatNumbers);
            System.out.println("Added seats back to takenSeats due to reactivation: " + seatNumbers);
        }
        
        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }
    
    /**
     * Sync all showtime takenSeats with actual booked tickets (repair function)
     */
    public void syncShowtimeTakenSeatsWithBookings(String showtimeId) {
        System.out.println("Syncing takenSeats for showtime " + showtimeId + " with actual bookings...");
        
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(showtimeId);
        if (showtimeOpt.isEmpty()) {
            throw new IllegalArgumentException("Showtime not found: " + showtimeId);
        }
        
        Showtime showtime = showtimeOpt.get();
        
        // Get all confirmed bookings for this showtime
        List<Booking> confirmedBookings = bookingRepository.findAll().stream()
                .filter(booking -> booking.getShowtime().getShowtimeId().equals(showtimeId))
                .filter(booking -> booking.getStatus() == BookingStatus.Confirmed || 
                                 booking.getStatus() == BookingStatus.Pending)
                .toList();
        
        // Collect all seat numbers from confirmed bookings
        List<String> actualTakenSeats = new ArrayList<>();
        for (Booking booking : confirmedBookings) {
            actualTakenSeats.addAll(getSeatNumbersFromTickets(booking.getTickets()));
        }
        
        // Remove duplicates
        actualTakenSeats = actualTakenSeats.stream().distinct().collect(Collectors.toList());
        
        System.out.println("Found " + actualTakenSeats.size() + " taken seats from " + 
                         confirmedBookings.size() + " confirmed bookings");
        System.out.println("Actual taken seats: " + actualTakenSeats);
        
        // Update showtime with correct takenSeats
        showtime.setTakenSeats(actualTakenSeats);
        showtime.setSeatsBooked(actualTakenSeats.size());
        
        if (showtime.getSeats() != null) {
            showtime.setAvailableSeats(showtime.getSeats().size() - actualTakenSeats.size());
        }
        
        showtimeRepository.save(showtime);
        System.out.println("✅ Synced showtime " + showtimeId + " takenSeats with actual bookings");
    }
    
    /**
     * Get booking statistics showing seat usage
     */
    public BookingStatistics getBookingStatistics(String showtimeId) {
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(showtimeId);
        if (showtimeOpt.isEmpty()) {
            throw new IllegalArgumentException("Showtime not found: " + showtimeId);
        }
        
        Showtime showtime = showtimeOpt.get();
        
        // Get all bookings for this showtime
        List<Booking> allBookings = bookingRepository.findAll().stream()
                .filter(booking -> booking.getShowtime().getShowtimeId().equals(showtimeId))
                .toList();
        
        // Count by status
        long confirmedBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.Confirmed).count();
        long pendingBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.Pending).count();
        long cancelledBookings = allBookings.stream().filter(b -> b.getStatus() == BookingStatus.Cancelled).count();
        
        // Count seats
        int totalSeats = showtime.getSeats() != null ? showtime.getSeats().size() : 0;
        int takenSeats = showtime.getTakenSeats() != null ? showtime.getTakenSeats().size() : 0;
        int availableSeats = totalSeats - takenSeats;
        
        return new BookingStatistics(
            showtimeId, 
            allBookings.size(), 
            confirmedBookings, 
            pendingBookings, 
            cancelledBookings,
            totalSeats, 
            takenSeats, 
            availableSeats,
            showtime.getTakenSeats()
        );
    }
    
    // ============================
    // Private Helper Methods
    // ============================
    
    private void validateSeatsAvailable(String showtimeId, List<String> seatNumbers) {
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(showtimeId);
        if (showtimeOpt.isEmpty()) {
            throw new IllegalArgumentException("Showtime not found: " + showtimeId);
        }
        
        Showtime showtime = showtimeOpt.get();
        
        // Check if showtime has seats initialized
        if (showtime.getSeats() == null || showtime.getSeats().isEmpty()) {
            throw new IllegalStateException("Showtime has no seats configured");
        }
        
        // Check if all requested seats exist
        for (String seatNumber : seatNumbers) {
            if (!showtime.getSeats().contains(seatNumber)) {
                throw new IllegalArgumentException("Seat " + seatNumber + " does not exist for this showtime");
            }
        }
        
        // Check if any seats are already taken
        if (showtime.getTakenSeats() != null) {
            for (String seatNumber : seatNumbers) {
                if (showtime.getTakenSeats().contains(seatNumber)) {
                    throw new IllegalStateException("Seat " + seatNumber + " is already taken");
                }
            }
        }
    }
    
    private List<Ticket> createTicketsForBooking(Booking booking, List<String> seatNumbers, 
                                                List<TicketType> ticketTypes, List<Double> ticketPrices) {
        List<Ticket> tickets = new ArrayList<>();
        
        for (int i = 0; i < seatNumbers.size(); i++) {
            Ticket ticket = new Ticket();
            ticket.setTicketId(generateTicketId());
            ticket.setSeatNumber(seatNumbers.get(i));
            ticket.setType(ticketTypes.get(i));
            ticket.setPrice(ticketPrices.get(i));
            ticket.setBookingId(booking.getBookingId());
            
            // Convert showtime ID for ticket
            try {
                String numericPart = booking.getShowtime().getShowtimeId().replaceAll("[^0-9]", "");
                if (!numericPart.isEmpty()) {
                    ticket.setShowtimeId(Integer.parseInt(numericPart));
                } else {
                    ticket.setShowtimeId(random.nextInt(999999));
                }
            } catch (Exception e) {
                ticket.setShowtimeId(random.nextInt(999999));
            }
            
            tickets.add(ticket);
        }
        
        // Save all tickets to the tickets table
        List<Ticket> savedTickets = ticketRepository.saveAll(tickets);
        
        System.out.println("Created " + savedTickets.size() + " tickets for booking " + booking.getBookingId());
        for (Ticket ticket : savedTickets) {
            System.out.println("  - Ticket " + ticket.getTicketId() + ": Seat " + ticket.getSeatNumber());
        }
        
        return savedTickets;
    }
    
    private void addSeatsToShowtimeTakenSeats(String showtimeId, List<String> seatNumbers) {
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(showtimeId);
        if (showtimeOpt.isEmpty()) {
            return;
        }
        
        Showtime showtime = showtimeOpt.get();
        
        // Initialize takenSeats if null
        if (showtime.getTakenSeats() == null) {
            showtime.setTakenSeats(new ArrayList<>());
        }
        
        // Create a mutable copy and add new seats
        List<String> takenSeats = new ArrayList<>(showtime.getTakenSeats());
        
        for (String seatNumber : seatNumbers) {
            if (!takenSeats.contains(seatNumber)) {
                takenSeats.add(seatNumber);
            }
        }
        
        // Update showtime
        showtime.setTakenSeats(takenSeats);
        showtime.setSeatsBooked(takenSeats.size());
        
        if (showtime.getSeats() != null) {
            showtime.setAvailableSeats(showtime.getSeats().size() - takenSeats.size());
        }
        
        showtimeRepository.save(showtime);
        
        System.out.println("Added seats to takenSeats for showtime " + showtimeId + ": " + seatNumbers);
        System.out.println("Total takenSeats now: " + takenSeats.size());
    }
    
    private void removeSeatsFromShowtimeTakenSeats(String showtimeId, List<String> seatNumbers) {
        Optional<Showtime> showtimeOpt = showtimeRepository.findById(showtimeId);
        if (showtimeOpt.isEmpty()) {
            return;
        }
        
        Showtime showtime = showtimeOpt.get();
        
        if (showtime.getTakenSeats() == null) {
            showtime.setTakenSeats(new ArrayList<>());
        }
        
        // Create a mutable copy and remove seats
        List<String> takenSeats = new ArrayList<>(showtime.getTakenSeats());
        takenSeats.removeAll(seatNumbers);
        
        // Update showtime
        showtime.setTakenSeats(takenSeats);
        showtime.setSeatsBooked(takenSeats.size());
        
        if (showtime.getSeats() != null) {
            showtime.setAvailableSeats(showtime.getSeats().size() - takenSeats.size());
        }
        
        showtimeRepository.save(showtime);
        
        System.out.println("Removed seats from takenSeats for showtime " + showtimeId + ": " + seatNumbers);
        System.out.println("Total takenSeats now: " + takenSeats.size());
    }
    
    private List<String> getSeatNumbersFromTickets(List<Ticket> tickets) {
        if (tickets == null) {
            return new ArrayList<>();
        }
        return tickets.stream()
                .map(Ticket::getSeatNumber)
                .collect(Collectors.toList());
    }
    
    // Overloaded method for backward compatibility
    public Booking createBooking(User user, Showtime showtime, int numberOfTickets, double totalPrice) {
        List<String> seatNumbers = new ArrayList<>();
        List<TicketType> ticketTypes = new ArrayList<>();
        List<Double> ticketPrices = new ArrayList<>();
        
        double avgPrice = totalPrice / numberOfTickets;
        
        for (int i = 0; i < numberOfTickets; i++) {
            seatNumbers.add("TBD" + (i + 1)); // Placeholder seat numbers
            ticketTypes.add(TicketType.ADULT); // Default to adult
            ticketPrices.add(avgPrice);
        }
        
        return createBooking(user, showtime, seatNumbers, ticketTypes, ticketPrices);
    }

    private int generateBookingId() {
        return 100000 + random.nextInt(900000);
    }
    
    private int generateTicketId() {
        return 1000 + random.nextInt(9000);
    }
    
    
    // Inner class for booking statistics
    public static class BookingStatistics {
        private final String showtimeId;
        private final int totalBookings;
        private final long confirmedBookings;
        private final long pendingBookings;
        private final long cancelledBookings;
        private final int totalSeats;
        private final int takenSeats;
        private final int availableSeats;
        private final List<String> takenSeatNumbers;

        public BookingStatistics(String showtimeId, int totalBookings, long confirmedBookings, 
                               long pendingBookings, long cancelledBookings, int totalSeats, 
                               int takenSeats, int availableSeats, List<String> takenSeatNumbers) {
            this.showtimeId = showtimeId;
            this.totalBookings = totalBookings;
            this.confirmedBookings = confirmedBookings;
            this.pendingBookings = pendingBookings;
            this.cancelledBookings = cancelledBookings;
            this.totalSeats = totalSeats;
            this.takenSeats = takenSeats;
            this.availableSeats = availableSeats;
            this.takenSeatNumbers = takenSeatNumbers;
        }

        // Getters
        public String getShowtimeId() { return showtimeId; }
        public int getTotalBookings() { return totalBookings; }
        public long getConfirmedBookings() { return confirmedBookings; }
        public long getPendingBookings() { return pendingBookings; }
        public long getCancelledBookings() { return cancelledBookings; }
        public int getTotalSeats() { return totalSeats; }
        public int getTakenSeats() { return takenSeats; }
        public int getAvailableSeats() { return availableSeats; }
        public List<String> getTakenSeatNumbers() { return takenSeatNumbers; }
    }
}