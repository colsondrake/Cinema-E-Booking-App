'use client'

// Import Statements
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

// Movie Categories
export const MOVIE_CATEGORIES = [
  { label: "All", value: "All" },
  { label: "Action", value: "Action" },
  { label: "Drama", value: "Drama" },
  { label: "Comedy", value: "Comedy" },
  { label: "Romance", value: "Romance" },
  { label: "Sci-Fi", value: "Sci-Fi" },
];

export const MOVIE_LIST = [
  {
    id: 1,
    image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio12.jpg",
    title: "Movie 1",
    categories: ["Action"],
    description: "An action-packed adventure with stunning visuals.",
    status: "running",
    showtimes: ["12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"],
    rating: 4.5,
  },
  {
    id: 2,
    image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio13.jpg",
    title: "Movie 2",
    categories: ["Drama"],
    description: "A moving drama about family and sacrifice.",
    status: "running",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    rating: 4.2,
  },
  {
    id: 3,
    image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio14.jpg",
    title: "Movie 3",
    categories: ["Comedy"],
    description: "A hilarious comedy that will leave you in stitches.",
    status: "coming-soon",
    showtimes: ["Coming Soon"],
    rating: 4.0,
  },
  {
    id: 4,
    image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio15.jpg",
    title: "Movie 4",
    categories: ["Romance"],
    description: "A heartwarming romance for all ages.",
    status: "running",
    showtimes: ["11:00 AM", "2:00 PM", "5:00 PM"],
    rating: 4.7,
  },
  {
    id: 5,
    image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio16.jpg",
    title: "Movie 5",
    categories: ["Sci-Fi"],
    description: "A sci-fi epic that explores the unknown.",
    status: "coming-soon",
    showtimes: ["Coming Soon"],
    rating: 4.3,
  },
  {
    id: 6,
    image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio17.jpg",
    title: "Movie 6",
    categories: ["Action"],
    description: "Another thrilling action movie.",
    status: "running",
    showtimes: ["10:30 AM", "1:30 PM", "4:30 PM", "7:30 PM"],
    rating: 4.1,
  },
  {
    id: 7,
    image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio18.jpg",
    title: "Movie 7",
    categories: ["Comedy"],
    description: "A comedy with a twist.",
    status: "coming-soon",
    showtimes: ["Coming Soon"],
    rating: 3.9,
  },
  {
    id: 8,
    image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio19.jpg",
    title: "Movie 8",
    categories: ["Drama"],
    description: "A drama that tugs at your heartstrings.",
    status: "running",
    showtimes: ["12:30 PM", "3:30 PM", "6:30 PM"],
    rating: 4.6,
  },
  {
    id: 9,
    image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio20.jpg",
    title: "Movie 9",
    categories: ["Romance"],
    description: "A romantic tale for the ages.",
    status: "coming-soon",
    showtimes: ["Coming Soon"],
    rating: 4.4,
  },
];

const Movies = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  // Filter movies by category and search
  const filteredMovies = MOVIE_LIST.filter(movie => {
    const matchesCategory =
      activeCategory === "All" ||
      movie.categories.includes(activeCategory);
    const matchesSearch =
      movie.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Divide into two sections
  const runningMovies = filteredMovies.filter(m => m.status === "running");
  const comingSoonMovies = filteredMovies.filter(m => m.status === "coming-soon");

  // Card component for reuse
  const MovieCard = (movie: typeof MOVIE_LIST[number]) => (
    <div className="col-span-6 md:col-span-3 xl:col-span-1 flex justify-center" key={movie.id}>
      <div
        className="w-full max-w-[260px] h-[420px] flex flex-col justify-between rounded-xl overflow-hidden border border-white dark:border-[#17233a] p-1 cursor-pointer bg-white dark:bg-[#17233a] shadow transition-transform duration-200 hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("selectedMovie", JSON.stringify(movie));
          }
          router.push(`/movie-details/${movie.id}`);
        }}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            if (typeof window !== "undefined") {
              sessionStorage.setItem("selectedMovie", JSON.stringify(movie));
            }
            router.push(`/movie-details/${movie.id}`);
          }
        }}
        role="button"
        aria-label={`View details for ${movie.title}`}
      >
        <img
          src={movie.image}
          alt={movie.title}
          className="w-full h-[160px] object-cover rounded-xl mx-auto"
        />
        <div className="mt-4 flex-1 flex flex-col justify-between">
          <div>
            <h5 className="text-xl font-medium mb-1 text-center">
              {movie.title}
            </h5>
            <p className="mb-0 text-sm text-gray-500 dark:text-gray-300 text-center">
              {movie.categories.join(", ")}
            </p>
            <div className="mt-2 text-center">
              <span className="font-semibold text-sm text-blue-600 dark:text-blue-300">Rating:</span>
              <span className="ml-1 text-sm text-yellow-500 dark:text-yellow-400">{movie.rating} / 5</span>
            </div>
            <div className="mt-2 text-center">
              <span className="font-semibold text-sm text-blue-600 dark:text-blue-300">Description:</span>
              <p className="text-sm text-gray-700 dark:text-gray-200 mt-1 line-clamp-3">{movie.description}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-semibold text-sm text-blue-600 dark:text-blue-300">Showtimes:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {movie.showtimes.map((showtime: string, idx: number) => (
                <button
                  key={idx}
                  className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    if (typeof window !== "undefined") {
                      sessionStorage.setItem("selectedMovie", JSON.stringify(movie));
                      sessionStorage.setItem("selectedShowtime", showtime);
                    }
                    router.push("/booking");
                  }}
                  tabIndex={0}
                >
                  {showtime}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#17233a] dark:border-gray-700 dark:text-white"
              aria-label="Search movies"
            />
            {/* Category Buttons Section */}
            <div className="flex flex-wrap justify-center gap-2">
              {MOVIE_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setActiveCategory(category.value)}
                  className={`cursor-pointer btn m-1 py-2 px-5 rounded-md transition-colors duration-200
                    ${activeCategory === category.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-[#17233a] text-[#373572] dark:text-white hover:bg-blue-600 hover:text-white"
                    }`}
                  aria-pressed={activeCategory === category.value}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Currently Running Section */}
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-900 pb-2">
            Currently Running
          </h3>
          {runningMovies.length === 0 ? (
            <div className="text-center text-lg text-gray-500 mt-10">
              No movies found.
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-6 md:gap-y-12 text-center">
              {runningMovies.map(MovieCard)}
            </div>
          )}
        </div>

        {/* Coming Soon Section */}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-900 pb-2">
            Coming Soon
          </h3>
          {comingSoonMovies.length === 0 ? (
            <div className="text-center text-lg text-gray-500 mt-10">
              No movies found.
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-6 md:gap-y-12 text-center">
              {comingSoonMovies.map(MovieCard)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Movies