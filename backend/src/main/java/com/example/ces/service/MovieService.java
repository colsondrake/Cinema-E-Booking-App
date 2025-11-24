package com.example.ces.service;

import com.example.ces.model.Movie;
import com.example.ces.repository.MovieRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.springframework.stereotype.Service;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    // =====================================================================
    // Load sample movies from data.json ONLY if DB is empty (from old sprint)
    // =====================================================================
    @EventListener(ContextRefreshedEvent.class)
    public void init() {
        boolean empty = movieRepository.count() == 0;
        System.out.println("MovieService.init: movies in DB = " + movieRepository.count());
        if (empty) {
            InputStream is = getClass().getResourceAsStream("/data.json");
            if (is == null) {
                System.err.println(
                        "MovieService.init: could not find /data.json on classpath. Put data.json in src/main/resources/");
                return;
            }

            try {
                ObjectMapper mapper = new ObjectMapper();
                mapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS, true);
                mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
                mapper.registerModule(new JavaTimeModule());

                List<Movie> movies = mapper.readValue(is, new TypeReference<List<Movie>>() {
                });
                movieRepository.saveAll(movies);
                System.out.println("✓ Loaded movies from data.json (" + movies.size() + " items)");
            } catch (Exception e) {
                System.err.println("MovieService.init: failed to load/parse data.json");
                e.printStackTrace();
            }
        } else {
            System.out.println("MovieService.init: skipping load because DB already has data");
        }
    }

    // =====================================================================
    // Sprint 3 REQUIRED: Add a NEW movie through the admin portal
    // =====================================================================
    public Movie addMovie(Movie movie) {

        // Basic required field validation (Sprint 3 rubric)
        if (movie.getTitle() == null || movie.getTitle().isBlank())
            throw new IllegalArgumentException("Title is required.");

        if (movie.getDirector() == null || movie.getDirector().isBlank())
            throw new IllegalArgumentException("Director is required.");

        if (movie.getRating() == null || movie.getRating().isBlank())
            throw new IllegalArgumentException("Rating is required.");

        if (movie.getPosterUrl() == null || movie.getPosterUrl().isBlank())
            throw new IllegalArgumentException("Poster URL is required.");

        return movieRepository.save(movie);
    }

    // =====================================================================
    // Existing methods (unchanged)
    // =====================================================================
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Optional<Movie> getMovieById(String id) {
        return movieRepository.findById(id);
    }

    public List<Movie> searchByTitle(String title) {
        return movieRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Movie> searchByGenre(String genre) {
        return movieRepository.findByGenresIgnoreCase(genre);
    }

    public Movie saveMovie(Movie movie) {
        return movieRepository.save(movie);
    }
}
