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
 * - paymentCard: (optional) payment card details for this booking
 * - promotionCode: (optional) promotion code to apply
 */
public class BookingRequestDTO {

    @NotBlank(message = "showtimeId is required")
    private String showtimeId;

    @NotNull(message = "tickets list is required")
    @Size(min = 1, message = "At least one ticket must be provided")
    private List<TicketSelectionDTO> tickets;

    @NotBlank(message = "userId is required")
    private String userId;

    // Add paymentCard and promotionCode fields
    private PaymentCardDTO paymentCard;
    private String promotionCode;

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

    public PaymentCardDTO getPaymentCard() {
        return paymentCard;
    }

    public void setPaymentCard(PaymentCardDTO paymentCard) {
        this.paymentCard = paymentCard;
    }

    public String getPromotionCode() {
        return promotionCode;
    }

    public void setPromotionCode(String promotionCode) {
        this.promotionCode = promotionCode;
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

    // Add a PaymentCardDTO inner class or import if already defined elsewhere
    public static class PaymentCardDTO {
        private String cardNumber;
        private String cardType;
        private String expiryDate;
        private String billingAddress;
        private String cardholderName;
        private String userId;

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getCardNumber() {
            return cardNumber;
        }

        public void setCardNumber(String cardNumber) {
            this.cardNumber = cardNumber;
        }

        public String getCardType() {
            return cardType;
        }

        public void setCardType(String cardType) {
            this.cardType = cardType;
        }

        public String getExpiryDate() {
            return expiryDate;
        }

        public void setExpiryDate(String expiryDate) {
            this.expiryDate = expiryDate;
        }

        public String getBillingAddress() {
            return billingAddress;
        }

        public void setBillingAddress(String billingAddress) {
            this.billingAddress = billingAddress;
        }

        public String getCardholderName() {
            return cardholderName;
        }

        public void setCardholderName(String cardholderName) {
            this.cardholderName = cardholderName;
        }
    }
}