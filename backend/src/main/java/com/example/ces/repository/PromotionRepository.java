package com.example.ces.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import com.example.ces.model.Promotion;

@Repository
public interface PromotionRepository extends MongoRepository<Promotion, String> {

    // Optional: prevent duplicate promo codes
    boolean existsByPromotionCode(String promotionCode);

    Optional<Promotion> findByPromotionCodeIgnoreCase(String promotionCode);

}
