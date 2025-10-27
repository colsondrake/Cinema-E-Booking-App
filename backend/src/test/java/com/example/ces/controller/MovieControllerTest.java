package com.example.ces.controller;

import com.example.ces.model.Movie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@WebMvcTest(MovieController.class)
public class MovieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.example.ces.service.MovieService movieService;

    @Test
    public void testGetAllMovies() throws Exception {
        Movie movie1 = new Movie(
                "1",
                "The Matrix",
                "Lana Wachowski, Lilly Wachowski",
                1999,
                List.of("Action"), // FIXED: genre must be a List
                "R",
                "A computer hacker learns about reality.",
                "poster_url_here",
                "trailer_url_here",
                Arrays.asList("2:00 PM", "5:00 PM", "8:00 PM"),
                "Coming Soon"
        );

        Movie movie2 = new Movie(
                "2",
                "Inception",
                "Christopher Nolan",
                2010,
                List.of("Sci-Fi"), // FIXED: genre must be a List
                "PG-13",
                "A thief steals corporate secrets through dream-sharing technology.",
                "poster_url_here",
                "trailer_url_here",
                Arrays.asList("1:00 PM", "4:00 PM", "7:00 PM"),
                "Currently Runninig"
        );

        when(movieService.getAllMovies()).thenReturn(Arrays.asList(movie1, movie2));

        mockMvc.perform(get("/api/movies"))
                .andExpect(status().isOk())
                .andExpect(content().json(
                        "[{" +
                                "'id':'1','title':'The Matrix','director':'Lana Wachowski, Lilly Wachowski','year':1999,'genres':['Action'],'rating':'R','description':'A computer hacker learns about reality.','posterUrl':'poster_url_here','trailerUrl':'trailer_url_here','showtimes':['2:00 PM','5:00 PM','8:00 PM']" +
                                "},{" +
                                "'id':'2','title':'Inception','director':'Christopher Nolan','year':2010,'genres':['Sci-Fi'],'rating':'PG-13','description':'A thief steals corporate secrets through dream-sharing technology.','posterUrl':'poster_url_here','trailerUrl':'trailer_url_here','showtimes':['1:00 PM','4:00 PM','7:00 PM']" +
                                "}]"));
    }
}
