package com.example.ces.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import com.example.ces.model.Promotion;
import com.example.ces.service.PromotionService;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    // Retrieve promotion by promo code (string)
    @GetMapping("/{code}")
    public ResponseEntity<?> getPromotionByCode(@PathVariable String code) {
        Promotion promo = promotionService.getPromotionByCode(code);
        return ResponseEntity.ok(promo);
    }
}
