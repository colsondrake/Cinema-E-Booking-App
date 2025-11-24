package com.example.ces.controller;

import com.example.ces.dto.BookingRequestDTO;
import com.example.ces.model.Booking;
import com.example.ces.model.Showtime;
import com.example.ces.model.User;
import com.example.ces.model.TicketType;
import com.example.ces.service.BookingService;
import com.example.ces.service.ShowtimeService;
import com.example.ces.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * User-facing booking API.
 * Handles:
 *  - Start booking for a showtime
 *  - Reserve selected seats
 *  - Return ticket breakdown + total price
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final ShowtimeService showtimeService;
    private final BookingService bookingService;
    private final UserService userService;

    public BookingController(ShowtimeService showtimeService, BookingService bookingService, UserService userService) {
        this.showtimeService = showtimeService;
        this.bookingService = bookingService;
        this.userService = userService;
    }

    /**
     * Start a booking (Sprint 3):
     *  - Validates showtimeId & ticket list
     *  - Reserves the requested seats
     *  - Returns ticket-level prices + total
     *
     * Example payload:
     * {
     *   "showtimeId": "664f2a...",
     *   "userId": "user123",
     *   "tickets": [
     *     { "seatNumber": "A1", "ticketType": "ADULT" },
     *     { "seatNumber": "A2", "ticketType": "CHILD" }
     *   ]
     * }
     */
    @PostMapping
    public ResponseEntity<?> startBooking(@Valid @RequestBody BookingRequestDTO request) {
        try {
            // 1. Ensure showtime exists
            Showtime showtime = showtimeService.getShowtimeById(request.getShowtimeId());

            // 2. Basic validation on ticket list
            if (request.getTickets() == null || request.getTickets().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "At least one ticket must be provided."));
            }

            // 3. Extract seat numbers & validate fields
            List<String> seatNumbers = new ArrayList<>();
            List<TicketType> ticketTypes = new ArrayList<>();
            
            for (BookingRequestDTO.TicketSelectionDTO t : request.getTickets()) {
                if (t.getSeatNumber() == null || t.getSeatNumber().isBlank()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Each ticket must have a seatNumber."));
                }
                if (t.getTicketType() == null) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Each ticket must have a ticketType (ADULT/SENIOR/CHILD)."));
                }
                seatNumbers.add(t.getSeatNumber());
                ticketTypes.add(t.getTicketType());
            }

            // 4. Reserve those seats atomically (this method is synchronized)
            showtimeService.reserveSeats(request.getShowtimeId(), seatNumbers);

            // 5. Compute prices based on showtime.basePrice and ticket type
            double basePrice = showtime.getBasePrice();
            double total = 0.0;
            List<Double> ticketPrices = new ArrayList<>();
            List<Map<String, Object>> ticketSummaries = new ArrayList<>();

            for (int i = 0; i < request.getTickets().size(); i++) {
                BookingRequestDTO.TicketSelectionDTO t = request.getTickets().get(i);
                
                double multiplier = switch (t.getTicketType()) {
                    case ADULT -> 1.0;
                    case SENIOR -> 0.8;
                    case CHILD -> 0.7;
                };

                double ticketPrice = basePrice * multiplier;
                total += ticketPrice;
                ticketPrices.add(ticketPrice);

                Map<String, Object> summary = new LinkedHashMap<>();
                summary.put("seatNumber", t.getSeatNumber());
                summary.put("ticketType", t.getTicketType());
                summary.put("price", ticketPrice);
                ticketSummaries.add(summary);
            }

            // 6. Get user and create booking in database with multiple tickets
            User user = null;
            if (request.getUserId() != null) {
                try {
                    user = userService.getUserByIdBooking(request.getUserId());
                } catch (Exception ex) {
                    // If user service fails or user not found, continue without user
                    user = null;
                }
            }

            // Create and save booking with multiple tickets
            Booking savedBooking = bookingService.createBooking(user, showtime, seatNumbers, ticketTypes, ticketPrices);

            // 7. Build response
            Map<String, Object> responseBody = new LinkedHashMap<>();
            responseBody.put("bookingId", savedBooking.getBookingId());
            responseBody.put("mongoId", savedBooking.getId()); // Include MongoDB ID
            responseBody.put("showtimeId", showtime.getShowtimeId());
            responseBody.put("ticketCount", savedBooking.getTickets().size());
            responseBody.put("tickets", ticketSummaries);
            responseBody.put("totalPrice", total);
            responseBody.put("status", savedBooking.getStatus());

            return ResponseEntity.ok(responseBody);

        } catch (IllegalArgumentException ex) {
            // thrown when showtime not found
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            // thrown by reserveSeats when any seat is already taken
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Booking failed: " + ex.getMessage()));
        }
    }
    
    /**
     * Get booking by ID
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBooking(@PathVariable String bookingId) {
        try {
            // Assuming you have a method to find booking by MongoDB ID
            return ResponseEntity.ok(Map.of("message", "Get booking endpoint - to be implemented"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to retrieve booking: " + ex.getMessage()));
        }
    }
}