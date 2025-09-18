package com.example.ces.service;

import com.example.ces.model.Movie;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

@Component
public class MovieLoader {

    public List<Movie> loadMovies() {
        try {
            InputStream is = getClass().getResourceAsStream("/data.json");
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(is, new TypeReference<List<Movie>>() {
            });
        } catch (Exception e) {
            e.printStackTrace();
            return Arrays.asList();
        }
    }
}
