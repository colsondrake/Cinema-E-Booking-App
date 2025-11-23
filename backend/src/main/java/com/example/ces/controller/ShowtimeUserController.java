package com.example.ces.controller;

import com.example.ces.model.Showtime;
import com.example.ces.service.ShowtimeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * User-facing APIs for showtime information.
 * - Get showtimes for a movie
 * - Get details about a specific showtime
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class ShowtimeUserController {

    private final ShowtimeService showtimeService;

    public ShowtimeUserController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    /**
     * Get all showtimes for a given movie (User Portal).
     *
     * Example:
     *  GET /api/movies/{movieId}/showtimes
     */
    @GetMapping("/movies/{movieId}/showtimes")
    public ResponseEntity<List<Showtime>> getShowtimesForMovie(@PathVariable String movieId) {
        List<Showtime> showtimes = showtimeService.getShowtimesForMovie(movieId);
        return ResponseEntity.ok(showtimes);
    }

    /**
     * Get a single showtime by ID (User Portal).
     *
     * Example:
     *  GET /api/showtimes/{showtimeId}
     */
    @GetMapping("/showtimes/{showtimeId}")
    public ResponseEntity<Showtime> getShowtimeById(@PathVariable String showtimeId) {
        Showtime showtime = showtimeService.getShowtimeById(showtimeId);
        return ResponseEntity.ok(showtime);
    }
}
