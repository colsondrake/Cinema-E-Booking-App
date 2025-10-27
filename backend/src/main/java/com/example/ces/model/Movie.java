package com.example.ces.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "movies")
public class Movie {
    // Define data members
    @Id
    private String id;
    private String title;
    private String director;
    private int year;
    private List<String> genres;
    private String rating;
    private String description;
    private String posterUrl;
    private String trailerUrl;
    private List<Showtime> showtimes; // Change this to an array of showtimes
    private MovieStatus status;

    // Default constructor
    public Movie() {
    }

    // Convenience constructor
    public Movie(String id, String title, String director, int year,
            List<String> genres,
            String rating, String description, String posterUrl,
            String trailerUrl, List<Showtime> showtimes, MovieStatus status) {
        setId(id);
        setTitle(title);
        setDirector(director);
        setYear(year);
        setGenres(genres);
        setRating(rating);
        setDescription(description);
        setPosterUrl(posterUrl);
        setTrailerUrl(trailerUrl);
        setShowtimes(showtimes);
        setStatus(status);
    }

    // Getters and setters
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

    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
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

    public List<Showtime> getShowtimes() {
        return showtimes;
    }

    public void setShowtimes(List<Showtime> showtimes) {
        this.showtimes = showtimes;
    }

    public MovieStatus getStatus() {
        return status;
    }

    public void setStatus(MovieStatus status) {
        this.status = status;
    }

    // Convenience setter that accepts a String and maps it to the enum
    public void setStatus(String status) {
        if (status == null) {
            this.status = null;
            return;
        }
        try {
            this.status = MovieStatus.valueOf(status.trim().toUpperCase().replaceAll("\\s+", "_"));
        } catch (IllegalArgumentException e) {
            this.status = null;
        }
    }
    
}
