package com.example.ces.model;

import java.util.List;

import org.springframework.data.annotation.Id;

public class Showroom {
    @Id
    private int showroomId;
    private Theatre theatre; // Reference to Theatre 
    private List<Seat> seats; // List of Seats in the Showroom

}
