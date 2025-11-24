"use client";

import React, { createContext, useContext, useState } from "react";

export type Showtime = {
  showtimeId?: string;
  movieId?: string;
  date?: string;
  basePrice?: number;
  time?: string;
  seats?: any;
  remainingSeats?: number;
}

// Movie type definition for type safety and clarity
export type Movie = {
  id: string;
  title: string;
  director: string;
  year: number;
  genres: string[];
  rating: string;
  description: string;
  posterUrl: string;
  trailerUrl: string;
  showtimes: Showtime[];
  status: string;
};

type MovieContextType = {
  movie: Movie | null;
  setMovie: React.Dispatch<React.SetStateAction<Movie | null>>;
  showtime: Showtime | null;
  setShowtime: React.Dispatch<React.SetStateAction<Showtime | null>>;
};

const MovieContext = createContext<MovieContextType | undefined>(undefined);


export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtime, setShowtime] = useState<Showtime | null>(null);

  return (
    <MovieContext.Provider value={{ movie, setMovie, showtime, setShowtime }}>
      {children}
    </MovieContext.Provider>
  );
};

export const useMovie = () => {
  const ctx = useContext(MovieContext);
  if (!ctx) throw new Error("useCheckout must be used within MovieProvider");
  return ctx;
};

export default MovieContext;
