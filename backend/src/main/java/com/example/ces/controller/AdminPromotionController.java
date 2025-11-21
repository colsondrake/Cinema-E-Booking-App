package com.example.ces.controller;

import com.example.ces.model.Promotion;
import com.example.ces.service.PromotionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/promotions")
@CrossOrigin(origins = "*")
public class AdminPromotionController {

    private final PromotionService promotionService;

    public AdminPromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    // ============================================================
    // 1. Create a new promotion
    // ============================================================
    @PostMapping
    public ResponseEntity<?> createPromotion(@RequestBody Promotion promotion) {
        try {
            Promotion saved = promotionService.createPromotion(promotion);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }
    }

    // ============================================================
    // 2. Get all promotions
    // ============================================================
    @GetMapping
    public ResponseEntity<List<Promotion>> getPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    // ============================================================
    // 3. Send promotion email to subscribed users
    // ============================================================
    @PostMapping("/{promotionId}/send")
    public ResponseEntity<?> sendPromotion(@PathVariable String promotionId) {
        try {
            promotionService.sendPromotionToSubscribers(promotionId);
            return ResponseEntity.ok("Promotion emails sent successfully.");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }
    }
}
