package com.example.ces.service;

import com.example.ces.model.Movie;
<<<<<<< HEAD
=======
import com.example.ces.repository.MovieRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
import org.springframework.stereotype.Service;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;

<<<<<<< HEAD
import java.util.ArrayList;
=======
import java.io.InputStream;
>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
import java.util.List;
import java.util.Optional;

@Service
public class MovieService {

<<<<<<< HEAD
    private final MovieLoader movieLoader;
    private List<Movie> movies;

    public MovieService(MovieLoader movieLoader) {
        this.movieLoader = movieLoader;
=======
    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
    }

    @EventListener(ContextRefreshedEvent.class)
    public void init() {
<<<<<<< HEAD
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

=======
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
>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
}
