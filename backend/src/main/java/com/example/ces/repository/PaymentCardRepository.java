package com.example.ces.repository;

import com.example.ces.model.PaymentCard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentCardRepository extends MongoRepository<PaymentCard, String> {
    List<PaymentCard> findByUserId(String userId);
    long countByUserId(String userId);
    void deleteByUserId(String userId);
}
