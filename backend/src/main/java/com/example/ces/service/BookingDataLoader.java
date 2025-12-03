package com.example.ces.service;

import com.example.ces.model.*;
import com.example.ces.repository.BookingRepository;
import com.example.ces.repository.UserRepository;
import com.example.ces.repository.ShowtimeRepository;
import com.example.ces.repository.TicketRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class BookingDataLoader implements CommandLineRunner {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;
    private final TicketRepository ticketRepository;
    private final BookingService bookingService;
    private final Random random = new Random();

    public BookingDataLoader(BookingRepository bookingRepository, 
                           UserRepository userRepository, 
                           ShowtimeRepository showtimeRepository,
                           TicketRepository ticketRepository,
                           BookingService bookingService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.showtimeRepository = showtimeRepository;
        this.ticketRepository = ticketRepository;
        this.bookingService = bookingService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Clear any existing data if starting fresh
        if (bookingRepository.count() == 0 && ticketRepository.count() > 0) {
            System.out.println("Found orphaned tickets - clearing tickets table...");
            ticketRepository.deleteAll();
            System.out.println("Tickets table cleared - will be populated through bookings only");
        }
        
        // Clear taken seats for all showtimes (dev-only convenience)
        clearAllShowtimeTakenSeats();
        
        // Ensure existing showtimes have the 10x10 seat layout
        updateExistingShowtimesWithSeats();
        
        // Only load bookings (and their tickets) if booking table is empty
        if (bookingRepository.count() == 0) {
            loadDummyBookingsWithTickets();
        }
        
        // Verify the tickets table is populated correctly
        verifyTicketsTable();
    }
    
    //clear the takenSeats list on every showtime and recompute seatsBooked/availableSeats
    private void clearAllShowtimeTakenSeats() {
        List<Showtime> allShowtimes = showtimeRepository.findAll();
        if (allShowtimes == null || allShowtimes.isEmpty()) {
            System.out.println("No showtimes to clear takenSeats for.");
            return;
        }

        System.out.println("Clearing takenSeats for " + allShowtimes.size() + " showtimes...");
        for (Showtime s : allShowtimes) {
            boolean hadTaken = s.getTakenSeats() != null && !s.getTakenSeats().isEmpty();
            if (hadTaken) {
                s.setTakenSeats(new ArrayList<>());
                s.setSeatsBooked(0);
                int totalSeats = (s.getSeats() == null) ? 0 : s.getSeats().size();
                s.setAvailableSeats(totalSeats);
            } else if (s.getSeats() != null && s.getAvailableSeats() == 0 && s.getSeatsBooked() == 0) {
                // ensure availableSeats is set if seats exist
                s.setAvailableSeats(s.getSeats().size());
            }
        }

        showtimeRepository.saveAll(allShowtimes);
        System.out.println("Cleared takenSeats for all showtimes.");
    }

    private Showtime findShowtimeByMovieIdAndTime(String movieId, String timeLabel, List<Showtime> pool) {
        if (movieId == null || timeLabel == null) return null;

        // Prefer repository query for the movie id
        List<Showtime> candidates = showtimeRepository.findByMovieId(movieId);
        if (candidates == null || candidates.isEmpty()) {
            // fallback to provided pool or all showtimes
            candidates = (pool != null && !pool.isEmpty()) ? pool : showtimeRepository.findAll();
        }

        System.out.println("Searching " + candidates.size() + " showtimes for movieId=" + movieId + " time=" + timeLabel);
        String target = timeLabel.toLowerCase().replaceAll("\\s+", ""); // "1:30" -> "1:30"
        for (Showtime s : candidates) {
            if (s == null) continue;
            System.out.println("  candidate -> id: " + s.getShowtimeId() + " movieId: " + s.getMovieId() + " time: " + s.getTime());
            if (s.getMovieId() == null) continue;
            if (!s.getMovieId().toString().trim().equals(movieId)) continue;

            String t = s.getTime() == null ? "" : s.getTime().toLowerCase().replaceAll("\\s+", "");
            if (t.contains(target) || t.contains("0" + target) || t.contains("13:30") || t.contains(target + "pm") || t.contains(target + "am")) {
                return s;
            }
        }
        return null;
    }

    private void loadDummyBookingsWithTickets() {
        System.out.println("\n🎬 Loading dummy bookings - each will create tickets in the tickets table...");

        List<User> users = createDummyUsers();
        List<Showtime> existingShowtimes = showtimeRepository.findAll();
        
        if (existingShowtimes.isEmpty()) {
            System.err.println("No showtimes found in database. Cannot create bookings.");
            return;
        }
        
        System.out.println("Found " + existingShowtimes.size() + " existing showtimes");

        int showtimeIndex = 0;
        // Prefer finding the showtime by its generated id; fallback to movieId/time matcher if not found
        String targetShowtimeId = "6924e44b9eed077037d09b65";
        Showtime darkKnight130 = showtimeRepository.findById(targetShowtimeId).orElse(null);
        if (darkKnight130 == null) {
            System.out.println("Showtime id " + targetShowtimeId + " not found, falling back to movieId/time search");            darkKnight130 = findShowtimeByMovieIdAndTime("4", "1:30", existingShowtimes);
        }
        
        // If we found the Dark Knight 1:30 showtime, add a couple of specific sample bookings for it
        if (darkKnight130 != null) {
            createBookingAndPopulateTickets(users.get(0), darkKnight130, 
                    Arrays.asList("A3", "A4"), 
                    Arrays.asList(TicketType.ADULT, TicketType.ADULT),
                    BookingStatus.Confirmed, "Dark Knight 1:30 - Friends outing");
            
            createBookingAndPopulateTickets(users.get(1), darkKnight130, 
                    Arrays.asList("B1"), 
                    Arrays.asList(TicketType.ADULT),
                    BookingStatus.Confirmed, "Dark Knight 1:30 - Solo booking");
            createBookingAndPopulateTickets(users.get(1), darkKnight130, 
                    Arrays.asList("G7"), 
                    Arrays.asList(TicketType.ADULT),
                    BookingStatus.Confirmed, "Dark Knight 1:30 - Solo booking");
        } else {
            System.out.println("No explicit 'Dark Knight 1:30' showtime found - adding generic sample bookings across showtimes");
        }
        
        // Each booking will create tickets in the tickets table
        createBookingAndPopulateTickets(users.get(0), existingShowtimes.get(showtimeIndex % existingShowtimes.size()), 
                Arrays.asList("A1", "A2"), 
                Arrays.asList(TicketType.ADULT, TicketType.CHILD),
                BookingStatus.Confirmed, "Family movie night");
        showtimeIndex++;
        
        createBookingAndPopulateTickets(users.get(1), existingShowtimes.get(showtimeIndex % existingShowtimes.size()), 
                Arrays.asList("B5"), 
                Arrays.asList(TicketType.ADULT),
                BookingStatus.Confirmed, "Solo movie");
        showtimeIndex++;
        
        createBookingAndPopulateTickets(users.get(2), existingShowtimes.get(showtimeIndex % existingShowtimes.size()), 
                Arrays.asList("C1", "C2", "C3"), 
                Arrays.asList(TicketType.ADULT, TicketType.SENIOR, TicketType.CHILD),
                BookingStatus.Pending, "Group outing");
        showtimeIndex++;
        
        createBookingAndPopulateTickets(users.get(0), existingShowtimes.get(showtimeIndex % existingShowtimes.size()), 
                Arrays.asList("D4", "D5"), 
                Arrays.asList(TicketType.ADULT, TicketType.ADULT),
                BookingStatus.Confirmed, "Date night");
        showtimeIndex++;
        
        createBookingAndPopulateTickets(users.get(1), existingShowtimes.get(showtimeIndex % existingShowtimes.size()), 
                Arrays.asList("F1", "F2", "G8", "H10"), 
                Arrays.asList(TicketType.ADULT, TicketType.ADULT, TicketType.CHILD, TicketType.CHILD),
                BookingStatus.Cancelled, "Group booking - cancelled");

        createBookingAndPopulateTickets(users.get(2), existingShowtimes.get(showtimeIndex % existingShowtimes.size()), 
                Arrays.asList("J1", "J10", "E5"), 
                Arrays.asList(TicketType.SENIOR, TicketType.ADULT, TicketType.CHILD),
                BookingStatus.Confirmed, "Mixed seating");

        System.out.println("✅ Completed loading bookings - tickets table populated from bookings only");
    }

    private void createBookingAndPopulateTickets(User user, Showtime showtime, 
                                               List<String> seatNumbers, 
                                               List<TicketType> ticketTypes,
                                               BookingStatus status, String description) {
        
        System.out.println("\n--- Creating booking: " + description + " ---");
        System.out.println("This will add " + seatNumbers.size() + " tickets to the tickets table");
        
        // Calculate individual ticket prices
        double basePrice = showtime.getBasePrice();
        List<Double> ticketPrices = new ArrayList<>();
        
        for (TicketType ticketType : ticketTypes) {
            double multiplier = switch (ticketType) {
                case ADULT -> 1.0;
                case SENIOR -> 0.8;
                case CHILD -> 0.7;
            };
            ticketPrices.add(basePrice * multiplier);
        }
        
        try {
            // BookingService will create the booking AND add tickets to tickets table
            Booking savedBooking = bookingService.createBooking(user, showtime, seatNumbers, ticketTypes, ticketPrices);
     
            // Update booking status if needed
            if (savedBooking.getStatus() != status) {
                savedBooking = bookingService.updateBookingStatus(savedBooking.getId(), status);
            }
            
            System.out.println("✅ Booking " + savedBooking.getBookingId() + " created");
            System.out.println("   Added " + savedBooking.getTickets().size() + " tickets to tickets table");
            
        } catch (Exception e) {
            System.err.println("❌ Error creating booking: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void verifyTicketsTable() {
        System.out.println("\n=== TICKETS TABLE VERIFICATION ===");
        
        List<Ticket> allTickets = ticketRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAll();
        
        System.out.println("📊 Tickets in tickets table: " + allTickets.size());
        System.out.println("📊 Bookings in bookings table: " + allBookings.size());
        
        // Count tickets from bookings
        int ticketsFromBookings = allBookings.stream()
                .mapToInt(booking -> booking.getTickets() != null ? booking.getTickets().size() : 0)
                .sum();
        
        System.out.println("📊 Tickets referenced by bookings: " + ticketsFromBookings);
        
        // Verify all tickets have booking links
        int linkedTickets = 0;
        int orphanedTickets = 0;
        
        for (Ticket ticket : allTickets) {
            boolean foundInBooking = allBookings.stream()
                    .anyMatch(booking -> booking.getBookingId() == ticket.getBookingId());
            
            if (foundInBooking) {
                linkedTickets++;
            } else {
                orphanedTickets++;
                System.out.println("⚠️  Orphaned ticket: " + ticket.getTicketId());
            }
        }
        
        System.out.println("✅ Properly linked tickets: " + linkedTickets);
        System.out.println("⚠️  Orphaned tickets: " + orphanedTickets);
        
        if (orphanedTickets == 0 && allTickets.size() == ticketsFromBookings) {
            System.out.println("🎉 PERFECT: All tickets in tickets table are from bookings!");
        }
        
        // Show sample tickets
        if (!allTickets.isEmpty()) {
            System.out.println("\n📋 Sample tickets from tickets table:");
            allTickets.stream().limit(5).forEach(ticket -> {
                System.out.println("   - Ticket " + ticket.getTicketId() + 
                                 ": Seat " + ticket.getSeatNumber() + 
                                 ", Booking " + ticket.getBookingId() + 
                                 ", Type " + ticket.getType() + 
                                 ", Price $" + String.format("%.2f", ticket.getPrice()));
            });
        }
        
        System.out.println("=====================================\n");
    }

    private void updateExistingShowtimesWithSeats() {
        System.out.println("Updating existing showtimes with 10x10 seat layout...");
        
        List<Showtime> allShowtimes = showtimeRepository.findAll();
        boolean updated = false;
        
        for (Showtime showtime : allShowtimes) {
            if (showtime.getSeats() == null || showtime.getSeats().isEmpty()) {
                System.out.println("Updating showtime " + showtime.getShowtimeId() + " with 10x10 seats");
                
                List<String> seats = create10x10SeatLayout();
                showtime.setSeats(seats);
                
                if (showtime.getTakenSeats() == null) {
                    showtime.setTakenSeats(new ArrayList<>());
                }
                
                showtime.setAvailableSeats(100 - showtime.getTakenSeats().size());
                showtime.setSeatsBooked(showtime.getTakenSeats().size());
                
                updated = true;
            }
        }
        
        if (updated) {
            showtimeRepository.saveAll(allShowtimes);
        }
    }

    private List<User> createDummyUsers() {
        if (userRepository.count() == 0) {
            List<User> users = Arrays.asList(
                createUser("john.doe@email.com", "John", "Doe"),
                createUser("jane.smith@email.com", "Jane", "Smith"),
                createUser("bob.wilson@email.com", "Bob", "Wilson")
            );
            return (List<User>) userRepository.saveAll(users);
        } else {
            return userRepository.findAll();
        }
    }

    private User createUser(String email, String firstName, String lastName) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPassword("hashedPassword123");
        user.setPhone("555-0123");
        user.setIsActive(true);
        return user;
    }

    private List<String> create10x10SeatLayout() {
        List<String> seats = new ArrayList<>();
        for (char row = 'A'; row <= 'J'; row++) {
            for (int seatNum = 1; seatNum <= 10; seatNum++) {
                seats.add(row + String.valueOf(seatNum));
            }
        }
        return seats;
    }
}