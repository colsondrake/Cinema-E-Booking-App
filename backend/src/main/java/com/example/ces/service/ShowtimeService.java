// package com.example.ces.service;

// import com.example.ces.model.Showtime;
// import com.example.ces.repository.ShowtimeRepository;

// import org.springframework.stereotype.Service;

// import java.time.LocalDate;
// import java.util.List;

// @Service
// public class ShowtimeService {

//     private final ShowtimeRepository showtimeRepository;

//     public ShowtimeService(ShowtimeRepository showtimeRepository) {
//         this.showtimeRepository = showtimeRepository;
//     }

//     // ============================
//     // 1. Schedule a new showtime
//     // ============================
//     public Showtime scheduleShowtime(String movieId, String showroomId, LocalDate date, String time) {

//         // prevent conflicts (Sprint 3 requirement)
//         boolean conflict = showtimeRepository.existsByShowroomIdAndDateAndTime(showroomId, date, time);

//         if (conflict) {
//             throw new IllegalStateException("A movie is already scheduled in this showroom at the given date & time.");
//         }

//         Showtime showtime = new Showtime();
//         showtime.setMovieId(movieId);
//         showtime.setShowroomId(showroomId);
//         showtime.setDate(date);
//         showtime.setTime(time);

//         // You may initialize availableSeats, seats list, etc. here if needed
//         if (showtime.getSeats() != null) {
//             showtime.setAvailableSeats(showtime.getSeats().size());
//         }

//         return showtimeRepository.save(showtime);
//     }

//     // ============================
//     // 2. Fetch showtimes for a movie
//     // ============================
//     public List<Showtime> getShowtimesForMovie(String movieId) {
//         return showtimeRepository.findByMovieId(movieId);
//     }

//     // ============================
//     // 3. Get taken seats (frontend use)
//     // ============================
//     public List<String> getTakenSeats(String showtimeId) {
//         Showtime showtime = showtimeRepository.findById(showtimeId)
//                 .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));
//         return showtime.getTakenSeats();
//     }

//     // ============================
//     // 4. Reserve seats (seat selection)
//     // ============================
//     public synchronized void reserveSeats(String showtimeId, List<String> seatsToReserve) {
//         Showtime showtime = showtimeRepository.findById(showtimeId)
//                 .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

//         // check if any seat is already taken
//         for (String seat : seatsToReserve) {
//             if (showtime.getTakenSeats().contains(seat)) {
//                 throw new IllegalStateException("Seat " + seat + " is already taken.");
//             }
//         }

//         // update taken seats
//         showtime.getTakenSeats().addAll(seatsToReserve);

//         // save back to DB
//         showtimeRepository.save(showtime);
//     }
// }

package com.example.ces.service;

import com.example.ces.model.Showtime;
import com.example.ces.repository.ShowtimeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Service layer for managing showtimes:
 *  - Schedule showtimes (admin)
 *  - Fetch showtimes for a movie (user)
 *  - Get a single showtime
 *  - Seat reservation logic used by SeatController & BookingController
 */
@Service
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;

    public ShowtimeService(ShowtimeRepository showtimeRepository) {
        this.showtimeRepository = showtimeRepository;
    }

    // ============================
    // 0. Get a single showtime by id
    //    Used by user-facing APIs (booking & details)
    // ============================
    public Showtime getShowtimeById(String showtimeId) {
        return showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));
    }

    // ============================
    // 1. Schedule a new showtime (admin)
    // ============================
    public Showtime scheduleShowtime(String movieId, String showroomId, LocalDate date, String time) {

        // prevent conflicts (Sprint 3 requirement)
        boolean conflict = showtimeRepository.existsByShowroomIdAndDateAndTime(showroomId, date, time);

        if (conflict) {
            throw new IllegalStateException(
                    "A movie is already scheduled in this showroom at the given date & time.");
        }

        Showtime showtime = new Showtime();
        showtime.setMovieId(movieId);
        showtime.setShowroomId(showroomId);
        showtime.setDate(date);
        showtime.setTime(time);

        // Initialize availableSeats if seats list is configured
        if (showtime.getSeats() != null) {
            showtime.setAvailableSeats(showtime.getSeats().size());
        }

        return showtimeRepository.save(showtime);
    }

    // ============================
    // 2. Fetch showtimes for a movie (shared: admin + user)
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
    //    Used by SeatController and BookingController
    // ============================
    public synchronized void reserveSeats(String showtimeId, List<String> seatsToReserve) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

        if (seatsToReserve == null || seatsToReserve.isEmpty()) {
            throw new IllegalArgumentException("No seats provided to reserve.");
        }

        // Ensure takenSeats list is initialized
        if (showtime.getTakenSeats() == null) {
            showtime.setTakenSeats(List.of());
        }

        // Check if any seat is already taken
        for (String seat : seatsToReserve) {
            if (showtime.getTakenSeats().contains(seat)) {
                throw new IllegalStateException("Seat " + seat + " is already taken.");
            }
        }

        // Update taken seats
        showtime.getTakenSeats().addAll(seatsToReserve);

        // Save back to DB
        showtimeRepository.save(showtime);
    }
}
