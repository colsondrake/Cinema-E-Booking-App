package com.example.ces.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.ces.model.Showtime;

@Repository
public interface ShowtimeRepository extends MongoRepository<Showtime, String> {

    // Required for conflict prevention
    boolean existsByShowroomIdAndDateAndTime(String showroomId, LocalDate date, String time);

    // Required for fetching showtimes by movie
    List<Showtime> findByMovieId(String movieId);
}
