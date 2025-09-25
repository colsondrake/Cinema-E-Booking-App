package com.example.ces.repository;

import com.example.ces.model.Movie;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends MongoRepository<Movie, String> {
    
    List<Movie> findByTitleContainingIgnoreCase(String title);
    List<Movie> findByGenresIgnoreCase(String genre);

}

