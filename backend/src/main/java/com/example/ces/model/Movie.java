package com.example.ces.model;

<<<<<<< HEAD
import java.util.List;

public class Movie {
=======
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "movies")
public class Movie {

    @Id
>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
    private String id;
    private String title;
    private String director;
    private int year;
<<<<<<< HEAD
    private String genre;
=======
    private List<String> genres; // plural
>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
    private String rating;
    private String description;
    private String posterUrl;
    private String trailerUrl;
    private List<String> showtimes;

    public Movie() {
    }

<<<<<<< HEAD
    public Movie(String id, String title, String director, int year, String genre,
            String rating, String description, String posterUrl, String trailerUrl, List<String> showtimes) {
=======
    public Movie(String id, String title, String director, int year,
            List<String> genres,
            String rating, String description, String posterUrl,
            String trailerUrl, List<String> showtimes) {
>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
        this.id = id;
        this.title = title;
        this.director = director;
        this.year = year;
<<<<<<< HEAD
        this.genre = genre;
=======
        this.genres = genres;
>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
        this.rating = rating;
        this.description = description;
        this.posterUrl = posterUrl;
        this.trailerUrl = trailerUrl;
        this.showtimes = showtimes;
    }

<<<<<<< HEAD
    // Getters and setters for all fields
=======
    // Getters and setters
>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDirector() {
        return director;
    }

    public void setDirector(String director) {
        this.director = director;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

<<<<<<< HEAD
    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
=======
    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
>>>>>>> 478bdf1 (Linked to the DB and changed genre to an array)
    }

    public String getRating() {
        return rating;
    }

    public void setRating(String rating) {
        this.rating = rating;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getTrailerUrl() {
        return trailerUrl;
    }

    public void setTrailerUrl(String trailerUrl) {
        this.trailerUrl = trailerUrl;
    }

    public List<String> getShowtimes() {
        return showtimes;
    }

    public void setShowtimes(List<String> showtimes) {
        this.showtimes = showtimes;
    }
}
