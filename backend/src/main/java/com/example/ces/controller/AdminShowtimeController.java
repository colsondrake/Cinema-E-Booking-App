package com.example.ces.controller;

import com.example.ces.model.Showtime;
import com.example.ces.service.ShowtimeService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/showtimes")
@CrossOrigin(origins = "*")
public class AdminShowtimeController {

    private final ShowtimeService showtimeService;

    public AdminShowtimeController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    // ============================================================
    // 1. Schedule a new showtime (Admin functionality)
    // Endpoint (POST):
    // /api/admin/showtimes?movieId=&showroomId=&date=&time=
    // ============================================================
    @PostMapping
    public ResponseEntity<?> scheduleShowtime(
            @RequestParam String movieId,
            @RequestParam String showroomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String time) {

        try {
            // Calls your updated scheduleShowtime() that now:
            // 1) saves to showtimes collection
            // 2) attaches showtime to Movie.showtimes[]
            Showtime showtime = showtimeService.scheduleShowtime(movieId, showroomId, date, time);

            return ResponseEntity.ok(showtime);

        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body("Scheduling conflict: " + ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }
    }

    // ============================================================================
    // 2. Get all showtimes for a movie (Admin + User Portal Shared Endpoint)
    // Endpoint:
    // GET /api/admin/showtimes?movieId=abc123
    // ============================================================================
    @GetMapping
    public ResponseEntity<List<Showtime>> getShowtimesForMovie(@RequestParam String movieId) {
        List<Showtime> showtimes = showtimeService.getShowtimesForMovie(movieId);
        return ResponseEntity.ok(showtimes);
    }
}
