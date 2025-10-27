package com.example.ces.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "promotions")
public class Promotion {
    // Define fields
    @Id
    private int promotionId;
    private String promotionCode;
    private double discountPercent;
    private LocalDate startDate;
    private LocalDate endDate; 
    private PromotionStatus status;

    // Default constructor
    public Promotion() {}

    // Convenience constructor
    public Promotion(int promotionId, String promotionCode, double discountPercent,
                     LocalDate startDate, LocalDate endDate, PromotionStatus status) {
        this.promotionId = promotionId;
        this.promotionCode = promotionCode;
        this.discountPercent = discountPercent;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    // Convenience constructor accepting String for status
    public Promotion(int promotionId, String promotionCode, double discountPercent,
                     LocalDate startDate, LocalDate endDate, String status) {
        this(promotionId, promotionCode, discountPercent, startDate, endDate, (PromotionStatus) null);
        setStatus(status);
    }

    // Getters and setters
    public int getPromotionId() {
        return promotionId;
    }

    public void setPromotionId(int promotionId) {
        this.promotionId = promotionId;
    }

    public String getPromotionCode() {
        return promotionCode;
    }

    public void setPromotionCode(String promotionCode) {
        this.promotionCode = promotionCode;
    }

    public double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public PromotionStatus getStatus() {
        return status;
    }

    public void setStatus(PromotionStatus status) {
        this.status = status;
    }

    // Convenience setter that accepts a String and maps it to the enum (case-insensitive)
    public void setStatus(String status) {
        if (status == null) {
            this.status = null;
            return;
        }
        String s = status.trim();
        for (PromotionStatus ps : PromotionStatus.values()) {
            if (ps.name().equalsIgnoreCase(s)) {
                this.status = ps;
                return;
            }
        }
        this.status = null; // or set a default like PromotionStatus.Inactive
    }
}