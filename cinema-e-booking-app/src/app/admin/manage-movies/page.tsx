"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { useAccount } from "@/context/AccountContext";

// === Movie types based on your Java model ===
type Showtime = {
  id?: string;
  movieId?: string;
  showroomId?: string | null;
  date?: string | null;
  time?: string | null;
};

type Movie = {
  id: string;
  title: string;
  director: string;
  year: number;
  genres: string[];
  rating: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
  showtimes?: Showtime[]; // optional for safety
  status: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function ManageMoviesPage() {
  const { account } = useAccount();
  if (account?.role != "ADMIN") {
    redirect("/");
  }

  const router = useRouter();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load all movies when page mounts
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/admin/movies`);
        if (!res.ok) {
          throw new Error(`Failed to load movies (status ${res.status})`);
        }

        const data: Movie[] = await res.json();
        setMovies(data);
      } catch (err: any) {
        setError(err.message || "Failed to load movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleAddMovie = () => {
    router.push("/admin/manage-movies/add-movie");
  };

  const handleDeleteMovie = async (movieId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this movie?");
    if (!confirmed) return;
  
    try {
      setError(null);
  
      const res = await fetch(`${API_BASE}/api/admin/movies/${movieId}`, {
        method: "DELETE",
      });
  
      // Backend returns 204 or 200 – treat any 2xx as success
      if (!res.ok) {
        throw new Error(`Failed to delete movie (status ${res.status})`);
      }
  
      // Remove movie from local state so UI updates immediately
      setMovies((prev) => prev.filter((m) => m.id !== movieId));
    } catch (err: any) {
      setError(err.message || "Failed to delete movie");
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-[#0b1727] text-white py-10 md:py-12">
      <div className="w-full max-w-5xl bg-[#17233a] border border-[#1f2d49] rounded-2xl p-8 shadow-lg">
        {/* Header + Add Movie Button */}
        <div className="cursor-pointer flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Manage Movies</h1>
            <p className="text-gray-300 mt-2 text-sm md:text-base">
              View all movies stored in the database.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddMovie}
            className="cursor-pointer px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-sm md:text-base"
          >
            + Add Movie
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <p className="text-gray-300 text-sm">Loading movies…</p>
        ) : movies.length === 0 ? (
          <p className="text-gray-400 text-sm">No movies found.</p>
        ) : (
          <div className="space-y-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="flex flex-col md:flex-row gap-4 bg-[#0b1727] border border-gray-700 rounded-xl p-4"
              >
                {/* Poster */}
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-32 h-48 object-cover rounded-lg border border-gray-700"
                />

                {/* Movie Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{movie.title}</h2>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        movie.status === "ACTIVE"
                          ? "bg-green-600/30 text-green-300"
                          : "bg-gray-600/30 text-gray-300"
                      }`}
                    >
                      {movie.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mt-1">
                    Directed by <span className="text-white">{movie.director}</span>{" "}
                    • {movie.year}
                  </p>

                  <p className="text-sm mt-1">
                    <span className="text-gray-300">Genres:</span>{" "}
                    {movie.genres?.join(", ")}
                  </p>

                  <p className="text-sm mt-1">
                    <span className="text-gray-300">Rating:</span> {movie.rating}
                  </p>

                  <p className="text-sm mt-2 line-clamp-2 text-gray-300">
                    {movie.description}
                  </p>

                  {/* Showtimes */}
                  {movie.showtimes && movie.showtimes.length > 0 && (
                    <div className="mt-3 text-xs text-gray-400">
                      <span className="text-gray-300 font-medium">Showtimes:</span>{" "}
                      {movie.showtimes
                        // filter out broken/null ones from old data
                        .filter((s) => s.date && s.time)
                        .map(
                          (s) =>
                            `${s.date} @ ${s.time} (${
                              s.showroomId ?? "?"
                            })`
                        )
                        .join(", ")}
                    </div>
                  )}

                  <div className="text-[11px] text-gray-500 mt-3">
                    Movie ID: {movie.id}
                  </div>
                </div>

                {/* Schedule button */}
                <div className="flex items-start">
                  <button
                    onClick={() =>
                      router.push(`/admin/manage-movies/edit-movie?movieId=${movie.id}`)
                    }
                    className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 border border-gray-700 rounded-md text-sm hover:bg-[#0f1c30]"
                  >
                    Edit
                  </button>
                </div>


                <div className="flex items-start">
                  <button
                    onClick={() => handleDeleteMovie(movie.id)}
                    className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-500 border border-red-700 rounded-md text-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="flex items-start">
                <button
                  onClick={() => router.push(`/admin/manage-movies/schedule/?movieId=${movie.id}`)}
                  className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 border border-gray-700 rounded-md text-sm hover:bg-[#0f1c30]"
                >
                  Schedule
                </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
