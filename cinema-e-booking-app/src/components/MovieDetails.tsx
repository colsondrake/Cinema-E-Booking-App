'use client'


import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMovie, Showtime as ContextShowtime, Movie as ContextMovie } from "@/context/MovieContext";


const MovieDetails = () => {

  const router = useRouter();
  const { movie, setMovie, setShowtime } = useMovie();
  const [loading, setLoading] = useState(true);
  const [showtimes, setShowtimes] = useState<ContextShowtime[]>([]);

  useEffect(() => {
    /**
     * Fetches movie details from the backend API using the selected movie ID from sessionStorage.
     */
    const fetchMovie = async () => {
      if (typeof window !== "undefined") {
        setLoading(true);
        const movieId = sessionStorage.getItem("selectedMovieId");
        if (movieId) {
          try {
            // Fetch movie data from backend
            const res = await fetch(`http://localhost:8080/api/movies/${movieId}`);
            if (res.ok) {
              const data = await res.json();
              setMovie(data as ContextMovie);

              // Fetch showtimes for this movie from the dedicated endpoint
              try {
                const stRes = await fetch(`http://localhost:8080/api/movies/${movieId}/showtimes`);
                if (stRes.ok) {
                  const stData = await stRes.json();
                  // Normalize each showtime to ensure `showtimeId` exists (backend may return `id`)
                  const normalized = Array.isArray(stData)
                    ? stData.map((s: any) => ({ ...(s || {}), showtimeId: s?.showtimeId ?? s?.id ?? s?._id ?? null }))
                    : [];
                  setShowtimes(normalized as ContextShowtime[]);
                } else {
                  setShowtimes([]);
                }
              } catch (err) {
                setShowtimes([]);
              }
            } else {
              setMovie(null);
            }
          } catch (err) {
            setMovie(null);
          }
        } else {
          setMovie(null);
        }
        setLoading(false);
      }
    };
    fetchMovie();
  }, []);

  // Type guard to narrow `showtime` values to `ContextShowtime` objects
  const isShowtime = (x: any): x is ContextShowtime => typeof x === "object" && x !== null && "showtimeId" in x;

  // When the user selects a showtime from the local `showtimes` array, set it in context and navigate.
  const handleSelectShowtime = (showtime: ContextShowtime) => {
    if (!movie) return;
    setMovie(movie);
    setShowtime(showtime);
    router.push("/booking/ticket-selection");
  };


  // Show loading state while fetching movie data
  if (loading) {
    return (
      <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-lg font-medium">Loading...</span>
        </div>
      </section>
    );
  }


  // Show message if no movie is found
  if (!movie) {
    return (
      <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
          <p className="text-gray-500">Please select a movie from the movies page.</p>
        </div>
      </section>
    );
  }

  // Main render: display poster and details in a row, trailer below spanning both
  return (
    <section className="relative py-14 bg-[#0b1727] text-white z-[1] min-h-screen">
      <div className="container mx-auto flex flex-col gap-8 max-w-6xl">
        <div className="w-full flex flex-row justify-center gap-8">
          {/* Movie Poster */}
          <div className="flex flex-col justify-center items-center">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="rounded-xl h-full shadow-lg"
            />
          </div>
          {/* Movie Details */}
          <div className="bg-blue-100 dark:bg-[#1E2735] rounded-xl p-6 lg:p-10 relative z-10 flex flex-col justify-center">
            <h4 className="text-3xl font-bold mb-4 text-center">{movie.title}</h4>
            <div className="mb-4 text-lg text-gray-700 dark:text-gray-300 text-center">
              <span className="font-semibold">Description: </span>{movie.description}
            </div>
            <div className="mb-2 text-center">
              <span className="font-semibold">Genre: </span>
              {movie.genres.join(", ")}
            </div>
            <div className="mb-2 text-center">
              <span className="font-semibold">Director: </span>
              {movie.director}
            </div>
            <div className="mb-2 text-center">
              <span className="font-semibold">Year: </span>
              {movie.year}
            </div>
            <div className="mb-2 text-center">
              <span className="font-semibold">Rating: </span>
              <span className="text-yellow-500">{movie.rating}</span>
            </div>
            <div className="mb-2 text-center">
              <span className="font-semibold">Showtimes: </span>
              <div className="flex flex-wrap gap-4 justify-center mt-3">
                {showtimes.map((st, idx) => {
                  const key = st?.showtimeId ?? `${st?.date ?? 'unknown'}-${st?.time ?? 'unknown'}-${idx}`;
                  const timeLabel = st?.time ?? 'N/A';
                  return (
                    <button
                      key={key}
                      className="px-6 py-3 rounded-lg bg-blue-500 text-white text-lg font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition-all duration-150"
                      onClick={() => {
                        console.log(showtimes);
                        handleSelectShowtime(st);
                      }}
                    >
                      {timeLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Movie Trailer */}
        <div className="w-full flex flex-row justify-center gap-8">
          <div className="aspect-w-16 aspect-h-9 w-full max-w-4xl" style={{ minHeight: '32rem' }}>
            {movie.trailerUrl && movie.trailerUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                controls
                width="100%"
                height="500"
                className="rounded-lg w-full h-[32rem] border border-gray-300 dark:border-gray-700"
                poster={movie.posterUrl}
              >
                <source src={movie.trailerUrl} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <iframe
                width="100%"
                height="500"
                src={movie.trailerUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                title="Movie Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg w-full h-[32rem] border border-gray-300 dark:border-gray-700"
              ></iframe>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};


// Export the MovieDetails component as default
export default MovieDetails;