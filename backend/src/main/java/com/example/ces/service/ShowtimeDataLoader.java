package com.example.ces.service;

import com.example.ces.model.Movie;
import com.example.ces.model.Showtime;
import com.example.ces.repository.MovieRepository;
import com.example.ces.repository.ShowtimeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

/**
 * Loads showtimes that are embedded/linked in Movie records.
 * Scans movieRepository -> for each Movie.showtimes (if any) attempts to persist
 * corresponding Showtime documents referencing movieId. Skips duplicates.
 */
@Component
public class ShowtimeDataLoader implements CommandLineRunner {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;

    public ShowtimeDataLoader(ShowtimeRepository showtimeRepository, MovieRepository movieRepository) {
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        List<Movie> movies = movieRepository.findAll();
        if (movies == null || movies.isEmpty()) {
            System.out.println("No movies found in repository - skipping showtime import.");
            return;
        }

        // Fetch existing showtimes once to perform duplicate checks
        List<Showtime> existingShowtimes = showtimeRepository.findAll();
        LocalDate defaultDate = LocalDate.now().plusDays(1);

        List<Showtime> toSave = new ArrayList<>();

        for (Movie movie : movies) {
            if (movie == null) continue;

            final String[] movieIdHolder = {movie.getId()};
            if (movieIdHolder[0] == null) {
                // ensure movie persisted (should not normally happen for findAll())
                try {
                    Movie persisted = movieRepository.save(movie);
                    movieIdHolder[0] = persisted.getId();
                } catch (Exception e) {
                    System.err.println("Failed to persist movie '" + movie.getTitle() + "': " + e.getMessage());
                    continue;
                }
            }
            final String movieId = movieIdHolder[0];

            List<Showtime> movieShowtimes = movie.getShowtimes();
            if (movieShowtimes == null || movieShowtimes.isEmpty()) {
                continue;
            }

            for (Showtime ms : movieShowtimes) {
                if (ms == null) continue;

                // Normalize date/time: use provided values or sensible defaults
                LocalDate date = ms.getDate() != null ? ms.getDate() : defaultDate;
                String time = (ms.getTime() != null && !ms.getTime().isBlank()) ? ms.getTime().trim() : "12:00 PM";

                // Duplicate check: same movieId + date + time
                boolean exists = existingShowtimes.stream().anyMatch(es ->
                        es != null &&
                        es.getMovieId() != null &&
                        es.getMovieId().equals(movieId) &&
                        Objects.equals(es.getDate(), date) &&
                        es.getTime() != null &&
                        es.getTime().trim().equalsIgnoreCase(time)
                );

                if (exists) {
                    System.out.println("Skipping duplicate showtime for movie '" + movie.getTitle() + "' at " + time + " on " + date);
                    continue;
                }

                // Prepare new showtime document
                Showtime st = new Showtime();
                st.setMovieId(movieId);
                st.setDate(date);
                st.setTime(time);
                st.setShowroomId(ms.getShowroomId() != null ? ms.getId() : "Theater 1");
                st.setBasePrice(ms.getBasePrice() != 0.0 ? ms.getBasePrice() : 13.50);
                st.setShowtimeId(ms.getShowtimeId() != null ? ms.getId() : UUID.randomUUID().toString());

                // seats/takenSeats: preserve if provided, otherwise create standard layout
                if (ms.getSeats() != null && !ms.getSeats().isEmpty()) {
                    st.setSeats(new ArrayList<>(ms.getSeats()));
                } else {
                    st.setSeats(create10x10SeatLayout());
                }

                if (ms.getTakenSeats() != null) {
                    st.setTakenSeats(new ArrayList<>(ms.getTakenSeats()));
                } else {
                    st.setTakenSeats(new ArrayList<>());
                }

                // compute seat counts
                int seatsTotal = st.getSeats() != null ? st.getSeats().size() : 0;
                int taken = st.getTakenSeats() != null ? st.getTakenSeats().size() : 0;
                st.setSeatsBooked(taken);
                st.setAvailableSeats(Math.max(0, seatsTotal - taken));

                toSave.add(st);
                // keep existingShowtimes updated so we avoid creating duplicates within same run
                existingShowtimes.add(st);
                System.out.println("Prepared showtime for movie '" + movie.getTitle() + "' at " + time + " on " + date);
            }
        }

        if (!toSave.isEmpty()) {
            try {
                showtimeRepository.saveAll(toSave);
                System.out.println("Saved " + toSave.size() + " showtimes imported from movies.");
            } catch (Exception e) {
                System.err.println("Error saving showtimes: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("No new showtimes were found in movie records.");
        }
    }

    private List<String> create10x10SeatLayout() {
        List<String> seats = new ArrayList<>(100);
        String[] rows = {"A","B","C","D","E","F","G","H","I","J"};
        for (String r : rows) {
            for (int i = 1; i <= 10; i++) seats.add(r + i);
        }
        return seats;
    }
}