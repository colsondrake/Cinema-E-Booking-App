package com.example.ces.service;

import com.example.ces.model.Movie;
import com.example.ces.repository.MovieRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    @EventListener(ContextRefreshedEvent.class)
    public void init() {
        if (movieRepository.count() == 0) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                InputStream is = getClass().getResourceAsStream("/data.json");
                List<Movie> movies = mapper.readValue(is, new TypeReference<List<Movie>>() {
                });
                movieRepository.saveAll(movies);
                System.out.println("✅ Loaded movies from data.json into MongoDB");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

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
        return movieRepository.findByGenresIgnoreCase(genre); // plural
    }

    public Movie saveMovie(Movie movie) {
        return movieRepository.save(movie);
    }
}
