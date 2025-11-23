package com.example.ces.dto;

import com.example.ces.model.TicketType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * DTO sent from the frontend when a user starts a booking.
 * - showtimeId: which showtime they are booking
 * - tickets: list of tickets with seatNumber + age category (ticketType)
 */
public class BookingRequestDTO {

    @NotBlank(message = "showtimeId is required")
    private String showtimeId;

    @NotNull(message = "tickets list is required")
    @Size(min = 1, message = "At least one ticket must be provided")
    private List<TicketSelectionDTO> tickets;

    @NotBlank(message = "userId is required")
    private String userId;
    
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(String showtimeId) {
        this.showtimeId = showtimeId;
    }

    public List<TicketSelectionDTO> getTickets() {
        return tickets;
    }

    public void setTickets(List<TicketSelectionDTO> tickets) {
        this.tickets = tickets;
    }

    /**
     * Inner DTO representing a single ticket in the booking:
     * - seatNumber (e.g., "A1")
     * - ticketType (ADULT / SENIOR / CHILD)
     */
    public static class TicketSelectionDTO {

        @NotBlank(message = "seatNumber is required")
        private String seatNumber;

        @NotNull(message = "ticketType is required")
        private TicketType ticketType;

        public String getSeatNumber() {
            return seatNumber;
        }

        public void setSeatNumber(String seatNumber) {
            this.seatNumber = seatNumber;
        }

        public TicketType getTicketType() {
            return ticketType;
        }

        public void setTicketType(TicketType ticketType) {
            this.ticketType = ticketType;
        }
    }
}
