package com.example.ces.service;

import com.example.ces.model.Showtime;
import com.example.ces.repository.ShowtimeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
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
            throw new IllegalArgumentException("Showtime conflict: Another showtime is already scheduled in this showroom at the specified date and time.");
        }

        Showtime showtime = new Showtime();
        showtime.setMovieId(movieId);
        showtime.setShowroomId(showroomId);
        showtime.setDate(date);
        showtime.setTime(time);

        // Initialize default seats as List<String> if not already set
        if (showtime.getSeats() == null || showtime.getSeats().isEmpty()) {
            List<String> defaultSeats = createDefaultSeats();
            showtime.setSeats(defaultSeats);
        }

        // Initialize takenSeats as empty list
        if (showtime.getTakenSeats() == null) {
            showtime.setTakenSeats(new ArrayList<>());
        }

        // Set available seats count
        showtime.setAvailableSeats(showtime.getSeats().size() - showtime.getTakenSeats().size());

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
        
        // Ensure takenSeats is not null
        if (showtime.getTakenSeats() == null) {
            showtime.setTakenSeats(new ArrayList<>());
            showtimeRepository.save(showtime);
        }
        
        return showtime.getTakenSeats();
    }

    // ============================
    // 4. Get available seats (frontend use)
    // ============================
    public List<String> getAvailableSeats(String showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));
        
        // Ensure seats and takenSeats are initialized
        if (showtime.getSeats() == null) {
            showtime.setSeats(createDefaultSeats());
        }
        if (showtime.getTakenSeats() == null) {
            showtime.setTakenSeats(new ArrayList<>());
        }
        
        // Filter out taken seats from all seats
        return showtime.getSeats().stream()
                .filter(seatNumber -> !showtime.getTakenSeats().contains(seatNumber))
                .toList();
    }

    // ============================
    // 5. Reserve seats (seat selection)
    //    Used by SeatController and BookingController
    // ============================
    public synchronized void reserveSeats(String showtimeId, List<String> seatsToReserve) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

        if (seatsToReserve == null || seatsToReserve.isEmpty()) {
            throw new IllegalArgumentException("No seats provided to reserve.");
        }

        // Ensure seats and takenSeats lists are initialized
        if (showtime.getSeats() == null) {
            showtime.setSeats(createDefaultSeats());
        }
        if (showtime.getTakenSeats() == null) {
            showtime.setTakenSeats(new ArrayList<>());
        }

        // Validate that all seats exist in the showtime
        for (String seat : seatsToReserve) {
            if (!showtime.getSeats().contains(seat)) {
                throw new IllegalArgumentException("Seat " + seat + " does not exist for this showtime.");
            }
        }

        // Check if any seat is already taken
        for (String seat : seatsToReserve) {
            if (showtime.getTakenSeats().contains(seat)) {
                throw new IllegalStateException("Seat " + seat + " is already taken.");
            }
        }

        // Update taken seats (make sure we have a mutable list)
        List<String> takenSeats = new ArrayList<>(showtime.getTakenSeats());
        takenSeats.addAll(seatsToReserve);
        showtime.setTakenSeats(takenSeats);

        // Update available seats count
        showtime.setAvailableSeats(showtime.getSeats().size() - showtime.getTakenSeats().size());

        // Save back to DB
        showtimeRepository.save(showtime);
    }

    // ============================
    // 6. Release seats (for cancelled bookings)
    // ============================
    public synchronized void releaseSeats(String showtimeId, List<String> seatsToRelease) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

        if (seatsToRelease == null || seatsToRelease.isEmpty()) {
            return; // Nothing to release
        }

        // Ensure takenSeats list is initialized
        if (showtime.getTakenSeats() == null) {
            showtime.setTakenSeats(new ArrayList<>());
        }

        // Remove seats from taken seats (make sure we have a mutable list)
        List<String> takenSeats = new ArrayList<>(showtime.getTakenSeats());
        takenSeats.removeAll(seatsToRelease);
        showtime.setTakenSeats(takenSeats);

        // Update available seats count
        if (showtime.getSeats() != null) {
            showtime.setAvailableSeats(showtime.getSeats().size() - showtime.getTakenSeats().size());
        }

        // Save back to DB
        showtimeRepository.save(showtime);
    }

    // ============================
    // 7. Check if seats are available
    // ============================
    public boolean areSeatsAvailable(String showtimeId, List<String> seatsToCheck) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

        if (seatsToCheck == null || seatsToCheck.isEmpty()) {
            return false;
        }

        // Ensure lists are initialized
        if (showtime.getSeats() == null) {
            return false;
        }
        if (showtime.getTakenSeats() == null) {
            showtime.setTakenSeats(new ArrayList<>());
        }

        // Check if all seats exist and are not taken
        for (String seat : seatsToCheck) {
            if (!showtime.getSeats().contains(seat) || showtime.getTakenSeats().contains(seat)) {
                return false;
            }
        }

        return true;
    }

    // ============================
    // 8. Get seat statistics
    // ============================
    public SeatStatistics getSeatStatistics(String showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

        // Ensure lists are initialized
        if (showtime.getSeats() == null) {
            showtime.setSeats(createDefaultSeats());
        }
        if (showtime.getTakenSeats() == null) {
            showtime.setTakenSeats(new ArrayList<>());
        }

        int totalSeats = showtime.getSeats().size();
        int takenSeats = showtime.getTakenSeats().size();
        int availableSeats = totalSeats - takenSeats;

        return new SeatStatistics(totalSeats, takenSeats, availableSeats);
    }

    // ============================
    // Helper methods
    // ============================
    private List<String> createDefaultSeats() {
    // Create a 10x10 seat layout (A-J rows, 1-10 seats per row)
    List<String> seats = new ArrayList<>();
    for (char row = 'A'; row <= 'J'; row++) {
        for (int seatNum = 1; seatNum <= 10; seatNum++) {
            seats.add(row + String.valueOf(seatNum));
        }
    }
    return seats;
}

    // Inner class for seat statistics
    public static class SeatStatistics {
        private final int totalSeats;
        private final int takenSeats;
        private final int availableSeats;

        public SeatStatistics(int totalSeats, int takenSeats, int availableSeats) {
            this.totalSeats = totalSeats;
            this.takenSeats = takenSeats;
            this.availableSeats = availableSeats;
        }

        public int getTotalSeats() { return totalSeats; }
        public int getTakenSeats() { return takenSeats; }
        public int getAvailableSeats() { return availableSeats; }

        @Override
        public String toString() {
            return String.format("SeatStatistics{total=%d, taken=%d, available=%d}", 
                               totalSeats, takenSeats, availableSeats);
        }
    }
}