
'use client'

// Movies.tsx
// Main movie listing component for Cinemagic app.
// Handles fetching, searching, filtering, and displaying movies in 'Currently Running' and 'Coming Soon' sections.


import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


// Movie type definition for type safety and clarity
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


/**
 * Movies component
 * Handles fetching, searching, filtering, and displaying movies.
 */
const Movies = () => {
  // Next.js router for navigation
  const router = useRouter();

  // State variables
  const [movies, setMovies] = useState<Movie[]>([]); // All movies fetched from backend
  const [loading, setLoading] = useState(true);      // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [searchInput, setSearchInput] = useState("");     // Controlled input for search box
  const [search, setSearch] = useState("");              // Search query to trigger fetch
  const [genre, setGenre] = useState("");                // Selected genre filter


  /**
   * Fetch movies from backend API, with optional search and genre filters.
   * Triggers on changes to 'search' or 'genre'.
   */
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      // Build API URL based on search and genre
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


  // Loading and error states
  if (loading) return <div className="text-center mt-10 text-lg">Loading movies...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;


  // List of available genres for filtering
  const GENRES = [
    "Action", "Drama", "Sci-Fi", "Crime", "Thriller", "Romance", "Animation", "Adventure", "War", "Horror", "Musical", "Comedy", "Mystery", "Western"
  ];



  /**
   * Split movies into 'Currently Running' and 'Coming Soon'.
   * - Currently Running: movies with at least one showtime
   * - Coming Soon: movies with no showtimes
   */
  const currentlyRunning = movies.filter(
    (movie) => Array.isArray(movie.showtimes) && movie.showtimes.length > 0
  );
  const comingSoon = movies.filter(
    (movie) => !Array.isArray(movie.showtimes) || movie.showtimes.length === 0
  );


  /**
   * MovieCard component
   * Displays a single movie's details in a styled card.
   * Handles navigation to movie details on click/keyboard.
   */
  const MovieCard: React.FC<{ movie: Movie; router: ReturnType<typeof useRouter> }> = ({ movie, router }) => (
    <div className="flex justify-center" key={movie.id}>
      <div
        className="w-[260px] h-[530px] flex flex-col justify-between rounded-xl overflow-hidden border border-[#17233a] p-1 cursor-pointer bg-[#17233a] shadow transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl pb-2"
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
        {/* Movie Poster */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-[375px] object-cover rounded-xl mx-auto"
        />
        <div className="mt-4 flex-1 flex flex-col">
          <div>
            {/* Movie Title and Year */}
            <h5 className="text-xl font-medium mb-1 text-center">
              {movie.title}
            </h5>
            {/* Rating */}
            <div className="mt-2 text-center">
              <span className="font-semibold text-sm text-blue-600 dark:text-blue-300">Rating:</span>
              <span className="ml-1 text-sm text-yellow-500 dark:text-yellow-400">{movie.rating}</span>
            </div>
          </div>
          {/* Showtimes */}
          <div className="mt-2 text-center">
            <span className="font-semibold text-sm text-blue-600 dark:text-blue-300">Showtimes:</span>
            <div className="flex flex-wrap gap-2 mt-1 justify-center">
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
        </div>
      </div>
    </div>
  );


  // Main render
  return (
    <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-[#373572] dark:text-white min-h-screen">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-12 justify-center mb-6 md:mb-12">
          {/* Heading Section */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-4 text-center">
            <p className="mb-2">Welcome To</p>
            <h2 className="text-3xl md:text-[45px] font-bold mb-6">
              CINEMAGIC
            </h2>
          </div>
          <div className="col-span-12 text-center mt-6 flex flex-col items-center gap-4">
            {/* Functionalities Bar: Search, Genre Filter, Reset */}
            <div className="flex flex-col md:flex-row gap-2 w-full max-w-2xl justify-center items-center">
              {/* Search Box */}
              <input
                type="text"
                placeholder="Search movies by title..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#17233a] dark:border-gray-700 dark:text-white"
                aria-label="Search movies"
              />
              {/* Search Button */}
              <button
                onClick={() => {
                  setSearch(searchInput); 
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-[#17233a] text-[#373572] dark:text-white rounded-md border border-gray-300 dark:border-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Search
              </button>
              {/* Genre Selection Dropdown */}
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
              {/* Reset Button */}
              <button
                onClick={() => { setSearch(""); setGenre(""); }}
                className="px-4 py-2 bg-gray-200 dark:bg-[#17233a] text-[#373572] dark:text-white rounded-md border border-gray-300 dark:border-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Currently Running Section */}
        <div className="mt-8">
          <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-center">Currently Running</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {currentlyRunning.length === 0 ? (
              <div className="col-span-full text-center text-lg text-gray-500 mt-10">No currently running movies found.</div>
            ) : (
              currentlyRunning.map((movie) => (
                <MovieCard key={movie.id} movie={movie} router={router} />
              ))
            )}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16">
          <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-center">Coming Soon</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {comingSoon.length === 0 ? (
              <div className="col-span-full text-center text-lg text-gray-500 mt-10">No coming soon movies found.</div>
            ) : (
              comingSoon.map((movie) => (
                <MovieCard key={movie.id} movie={movie} router={router} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Movies;