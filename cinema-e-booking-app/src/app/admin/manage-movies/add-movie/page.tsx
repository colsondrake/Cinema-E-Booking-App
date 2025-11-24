"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { useAccount } from "@/context/AccountContext";

// --- Helpers ---
const currentYear = new Date().getFullYear();
const RATINGS = ["G", "PG", "PG-13", "R", "NC-17", "NR"] as const;
const STATUSES = ["Coming Soon", "Now Showing"] as const;

export default function AddMoviePage() {
  const { account } = useAccount();
  if (account?.role != "ADMIN") {
    redirect("/");
  }

  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState<string>("");
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState("");
  const [rating, setRating] = useState<string>("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [status, setStatus] = useState<string>(STATUSES[0]);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

  const addGenre = () => {
    const g = genreInput.trim();
    if (!g) return;
    if (genres.includes(g)) {
      setGenreInput("");
      return;
    }
    setGenres((prev) => [...prev, g]);
    setGenreInput("");
  };

  const removeGenre = (g: string) =>
    setGenres((prev) => prev.filter((x) => x !== g));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const payload = {
        title,
        director,
        year: Number(year),
        genres,
        rating,
        description,
        posterUrl,
        trailerUrl,
        showtimes: [], 
        status,        
      };

      const res = await fetch(`${API_BASE}/api/admin/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to add movie");
      }

      const savedMovie = await res.json();
      console.log("Saved movie:", savedMovie);
      setSuccessMsg("Movie added successfully!");

      setTimeout(() => {
        router.push("/admin/manage-movies");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to add movie");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-[#0b1727] text-white py-10 md:py-12">
      <div className="w-full max-w-3xl bg-[#17233a] border border-[#1f2d49] rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Add Movie</h1>
          <p className="text-gray-300 mt-2">
            Create a new movie record. All required fields must be valid before
            saving.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-2 text-sm">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 px-4 py-2 text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title & Director */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                placeholder="e.g., Interstellar"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Director</label>
              <input
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                placeholder="e.g., Christopher Nolan"
                required
              />
            </div>
          </div>

          {/* Year & Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block mb-1">Year</label>
              <input
                inputMode="numeric"
                value={year}
                onChange={(e) =>
                  setYear(e.target.value.replace(/[^0-9]/g, ""))
                }
                className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                placeholder={`e.g., ${currentYear}`}
                required
              />
            </div>

            <div>
              <label className="block mb-1">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                required
              >
                <option value="">Select...</option>
                {RATINGS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Genres */}
          <div className="mb-5">
            <label className="block mb-1">Genres</label>
            <div className="flex gap-2">
              <input
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addGenre();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                placeholder="Type a genre and press Enter (e.g., Sci-Fi)"
              />
              <button
                type="button"
                onClick={addGenre}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500"
              >
                Add
              </button>
            </div>

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-2 bg-[#0b1727] border border-gray-700 rounded-full px-3 py-1 text-sm"
                  >
                    {g}
                    <button
                      type="button"
                      onClick={() => removeGenre(g)}
                      className="text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
              placeholder="Brief synopsis"
              required
            />
          </div>

          {/* Poster & Trailer URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block mb-1">Poster URL</label>
              <input
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                placeholder="https://.../poster.jpg"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Trailer URL (optional)</label>
              <input
                value={trailerUrl}
                onChange={(e) => setTrailerUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#0b1727] border border-gray-700"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <label className="block mb-2">Status</label>
            <div className="flex justify-center gap-3 flex-wrap">
              {STATUSES.map((s) => (
                <label
                  key={s}
                  className={`cursor-pointer border rounded-lg px-3 py-2 bg-[#0b1727] ${
                    status === s ? "border-blue-500" : "border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    className="mr-2"
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    required
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save Movie"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/manage-movies")}
              className="px-6 py-2 rounded-md bg-[#0b1727] border border-gray-700 hover:bg-[#0f1c30]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
