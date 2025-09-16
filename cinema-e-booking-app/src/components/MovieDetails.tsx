'use client'

import React, { useEffect, useState } from "react";

interface Movie {
  id: number;
  image: string;
  title: string;
  categories: string[];
  description: string;
  status: string;
  showtimes: string[];
  rating: number;
  trailerUrl?: string; // Optional trailer URL
}

const MovieDetails = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoading(true);
      const stored = sessionStorage.getItem("selectedMovie");
      if (stored) {
        setMovie(JSON.parse(stored));
      }
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-lg font-medium">Loading...</span>
        </div>
      </section>
    );
  }

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

  return (
    <section className="relative py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white z-[1] min-h-screen">
      <div className="container px-4">
        <div className="grid grid-cols-12 justify-center">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-6 md:py-12 flex flex-col items-center gap-6">
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="rounded-xl w-full max-w-md mx-auto shadow-lg"
                />
                {/* Movie Trailer */}
                <div className="w-full max-w-md mx-auto">
                  <h5 className="text-lg font-semibold mb-2 text-center">Trailer</h5>
                  <div className="aspect-w-16 aspect-h-9">
                    {movie.trailerUrl && movie.trailerUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        controls
                        width="100%"
                        height="250"
                        className="rounded-lg w-full h-64 border border-gray-300 dark:border-gray-700"
                        poster={movie.image}
                      >
                        <source src={movie.trailerUrl} />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <iframe
                        width="100%"
                        height="250"
                        src={movie.trailerUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                        title="Movie Trailer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg w-full h-64 border border-gray-300 dark:border-gray-700"
                      ></iframe>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-6 pb-6 md:py-12 relative flex flex-col justify-center">
                <div className="bg-blue-100 dark:bg-[#1E2735] absolute -top-[10%] right-0 left-0 bottom-0 md:top-0 md:-left-[20%] rounded-xl rotate-180 -z-[1]"></div>
                <div className="p-6 lg:p-14 mb-12 relative z-10">
                  <h4 className="text-3xl font-bold mb-4">{movie.title}</h4>
                  <div className="mb-4 text-lg text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Description: </span>{movie.description}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Categories: </span>
                    {movie.categories.join(", ")}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Status: </span>
                    <span className={movie.status === 'running' ? 'text-green-600' : 'text-yellow-600'}>
                      {movie.status.charAt(0).toUpperCase() + movie.status.slice(1)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Rating: </span>
                    <span className="text-yellow-500">{movie.rating} / 5</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Showtimes: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {movie.showtimes.map((showtime, idx) => (
                        <button
                          key={idx}
                          className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              sessionStorage.setItem("selectedMovie", JSON.stringify(movie));
                              sessionStorage.setItem("selectedShowtime", showtime);
                            }
                            window.location.href = "/booking";
                          }}
                        >
                          {showtime}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MovieDetails;