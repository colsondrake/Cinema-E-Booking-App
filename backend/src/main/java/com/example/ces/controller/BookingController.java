package com.example.ces.controller;

import com.example.ces.dto.BookingRequestDTO;
import com.example.ces.model.Booking;
import com.example.ces.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * User-facing booking API.
 * Delegates business logic to BookingService.
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Start a booking (Sprint 3):
     * - Validates showtimeId & ticket list
     * - Reserves the requested seats
     * - Returns ticket-level prices + total
     *
     * Example payload:
     * {
     * "showtimeId": "664f2a...",
     * "userId": "user123",
     * "tickets": [
     * { "seatNumber": "A1", "ticketType": "ADULT" },
     * { "seatNumber": "A2", "ticketType": "CHILD" }
     * ]
     * }
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequestDTO request) {
        try {
            Booking booking = bookingService.createBooking(request);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
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
            return ResponseEntity.ok(bookingService.getBookingById(bookingId));
    }

    /**
     * Get bookinga by user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable String userId) {
            return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    /**
     * Get all bookings for a showtime
     */
    @GetMapping("/showtime/{showtimeId}")
    public ResponseEntity<?> getBookingsForShowtime(@PathVariable String showtimeId) {
        return ResponseEntity.ok(bookingService.getBookingsByShowtimeId(showtimeId));
    }
}