package com.example.ces;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class CesCinemaApplication {
    public static void main(String[] args) {
        SpringApplication.run(CesCinemaApplication.class, args);
    }
}