package com.example.ces.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.ces.model.Showroom;

@Repository
public interface ShowroomRepository extends MongoRepository<Showroom, String> {

}
