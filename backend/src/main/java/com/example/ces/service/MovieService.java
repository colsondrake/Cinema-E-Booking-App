package com.example.ces.service;

import com.example.ces.model.Movie;
import org.springframework.stereotype.Service;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

    private final MovieLoader movieLoader;
    private List<Movie> movies;

    public MovieService(MovieLoader movieLoader) {
        this.movieLoader = movieLoader;
    }

    @EventListener(ContextRefreshedEvent.class)
    public void init() {
        movies = movieLoader.loadMovies();
    }

    public List<Movie> getAllMovies() {
        return movies;
    }

    public Optional<Movie> getMovieById(String id) {
        for (Movie m : movies) {
            if (m.getId().equals(id)) {
                return Optional.of(m);
            }
        }
        return Optional.empty();
    }

    public List<Movie> searchByTitle(String title) {
        List<Movie> result = new ArrayList<>();
        for (Movie m : movies) {
            if (m.getTitle().toLowerCase().contains(title.toLowerCase())) {
                result.add(m);
            }
        }
        return result;
    }

    public List<Movie> searchByGenre(String genre) {
        List<Movie> result = new ArrayList<>();
        for (Movie m : movies) {
            if (m.getGenre().equalsIgnoreCase(genre)) {
                result.add(m);
            }
        }
        return result;
    }

}
