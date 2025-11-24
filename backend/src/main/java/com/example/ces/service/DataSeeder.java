package com.example.ces.bootstrap;

import com.example.ces.model.Showroom;
import com.example.ces.repository.ShowroomRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ShowroomRepository showroomRepository;

    public DataSeeder(ShowroomRepository showroomRepository) {
        this.showroomRepository = showroomRepository;
    }

    @Override
    public void run(String... args) {
        if (showroomRepository.count() == 0) {

            showroomRepository.save(new Showroom("1", "Showroom 1", 100));
            showroomRepository.save(new Showroom("2", "Showroom 2", 80));
            showroomRepository.save(new Showroom("3", "Showroom 3", 60));

            System.out.println("🌱 Seeded 3 showrooms.");
        } else {
            System.out.println("Showrooms already exist — skipping seeding.");
        }
    }
}
