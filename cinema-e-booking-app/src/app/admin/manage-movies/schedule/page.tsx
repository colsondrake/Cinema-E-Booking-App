"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import { useAccount } from "@/context/AccountContext";

// ---- Types ----
export type Showtime = {
  id: string;
  movieId: string;
  showroomId: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
};

export type Movie = {
  id: string;
  title: string;
  duration?: number;
  rating?: string;
  posterUrl?: string;
  description?: string;
  showtimes?: Showtime[]; // embedded showtimes from backend
};

export type Showroom = {
  id: string; // e.g., "SR-1"
  name: string; // display name
};

// ---- Constants ----
const SHOWROOMS: ReadonlyArray<Showroom> = [
  { id: "1", name: "SR-1 (Standard)" },
  { id: "2", name: "SR-2 (Standard)" },
  { id: "3", name: "SR-3 (Premium)" },
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function ScheduleMoviePage() {
	const { account } = useAccount();
	if (account?.role != "ADMIN") {
		redirect("/");
	}

  const router = useRouter();
  const params = useSearchParams();
  const movieId = params.get("movieId") || ""; // required via query param

  // --- Movie details (for header + left card) ---
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loadingMovie, setLoadingMovie] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // --- Showtimes for this movie (we'll pull from movie.showtimes) ---
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  // --- Form state ---
  const [showroomId, setShowroomId] = useState<string>(SHOWROOMS[0]?.id ?? "");
  const [date, setDate] = useState<string>(""); // yyyy-mm-dd
  const [time, setTime] = useState<string>(""); // HH:mm

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const headerTitle = useMemo(() => {
    if (loadingMovie) return "Loading…";
    if (movie) return `Schedule: ${movie.title}`;
    return "Schedule Movie";
  }, [movie, loadingMovie]);

  // ---- Load movie details (and its embedded showtimes) ----
  useEffect(() => {
    if (!movieId) {
      setLoadError("No movie selected.");
      return;
    }

    let ignore = false;
    const load = async () => {
      setLoadingMovie(true);
      setLoadError(null);
      try {
        const res = await fetch(`${API_BASE}/api/movies/${movieId}`);
        if (!res.ok) throw new Error("Failed to load movie");
        const data: Movie = await res.json();

        if (!ignore) {
          setMovie(data);
          setShowtimes(data.showtimes ?? []); // ✅ use movie.showtimes here
        }
      } catch (e: any) {
        if (!ignore) setLoadError(e?.message || "Failed to load movie");
      } finally {
        if (!ignore) setLoadingMovie(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!movieId) {
      setError("No movie selected.");
      return;
    }

    if (!date || !time || !showroomId) {
      setError("Please select showroom, date, and time.");
      return;
    }

    setSubmitting(true);
    try {
      const qs = new URLSearchParams({
        movieId,
        showroomId,
        date,
        time,
      }).toString();

      const res = await fetch(`${API_BASE}/api/admin/showtimes?${qs}`, {
        method: "POST",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to schedule showtime");
      }

      const saved: Showtime = await res.json();

      // Add new showtime to local list so UI updates immediately
      setShowtimes((prev) => [...prev, saved]);

      // Reset form fields
      setDate("");
      setTime("");
      setShowroomId(SHOWROOMS[0]?.id ?? "");
      setShowForm(false);
    } catch (e: any) {
      setError(e?.message || "Failed to schedule showtime");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-[#0b1727] text-white py-10 md:py-12">
      <div className="w-full max-w-5xl bg-[#17233a] border border-[#1f2d49] rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">{headerTitle}</h1>
          <p className="text-gray-300 mt-2">
            Choose a showroom and a date/time for this movie, and review all
            scheduled showtimes.
          </p>
        </div>

        {(loadError || error) && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-2 text-sm">
            {loadError || error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT: Movie card */}
          <div className="md:col-span-1">
            <div className="bg-[#0b1727] border border-gray-700 rounded-xl p-4 flex flex-col items-center text-center">
              {movie?.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-40 h-60 object-cover rounded-md mb-4 border border-gray-700"
                />
              ) : (
                <div className="w-40 h-60 flex items-center justify-center rounded-md mb-4 border border-gray-700 bg-[#111827] text-xs text-gray-400">
                  No poster
                </div>
              )}
              <div className="font-semibold text-lg mb-1">
                {movie?.title ?? "Unknown Movie"}
              </div>
              {movie?.rating && (
                <div className="text-sm text-gray-300">Rating: {movie.rating}</div>
              )}
              {movie?.duration != null && (
                <div className="text-sm text-gray-400 mt-1">
                  Duration: {movie.duration} min
                </div>
              )}
              {movie?.description && (
                <p className="text-xs text-gray-400 mt-3 line-clamp-4">
                  {movie.description}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: Showtimes + form */}
          <div className="md:col-span-2">
            {/* Showtimes list */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Scheduled Showtimes</h2>
                <button
                  type="button"
                  onClick={() => setShowForm((prev) => !prev)}
                  className="cursor-pointer px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-sm"
                >
                  {showForm ? "Close Form" : "Add a Showtime"}
                </button>
              </div>

              {showtimes.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No showtimes scheduled yet for this movie.
                </p>
              ) : (
                <div className="space-y-2">
                  {showtimes.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between bg-[#0b1727] border border-gray-700 rounded-lg px-4 py-2 text-sm"
                    >
                      <div>
                        <div className="font-medium">
                          {st.date} @ {st.time}
                        </div>
                        <div className="text-xs text-gray-400">
                          Showroom: {st.showroomId}
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-500">ID: {st.id}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add showtime form (toggle) */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="mt-4 border-t border-gray-700 pt-4"
              >
                <h3 className="text-lg font-semibold mb-4">New Showtime</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block mb-1">
                      Showroom<span className="text-red-400">*</span>
                    </label>
                    <select
                      value={showroomId}
                      onChange={(e) => setShowroomId(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                      required
                    >
                      {SHOWROOMS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">
                      Date<span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block mb-1">
                      Time<span className="text-red-400">*</span>
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
                  >
                    {submitting ? "Saving…" : "Save Showtime"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 rounded-md bg-[#0b1727] border border-gray-700 hover:bg-[#0f1c30]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Back button under everything on smaller screens */}
            <div className="mt-6 flex justify-center md:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="cursor-pointer px-6 py-2 rounded-md bg-[#0b1727] border border-gray-700 hover:bg-[#0f1c30]"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
