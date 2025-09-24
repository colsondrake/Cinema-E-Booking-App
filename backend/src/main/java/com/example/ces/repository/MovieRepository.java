package com.example.ces.repository;

import com.example.ces.model.Movie;
<<<<<<< HEAD
=======
import java.util.List;

>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends MongoRepository<Movie, String> {
<<<<<<< HEAD

}
=======
    List<Movie> findByTitleContainingIgnoreCase(String title);

    List<Movie> findByGenresIgnoreCase(String genre);

}
>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
