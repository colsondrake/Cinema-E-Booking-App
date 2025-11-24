package com.example.ces.service;

import com.example.ces.model.Movie;
import com.example.ces.model.Showtime;
import com.example.ces.repository.MovieRepository;
import com.example.ces.repository.ShowtimeRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;

    public ShowtimeService(ShowtimeRepository showtimeRepository,
            MovieRepository movieRepository) {
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
    }

    // ============================
    // 1. Schedule a new showtime
    // ============================
    public Showtime scheduleShowtime(String movieId, String showroomId, LocalDate date, String time) {

        // prevent conflicts (Sprint 3 requirement)
        boolean conflict = showtimeRepository.existsByShowroomIdAndDateAndTime(showroomId, date, time);

        if (conflict) {
            throw new IllegalStateException("A movie is already scheduled in this showroom at the given date & time.");
        }

        Showtime showtime = new Showtime();
        showtime.setMovieId(movieId);
        showtime.setShowroomId(showroomId);
        showtime.setDate(date);
        showtime.setTime(time);

        if (showtime.getSeats() != null) {
            showtime.setAvailableSeats(showtime.getSeats().size());
        }

        // 1) Save the showtime to the showtimes collection
        Showtime savedShowtime = showtimeRepository.save(showtime);

        // 2) ALSO attach this showtime to the Movie's internal showtimes list
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found"));

        if (movie.getShowtimes() == null) {
            movie.setShowtimes(new ArrayList<>());
        }

        movie.getShowtimes().add(savedShowtime);

        // 3) Save the updated movie document
        movieRepository.save(movie);

        return savedShowtime;
    }

    // ============================
    // 2. Fetch showtimes for a movie
    // ============================
    public List<Showtime> getShowtimesForMovie(String movieId) {
        return showtimeRepository.findByMovieId(movieId);
    }

    // ============================
    // 3. Get taken seats (frontend use)
    // ============================
    public List<String> getTakenSeats(String showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));
        return showtime.getTakenSeats();
    }

    // ============================
    // 4. Reserve seats (seat selection)
    // ============================
    public synchronized void reserveSeats(String showtimeId, List<String> seatsToReserve) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

        // check if any seat is already taken
        for (String seat : seatsToReserve) {
            if (showtime.getTakenSeats().contains(seat)) {
                throw new IllegalStateException("Seat " + seat + " is already taken.");
            }
        }

        // update taken seats
        showtime.getTakenSeats().addAll(seatsToReserve);

        // save back to DB
        showtimeRepository.save(showtime);
    }
}
