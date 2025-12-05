
'use client'

// Movies.tsx
// Main movie listing component for Cinemagic app.
// Handles fetching, searching, filtering, and displaying movies in 'Currently Running' and 'Coming Soon' sections.


import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Movie, useMovie } from "@/context/MovieContext";
import { useCheckout } from "@/context/CheckoutContext";

/**
 * Movies component
 * Handles fetching, searching, filtering, and displaying movies.
 */
const Movies = () => {
  // Next.js router for navigation
  const router = useRouter();
  const { setMovie, setShowtime } = useMovie();
  const { setCheckout } = useCheckout();

  // State variables
  const [movies, setMovies] = useState<Movie[]>([]); // All movies fetched from backend
  // const [loading, setLoading] = useState(true);      // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [searchInput, setSearchInput] = useState("");     // Controlled input for search box
  const [search, setSearch] = useState("");              // Search query to trigger fetch
  // const [genre, setGenre] = useState("");                // Selected genre filter
  const [genres, setGenres] = useState<string[]>([]);


  useEffect(() => {
    // Reset movie, showtime, and checkout data
    setMovie(null);
    setShowtime(null);
    setCheckout({
      name: null,
      email: null,
      card: null,
      showtimeId: null,
      userId: null,
      tickets: [],
      seats: [],
    });
  }, []);
  /**
   * Fetch movies from backend API, with optional search and genre filters.
   * Triggers on changes to 'search' or 'genres'.
   */
  useEffect(() => {
    const fetchMovies = async () => {
      // setLoading(true);
      setError(null);

      // Build API URL based on search
      let url = "http://localhost:8080/api/movies";
      if (search) {
        url = `http://localhost:8080/api/movies/search?title=${encodeURIComponent(search)}`;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch movies");
        let data = await res.json();
        // Apply all current filters within 'genres'
        if (Array.isArray(genres) && genres.length > 0) {
          data = data.filter((m: Movie) =>
            Array.isArray(m.genres) &&
            genres.some((filterGenre: string) =>
              m.genres.some((g: string) =>
                g.toLowerCase() === filterGenre.toLowerCase()
              )
            )
          );
        }
        setMovies(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        // setLoading(false);
      }
    };
    fetchMovies();
  }, [search, genres]);

  // Loading and error states
  // if (loading) return <div className="text-center mt-10 text-lg">Loading movies...</div>;
  // if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

  // List of available genres for filtering
  const GENRES = [
    "Action", 
    "Drama", 
    "SciFi", 
    "Crime", 
    "Thriller", 
    "Romance", 
    "Animation", 
    "Adventure", 
    "War", 
    "Horror", 
    "Musical", 
    "Comedy", 
    "Mystery", 
    "Western",
  ];

  /**
   * Split movies into 'Currently Running' and 'Coming Soon'.
   * - Currently Running: movies with at least one showtime
   * - Coming Soon: movies with no showtimes
   */
  const currentlyRunning = movies.filter(
    (movie) => movie.status == "Currently Running"
  );
  const comingSoon = movies.filter(
    (movie) => movie.status == "Coming Soon"
  );


  /**
   * MovieCard component
   * Displays a single movie's details in a styled card.
   * Handles navigation to movie details on click/keyboard.
   */
  const MovieCard: React.FC<{ movie: Movie; router: ReturnType<typeof useRouter> }> = ({ movie, router }) => (
    <div className="flex justify-center" key={movie.id}>
      <div
        className="w-[260px] flex flex-col justify-between rounded-xl overflow-hidden border border-[#17233a] p-1 cursor-pointer bg-[#17233a] shadow transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl pb-2"
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
              <span className="font-semibold text-sm text-blue-300">Rating:</span>
              <span className="ml-1 text-sm text-yellow-400">{movie.rating}</span>
            </div>
          </div>
          {/* Showtimes */}
          {movie.status == "Currently Running" && (
            <div className="mt-2 text-center">
              <span className="font-semibold text-sm text-blue-300">Showtimes:</span>
              <div className="flex flex-wrap gap-2 mt-1 justify-center">
                {movie.showtimes && movie.showtimes.length > 0 ? (
                  movie.showtimes.map((showtime, idx: number) => {
                    // showtime may be a string (legacy) or an object from backend
                    const display = typeof showtime === 'string'
                      ? showtime
                      : (showtime.time ?? showtime.date ?? JSON.stringify(showtime));
                    return (
                      <button
                        key={idx}
                        className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs"
                        disabled={display === "Coming Soon"}
                      >
                        {display}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-gray-400">No showtimes available</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );


  // Main render
  return (
    // Full component
    <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">

      {/* Container for all component parts */}
      <div className="container px-4 mx-auto">

        <div className="grid grid-cols-12 justify-center mb-6 md:mb-12">

          {/* Heading Section */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-4 text-center">
            <p className="mb-2">Welcome To</p>
            <h2 className="text-3xl md:text-[45px] font-bold mb-6">
              CINEMAGIC
            </h2>
          </div>

          {/* Functionalities Bar 1: Search, Reset */}
          <div className="col-span-12 text-center mt-6 flex flex-col items-center gap-4">
            <div className="flex flex-row gap-2 w-full max-w-2xl justify-center items-center">

              {/* Search Box */}
              <input
                type="text"
                placeholder="Search movies by title..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#17233a] border-gray-700 text-white"
                aria-label="Search movies"
              />

              {/* Search Button */}
              <button
                onClick={() => {
                  setSearch(searchInput); 
                }}
                className="px-4 py-2 bg-[#17233a] text-white rounded-md border border-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Search
              </button>

              {/* Reset Button */}
              <button
                onClick={() => { setSearch(""); setGenres([]); }}
                className="px-4 py-2 bg-[#17233a] text-white rounded-md border border-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Functionalities Bar 2: Genre Filter Selection Buttons */}
            <div className="flex flex-row gap-2 w-full max-w-2xl justify-center items-center">
              {GENRES.map((g: string, index: number) => {
                const isSelected = genres.includes(g);
                return (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-md border transition-colors duration-200 cursor-pointer 
                      ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-[#17233a] text-white border-gray-700 hover:bg-blue-600 hover:text-white'}`}
                    onClick={() => {
                      setGenres((prev: string[]) =>
                        prev.includes(g)
                          ? prev.filter((genre: string) => genre !== g)
                          : [...prev, g]
                      );
                    }}
                    aria-pressed={isSelected}
                  >
                    {g}
                  </button>
                );
              })}
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