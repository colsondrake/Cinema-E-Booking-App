package com.example.ces.controller;

import com.example.ces.service.ShowtimeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "*")
public class SeatController {

    private final ShowtimeService showtimeService;

    public SeatController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    // ============================================================
    // 1. Get all taken seats for a showtime
    // Endpoint:
    // GET /api/showtimes/{showtimeId}/seats
    // ============================================================
    @GetMapping("/{showtimeId}/seats")
    public ResponseEntity<?> getTakenSeats(@PathVariable String showtimeId) {
        try {
            List<String> takenSeats = showtimeService.getTakenSeats(showtimeId);
            return ResponseEntity.ok(takenSeats);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }
    }

    // ============================================================
    // 2. Reserve seats (seat selection)
    // Endpoint:
    // POST /api/showtimes/{showtimeId}/reserve
    // Body: { "seats": ["A1", "A2"] }
    // ============================================================
    @PostMapping("/{showtimeId}/reserve")
    public ResponseEntity<?> reserveSeats(
            @PathVariable String showtimeId,
            @RequestBody SeatRequest request) {

        try {
            showtimeService.reserveSeats(showtimeId, request.getSeats());
            return ResponseEntity.ok("Seats reserved successfully.");
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body("Reservation failed: " + ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }
    }

    // ============================================================
    // Helper DTO for seat reservation request
    // ============================================================
    public static class SeatRequest {
        private List<String> seats;

        public List<String> getSeats() {
            return seats;
        }

        public void setSeats(List<String> seats) {
            this.seats = seats;
        }
    }
}
