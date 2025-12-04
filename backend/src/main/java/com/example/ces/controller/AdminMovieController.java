package com.example.ces.controller;

import com.example.ces.model.Movie;
import com.example.ces.service.MovieService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/admin/movies")
@CrossOrigin(origins = "*")
public class AdminMovieController {

    private final MovieService movieService;

    public AdminMovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    // ============================================================
    // 1. Add movie (Admin)
    // ============================================================
    @PostMapping
    public ResponseEntity<?> addMovie(@RequestBody Movie movie) {
        try {
            Movie saved = movieService.addMovie(movie);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ============================================================
    // 2. Get all movies (Admin)
    // ============================================================
    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    // ============================================================
    // 3. Delete movie (Admin)
    // ============================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable String id) {
        try {
            Optional<Movie> existing = movieService.getMovieById(id);
            if (existing.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // you can either call a delete method on the service,
            // or let the service expose the repository delete
            movieService.deleteMovieById(id);  // see note below

            return ResponseEntity.noContent().build(); // 204, successful delete
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ============================================================
    // 4. Update an existing movie (Admin)
    // ============================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMovie(
            @PathVariable String id,
            @RequestBody Movie updatedMovie) {

        Optional<Movie> existing = movieService.getMovieById(id);

        if (existing.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Movie saved = movieService.updateMovie(id, updatedMovie);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<Optional<Movie>> getMovie(@PathVariable String id) {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }


}
