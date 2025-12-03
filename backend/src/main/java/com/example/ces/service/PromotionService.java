package com.example.ces.service;

import com.example.ces.model.Promotion;
import com.example.ces.model.User;
import com.example.ces.repository.PromotionRepository;
import com.example.ces.repository.UserRepository;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    public PromotionService(PromotionRepository promotionRepository,
            UserRepository userRepository,
            JavaMailSender mailSender) {
        this.promotionRepository = promotionRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
    }

    // ============================================================
    // 1. Create Promotion (Admin)
    // ============================================================
    public Promotion createPromotion(Promotion promotion) {

        // Basic validation required by Sprint 3
        if (promotion.getPromotionCode() == null || promotion.getPromotionCode().isBlank()) {
            throw new IllegalArgumentException("Promotion code is required.");
        }

        if (promotionRepository.existsByPromotionCode(promotion.getPromotionCode())) {
            throw new IllegalArgumentException("Promotion code already exists.");
        }

        if (promotion.getDiscountPercent() <= 0 || promotion.getDiscountPercent() > 100) {
            throw new IllegalArgumentException("Discount percent must be between 1 and 100.");
        }

        LocalDate start = promotion.getStartDate();
        LocalDate end = promotion.getEndDate();

        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required.");
        }

        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }

        return promotionRepository.save(promotion);
    }

    // ============================================================
    // 2. List all promotions
    // ============================================================
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    // ============================================================
    // 3. Send promotion email (Sprint 3 requirement)
    // ============================================================
    public void sendPromotionToSubscribers(String promotionId) {

        Promotion promo = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found."));

        List<User> subscribers = userRepository.findByIsSubscribedToPromotionsTrue();

        if (subscribers.isEmpty()) {
            throw new IllegalStateException("No subscribed users to send promotion to.");
        }

        for (User user : subscribers) {
            sendEmail(user.getEmail(), promo);
        }
    }

    // ============================================================
    // 4. Update an existing promotion (Admin)
    // ============================================================
    public Promotion updatePromotion(String promotionId, Promotion updatedData) {

        // Fetch existing promo
        Promotion existing = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found."));

        // --- VALIDATION ---

        if (updatedData.getPromotionCode() == null || updatedData.getPromotionCode().isBlank()) {
            throw new IllegalArgumentException("Promotion code is required.");
        }

        // If code changed, make sure it's unique
        if (!existing.getPromotionCode().equals(updatedData.getPromotionCode())
                && promotionRepository.existsByPromotionCode(updatedData.getPromotionCode())) {
            throw new IllegalArgumentException("Promotion code already exists.");
        }

        if (updatedData.getDiscountPercent() <= 0 || updatedData.getDiscountPercent() > 100) {
            throw new IllegalArgumentException("Discount percent must be between 1 and 100.");
        }

        LocalDate start = updatedData.getStartDate();
        LocalDate end = updatedData.getEndDate();

        if (start == null || end == null) {
            throw new IllegalArgumentException("Start and end dates are required.");
        }

        if (end.isBefore(start)) {
            throw new IllegalArgumentException("End date cannot be before start date.");
        }

        // --- UPDATE FIELDS ---
        existing.setPromotionCode(updatedData.getPromotionCode());
        existing.setDiscountPercent(updatedData.getDiscountPercent());
        existing.setStartDate(updatedData.getStartDate());
        existing.setEndDate(updatedData.getEndDate());
        // existing.setStatus(updatedData.getStatus()); // NEW: status supported

        // --- SAVE ---
        return promotionRepository.save(existing);
    }

    // ============================================================
    // Helper to send email
    // ============================================================
    private void sendEmail(String to, Promotion promotion) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("New Promotion: " + promotion.getPromotionCode());
        message.setText(
                "Hello!\n\n" +
                        "We are excited to announce a new promotion:\n\n" +
                        "Promotion Code: " + promotion.getPromotionCode() + "\n" +
                        "Discount: " + promotion.getDiscountPercent() + "% off\n" +
                        "Valid from: " + promotion.getStartDate() + "\n" +
                        "Until: " + promotion.getEndDate() + "\n\n" +
                        "Enjoy the savings!\nYour Cinema Team");

        mailSender.send(message);
    }

    public Promotion getPromotionByCode(String code) {
        return promotionRepository.findByPromotionCodeIgnoreCase(code)
                .orElseThrow(() -> new IllegalArgumentException("Promotion code not found"));
    }

}
