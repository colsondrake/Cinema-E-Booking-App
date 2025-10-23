'use client'

/**
 * Booking Component
 * Handles the ticket booking process for a selected movie and showtime.
 * Includes user input for ticket type, quantity, food selections, and contact info.
 * Fetches movie details from backend and manages booking state.
 */

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

/**
 * Movie interface
 * Represents the structure of a movie object fetched from the backend.
 */
interface Movie {
    id: string;
    title: string;
    director: string;
    year: number;
    genres: string[];
    rating: string;
    description: string;
    posterUrl: string;
    trailerUrl: string;
    showtimes: string[];
}

/**
 * Ticket types available for booking.
 * Price fields are commented out for future use.
 */
const TICKET_TYPES = [
    // { label: "Adult", value: "adult", price: 12 },
    // { label: "Child", value: "child", price: 8 },
    // { label: "Senior", value: "senior", price: 9 },
    { label: "Adult", value: "adult" },
    { label: "Child", value: "child" },
    { label: "Senior", value: "senior" },
];

/**
 * Food and drink options available for purchase.
 */
const FOOD_OPTIONS = [
    { label: "Popcorn", value: "popcorn", price: 5 },
    { label: "Soda", value: "soda", price: 3 },
    { label: "Candy", value: "candy", price: 4 },
    { label: "Nachos", value: "nachos", price: 6 },
];

/**
 * Booking functional component
 * Manages state for movie, showtime, ticket selection, food selection, and user info.
 */
const Booking = () => {
    // State for selected movie details
    const [movie, setMovie] = useState<Movie | null>(null);
    // State for selected showtime
    const [showtime, setShowtime] = useState<string | null>(null);
    // State for ticket type selection
    const [ticketType, setTicketType] = useState<string>(TICKET_TYPES[0].value);
    // State for ticket quantity
    const [ticketQty, setTicketQty] = useState<number>(1);
    // State for food selections (key: food value, value: quantity)
    const [foodSelections, setFoodSelections] = useState<{ [key: string]: number }>({});
    // State for user name
    const [name, setName] = useState("");
    // State for user email
    const [email, setEmail] = useState("");
    // State to track if booking is submitted
    const [submitted, setSubmitted] = useState(false);

    /**
     * Fetch movie and showtime from backend API on mount.
     * Uses sessionStorage to retrieve selected movie and showtime.
     */
    useEffect(() => {
        if (typeof window !== "undefined") {
            const movieId = sessionStorage.getItem("selectedMovieId");
            const selectedShowtime = sessionStorage.getItem("selectedShowtime");
            if (movieId) {
                fetch(`http://localhost:8080/api/movies/${movieId}`)
                    .then(res => {
                        if (!res.ok) throw new Error("Movie not found");
                        return res.json();
                    })
                    .then(data => setMovie(data))
                    .catch(() => setMovie(null));
            }
            if (selectedShowtime) setShowtime(selectedShowtime);
        }
    }, []);

    // Calculate total cost of selected food items
    const foodTotal = Object.entries(foodSelections).reduce((sum, [food, qty]) => {
        const foodPrice = FOOD_OPTIONS.find(f => f.value === food)?.price || 0;
        return sum + foodPrice * qty;
    }, 0);
    // Uncomment below to include ticket price in total calculation
    // const ticketPrice = TICKET_TYPES.find(t => t.value === ticketType)?.price || 0;
    // const total = ticketPrice * ticketQty + foodTotal;

    /**
     * Handles change in food selection quantity.
     * @param food - food item value
     * @param qty - quantity selected
     */
    const handleFoodChange = (food: string, qty: number) => {
        setFoodSelections(prev => ({ ...prev, [food]: qty }));
    };

    /**
     * Handles form submission for booking.
     * Sets submitted state to true to show confirmation.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <>
            {/* Navigation bar */}
            <Navbar />
            <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white min-h-screen flex items-center justify-center">
                <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#17233a] rounded-xl shadow-lg p-8">
                    {/* Booking header */}
                    <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-blue-300">Book Your Tickets</h2>
                    {/* Show booking form if movie and showtime are selected */}
                    {movie && showtime ? (
                        <>
                            {/* Movie details section */}
                            <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-center">
                                {/* <img src={movie.posterUrl} alt={movie.title} className="w-40 h-40 object-cover rounded-lg shadow" /> */}
                                <div className="text-center md:text-left">
                                    <h3 className="text-xl font-semibold mb-1">{movie.title} ({movie.year})</h3>
                                    {/* <p className="mb-1 text-gray-600 dark:text-gray-300">Directed by: {movie.director}</p>
                                    <p className="mb-2 text-gray-700 dark:text-gray-200">{movie.description}</p>
                                    <div className="mb-1">
                                        <span className="font-semibold">Genre:</span> {movie.genre}
                                    </div> */}
                                    <div className="mb-1">
                                        <span className="font-semibold">Showtime: </span>
                                        <span className="inline-block px-3 py-1 rounded bg-blue-500 text-white text-xs">{showtime}</span>
                                    </div>
                                    {/* <div>
                                        <span className="font-semibold">Rating:</span> {movie.rating}
                                    </div> */}
                                </div>
                            </div>
                            {/* Show confirmation message after submission */}
                            {submitted ? (
                                <div className="text-center text-green-600 text-lg font-semibold py-8">
                                    Thank you for your booking, {name || "Guest"}!<br />
                                    A confirmation has been sent to {email || "your email"}.
                                </div>
                            ) : (
                                // Booking form
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name input */}
                                        <div>
                                            <label className="block font-semibold mb-1">Name</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0b1727] dark:border-gray-700 dark:text-white"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {/* Email input */}
                                        <div>
                                            <label className="block font-semibold mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0b1727] dark:border-gray-700 dark:text-white"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Ticket type selection */}
                                        <div>
                                            <label className="block font-semibold mb-1">Ticket Type</label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0b1727] dark:border-gray-700 dark:text-white"
                                                value={ticketType}
                                                onChange={e => setTicketType(e.target.value)}
                                            >
                                                {/* Uncomment below to show price in dropdown */}
                                                {/* {TICKET_TYPES.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label} (${t.price})</option>
                                                ))} */}
                                                {TICKET_TYPES.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Ticket quantity input */}
                                        <div>
                                            <label className="block font-semibold mb-1">Number of Tickets</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={10}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0b1727] dark:border-gray-700 dark:text-white"
                                                value={ticketQty}
                                                onChange={e => setTicketQty(Number(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    {/* Food and drink selection */}
                                    <div>
                                        <label className="block font-semibold mb-2">Food & Drinks</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {FOOD_OPTIONS.map(food => (
                                                <div key={food.value} className="flex flex-col items-center">
                                                    {/* Uncomment below to show price next to food label */}
                                                    {/* <span className="mb-1">{food.label} (${food.price})</span> */}
                                                    <span className="mb-1">{food.label}</span>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={10}
                                                        value={foodSelections[food.value] || 0}
                                                        onChange={e => handleFoodChange(food.value, Number(e.target.value))}
                                                        className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0b1727] dark:border-gray-700 dark:text-white text-center"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Total and submit button section */}
                                    <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                                            {/* Uncomment below to show total cost */}
                                            {/* Total: <span className="text-2xl">${total}</span> */}
                                        </div>
                                        <button
                                            type="submit"
                                            className="px-8 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 cursor-pointer"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    ) : (
                        // Message if no movie or showtime is selected
                        <div className="text-center text-lg text-gray-500">No movie or showtime selected. Please select a movie and showtime first.</div>
                    )}
                </div>
            </section>
        </>
    );
}

// Export Booking component as default
export default Booking;