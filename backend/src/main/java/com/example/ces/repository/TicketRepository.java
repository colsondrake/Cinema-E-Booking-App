package com.example.ces.repository;

import com.example.ces.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    
    // Find tickets by booking ID
    List<Ticket> findByBookingId(int bookingId);
    
    // Find tickets by showtime ID
    List<Ticket> findByShowtimeId(int showtimeId);
    
    // Find tickets by showtime and seat number (to check seat availability)
    List<Ticket> findByShowtimeIdAndSeat_SeatNumber(int showtimeId, String seatNumber);
    
    // Find tickets by ticket type
    List<Ticket> findByType(String type);
    
    // Count tickets for a specific showtime (for capacity management)
    long countByShowtimeId(int showtimeId);
}