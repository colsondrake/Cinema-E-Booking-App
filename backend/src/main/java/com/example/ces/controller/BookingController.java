package com.example.ces.controller;

import com.example.ces.dto.BookingRequestDTO;
import com.example.ces.model.Showtime;
import com.example.ces.service.ShowtimeService;
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

    public BookingController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
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
            }

            // 4. Reserve those seats atomically (this method is synchronized)
            showtimeService.reserveSeats(request.getShowtimeId(), seatNumbers);

            // 5. Compute prices based on showtime.basePrice and ticket type
            double basePrice = showtime.getBasePrice();
            double total = 0.0;
            List<Map<String, Object>> ticketSummaries = new ArrayList<>();

            for (BookingRequestDTO.TicketSelectionDTO t : request.getTickets()) {
                double multiplier;
                switch (t.getTicketType()) {
                    case ADULT -> multiplier = 1.0;
                    case SENIOR -> multiplier = 0.8;
                    case CHILD -> multiplier = 0.7;
                    default -> multiplier = 1.0;
                }

                double ticketPrice = basePrice * multiplier;
                total += ticketPrice;

                Map<String, Object> summary = new LinkedHashMap<>();
                summary.put("seatNumber", t.getSeatNumber());
                summary.put("ticketType", t.getTicketType());
                summary.put("price", ticketPrice);
                ticketSummaries.add(summary);
            }

            // 6. Build response
            Map<String, Object> responseBody = new LinkedHashMap<>();
            responseBody.put("showtimeId", showtime.getShowtimeId());
            responseBody.put("ticketCount", request.getTickets().size());
            responseBody.put("tickets", ticketSummaries);
            responseBody.put("totalPrice", total);

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
}
