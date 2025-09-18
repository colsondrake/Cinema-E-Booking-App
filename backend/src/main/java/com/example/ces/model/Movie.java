package com.example.ces.model;

import java.util.List;

public class Movie {
    private String id;
    private String title;
    private String director;
    private int year;
    private String genre;
    private String rating;
    private String description;
    private String posterUrl;
    private String trailerUrl;
    private List<String> showtimes;

    public Movie() {
    }

    public Movie(String id, String title, String director, int year, String genre,
            String rating, String description, String posterUrl, String trailerUrl, List<String> showtimes) {
        this.id = id;
        this.title = title;
        this.director = director;
        this.year = year;
        this.genre = genre;
        this.rating = rating;
        this.description = description;
        this.posterUrl = posterUrl;
        this.trailerUrl = trailerUrl;
        this.showtimes = showtimes;
    }

    // Getters and setters for all fields
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

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
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
