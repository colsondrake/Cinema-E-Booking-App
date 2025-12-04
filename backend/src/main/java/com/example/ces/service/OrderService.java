package com.example.ces.service;

import com.example.ces.model.Order;
import com.example.ces.model.Showtime;
import com.example.ces.repository.OrderRepository;
import com.example.ces.repository.ShowtimeRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ShowtimeRepository showtimeRepository;

    public OrderService(OrderRepository orderRepository,
            ShowtimeRepository showtimeRepository) {
        this.orderRepository = orderRepository;
        this.showtimeRepository = showtimeRepository;
    }

    // Create new order
    public Order createOrder(Order order) {

        // Validate showtime exists
        Showtime showtime = showtimeRepository.findById(order.getShowtimeId())
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found"));

        // Reserve seats (reuse your existing logic)
        showtime.getTakenSeats().addAll(order.getSeats());
        showtime.setAvailableSeats(showtime.getSeats().size() - showtime.getTakenSeats().size());
        showtimeRepository.save(showtime);

        return orderRepository.save(order);
    }

    // Retrieve order history for a user
    public List<Order> getOrdersForUser(String userId) {
        return orderRepository.findByUserId(userId);
    }
}
