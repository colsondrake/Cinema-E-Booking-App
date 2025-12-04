package com.example.ces.repository;

import com.example.ces.model.Booking;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUser_Id(String userId);
    Optional<Booking> findById(String bookingId);
    List<Booking> findByShowtime_Id(String showtimeId);
}