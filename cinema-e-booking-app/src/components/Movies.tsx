'use client'

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Movie = {
  id: string;
  title: string;
  director: string;
  year: number;
  genre: string;
  rating: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
  showtimes: string[];
};

const Movies = () => {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");

  // Fetch movies with optional search and genre filters
  useEffect(() => {
    const fetchMovies = async () => {

      setLoading(true);
      setError(null);

      let url = "http://localhost:8080/api/movies";
      if (search && genre) {
        url = `http://localhost:8080/api/movies/search?title=${encodeURIComponent(search)}`;
      } else if (search) {
        url = `http://localhost:8080/api/movies/search?title=${encodeURIComponent(search)}`;
      } else if (genre) {
        url = `http://localhost:8080/api/movies/filter?genre=${encodeURIComponent(genre)}`;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch movies");
        let data = await res.json();
        // If both search and genre, filter genre on frontend
        if (search && genre) {
          data = data.filter((m: Movie) => m.genre.toLowerCase() === genre.toLowerCase());
        }
        setMovies(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [search, genre]);

  if (loading) return <div className="text-center mt-10 text-lg">Loading movies...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

  // Genre options
  const GENRES = [
    "Action", "Drama", "Sci-Fi", "Crime", "Thriller", "Romance", "Animation", "Adventure", "War", "Horror", "Musical", "Comedy", "Mystery", "Western"
  ];

  return (
    <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-[#373572] dark:text-white min-h-screen">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-12 justify-center mb-6 md:mb-12">
          <div className="col-span-12 lg:col-span-6 lg:col-start-4 text-center">
            <p className="mb-2">Welcome To</p>
            <h2 className="text-3xl md:text-[45px] font-bold mb-6">
              CINEMAGIC
            </h2>
          </div>
          <div className="col-span-12 text-center mt-6 flex flex-col items-center gap-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-2xl justify-center items-center">
              <input
                type="text"
                placeholder="Search movies by title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#17233a] dark:border-gray-700 dark:text-white"
                aria-label="Search movies"
              />
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#17233a] dark:border-gray-700 dark:text-white"
                aria-label="Filter by genre"
              >
                <option value="">--Filter by Genre--</option>
                {GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <button
                onClick={() => { setSearch(""); setGenre(""); }}
                className="px-4 py-2 bg-gray-200 dark:bg-[#17233a] text-[#373572] dark:text-white rounded-md border border-gray-300 dark:border-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-12 gap-4 mt-8">
          {movies.length === 0 ? (
            <div className="col-span-12 text-center text-lg text-gray-500 mt-10">No movies found.</div>
          ) : (
            movies.map((movie) => (
              <div className="col-span-6 md:col-span-3 xl:col-span-1 flex justify-center" key={movie.id}>
                <div
                  className="w-full max-w-[260px] h-[420px] flex flex-col justify-between rounded-xl overflow-hidden border border-white dark:border-[#17233a] p-1 cursor-pointer bg-white dark:bg-[#17233a] shadow transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      sessionStorage.setItem("selectedMovieId", movie.id);
                    }
                    router.push(`/movie-details/${movie.id}`);
                  }}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem("selectedMovieId", movie.id);
                      }
                      router.push(`/movie-details/${movie.id}`);
                    }
                  }}
                  role="button"
                  aria-label={`View details for ${movie.title}`}
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-[160px] object-cover rounded-xl mx-auto"
                  />
                  <div className="mt-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h5 className="text-xl font-medium mb-1 text-center">
                        {movie.title} <span className="text-sm text-gray-400">({movie.year})</span>
                      </h5>
                      <p className="mb-0 text-sm text-gray-500 dark:text-gray-300 text-center">
                        {movie.genre}
                      </p>
                      <div className="mt-2 text-center">
                        <span className="font-semibold text-sm text-blue-600 dark:text-blue-300">Rating:</span>
                        <span className="ml-1 text-sm text-yellow-500 dark:text-yellow-400">{movie.rating}</span>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="font-semibold text-sm text-blue-600 dark:text-blue-300">Director:</span>
                        <span className="ml-1 text-sm text-gray-700 dark:text-gray-200">{movie.director}</span>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="font-semibold text-sm text-blue-600 dark:text-blue-300">Description:</span>
                        <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 line-clamp-3">{movie.description}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="font-semibold text-sm text-blue-600 dark:text-blue-300">Showtimes:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {movie.showtimes && movie.showtimes.length > 0 ? (
                          movie.showtimes.map((showtime: string, idx: number) => (
                            <button
                              key={idx}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs"
                              disabled={showtime === "Coming Soon"}
                            >
                              {showtime}
                            </button>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No showtimes available</span>
                        )}
                      </div>
                    </div>
                    {movie.trailerUrl && (
                      <div className="mt-2 text-center">
                        <a
                          href={movie.trailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 font-bold hover:underline"
                        >
                          ▶ Watch Trailer
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Movies;