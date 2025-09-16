'use client';


import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

interface Movie {
    id: number;
    image: string;
    title: string;
    categories: string[];
    description: string;
    status: string;
    showtimes: string[];
    rating: number;
}

const TICKET_TYPES = [
    { label: "Adult", value: "adult", price: 12 },
    { label: "Child", value: "child", price: 8 },
    { label: "Senior", value: "senior", price: 9 },
];

const FOOD_OPTIONS = [
    { label: "Popcorn", value: "popcorn", price: 5 },
    { label: "Soda", value: "soda", price: 3 },
    { label: "Candy", value: "candy", price: 4 },
    { label: "Nachos", value: "nachos", price: 6 },
];

export default function Page() {
    const [movie, setMovie] = useState<Movie | null>(null);
    const [showtime, setShowtime] = useState<string | null>(null);
    const [ticketType, setTicketType] = useState<string>(TICKET_TYPES[0].value);
    const [ticketQty, setTicketQty] = useState<number>(1);
    const [foodSelections, setFoodSelections] = useState<{ [key: string]: number }>({});
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedMovie = sessionStorage.getItem("selectedMovie");
            const storedShowtime = sessionStorage.getItem("selectedShowtime");
            if (storedMovie) setMovie(JSON.parse(storedMovie));
            if (storedShowtime) setShowtime(storedShowtime);
        }
    }, []);

    const ticketPrice = TICKET_TYPES.find(t => t.value === ticketType)?.price || 0;
    const foodTotal = Object.entries(foodSelections).reduce((sum, [food, qty]) => {
        const foodPrice = FOOD_OPTIONS.find(f => f.value === food)?.price || 0;
        return sum + foodPrice * qty;
    }, 0);
    const total = ticketPrice * ticketQty + foodTotal;

    const handleFoodChange = (food: string, qty: number) => {
        setFoodSelections(prev => ({ ...prev, [food]: qty }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <>
            <Navbar />
            <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white min-h-screen flex items-center justify-center">
                <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#17233a] rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 dark:text-blue-300">Book Your Tickets</h2>
                    {movie && showtime ? (
                        <>
                            <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-center">
                                <img src={movie.image} alt={movie.title} className="w-40 h-40 object-cover rounded-lg shadow" />
                                <div className="text-center md:text-left">
                                    <h3 className="text-xl font-semibold mb-1">{movie.title}</h3>
                                    <p className="mb-1 text-gray-600 dark:text-gray-300">{movie.categories.join(", ")}</p>
                                    <p className="mb-2 text-gray-700 dark:text-gray-200">{movie.description}</p>
                                    <div className="mb-1">
                                        <span className="font-semibold">Showtime: </span>
                                        <span className="inline-block px-3 py-1 rounded bg-blue-500 text-white text-xs">{showtime}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Rating: </span>
                                        <span className="text-yellow-500">{movie.rating} / 5</span>
                                    </div>
                                </div>
                            </div>
                            {submitted ? (
                                <div className="text-center text-green-600 text-lg font-semibold py-8">
                                    Thank you for your booking, {name || "Guest"}!<br />
                                    A confirmation has been sent to {email || "your email"}.
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <div>
                                            <label className="block font-semibold mb-1">Ticket Type</label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0b1727] dark:border-gray-700 dark:text-white"
                                                value={ticketType}
                                                onChange={e => setTicketType(e.target.value)}
                                            >
                                                {TICKET_TYPES.map(t => (
                                                    <option key={t.value} value={t.value}>{t.label} (${t.price})</option>
                                                ))}
                                            </select>
                                        </div>
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
                                    <div>
                                        <label className="block font-semibold mb-2">Food & Drinks</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {FOOD_OPTIONS.map(food => (
                                                <div key={food.value} className="flex flex-col items-center">
                                                    <span className="mb-1">{food.label} (${food.price})</span>
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
                                    <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                                            Total: <span className="text-2xl">${total}</span>
                                        </div>
                                        <button
                                            type="submit"
                                            className="px-8 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    ) : (
                        <div className="text-center text-lg text-gray-500">No movie or showtime selected. Please select a movie and showtime first.</div>
                    )}
                </div>
            </section>
        </>
    );
}