'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/context/CheckoutContext";
import { useMovie } from "@/context/MovieContext";

const TICKET_TYPES = [
    { label: "Adult", value: "adult", price: 12 },
    { label: "Child", value: "child", price: 8 },
    { label: "Senior", value: "senior", price: 9 },
];

const Booking = () => {
    const router = useRouter();
    const { checkout, updateCheckoutField } = useCheckout();
    const { movie, showtime } = useMovie();

    const [error, setError] = useState<string | null>(null);
    
    // Derive ticket counts from checkout.tickets
    const getTicketCount = (ticketType: string) => {
        return checkout?.tickets.filter(t => t.ticketType === ticketType).length || 0;
    };
    
    const total = TICKET_TYPES.reduce((sum, t) => {
        const count = getTicketCount(t.value);
        return sum + count * t.price;
    }, 0);

    const validateEmail = (e: string) => {
        return /^\S+@\S+\.\S+$/.test(e);
    };

    const handleSubmit = () => {
        setError(null);

        // Error handling
        if (checkout?.name == "" || checkout?.email == "") {
            setError("Name and email must be entered.");
            return
        }
        if (total == 0) {
            setError("At least 1 ticket must be selected.");
            return
        }
        if (!checkout?.email || !validateEmail(checkout.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        // Successful form completion
        router.push("/seat-selection")
    };

    const buildTicket = (ticketType: string) => {
        if (!checkout) return;
        const newTicket = {
            ticketType: ticketType,
            seatNumber: "" // Will be assigned during seat selection
        };
        updateCheckoutField("tickets", [...checkout.tickets, newTicket]);
    }

    const removeTicket = (ticketType: string) => {
        if (!checkout) return;
        const ticketIndex = checkout.tickets.findLastIndex(t => t.ticketType === ticketType);
        if (ticketIndex !== -1) {
            const updatedTickets = [...checkout.tickets];
            updatedTickets.splice(ticketIndex, 1);
            updateCheckoutField("tickets", updatedTickets);
        }
    }

    return (
        <>
                <div className="w-full max-w-2xl bg-[#17233a] rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center text-blue-300">Book Your Tickets</h2>
                    {movie && showtime ? (
                        <>
                            {/* Movie details section */}
                            <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-center">
                                <img src={movie.posterUrl} alt={movie.title} className="w-40 h-40 object-cover rounded-lg shadow" />
                                <div className="text-center md:text-left">
                                    <h3 className="text-xl font-semibold mb-1">{movie.title} ({movie.year})</h3>
                                    <p className="mb-1 text-gray-600 dark:text-gray-300">Directed by: {movie.director}</p>
                                    <p className="mb-2 text-gray-700 dark:text-gray-200">{movie.description}</p>
                                    <div className="mb-1">
                                        <span className="font-semibold">Showtime: {showtime.time}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Rating:</span> {movie.rating}
                                    </div>
                                </div>
                            </div>
                            {/* Booking Form */}
                            <div className="space-y-6">
                                {/* Error Messages */}
                                {error && (
                                    <div className="flex flex-row justify-center">
                                        <label className="font-semibold mb-1 text-red-600">{error}</label>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name input */}
                                    <div>
                                        <label className="block font-semibold mb-1">Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0b1727] dark:border-gray-700 dark:text-white"
                                            value={checkout?.name ?? ""}
                                            onChange={e => updateCheckoutField("name", e.target.value)}
                                            required
                                        />
                                    </div>
                                    {/* Email input */}
                                    <div>
                                        <label className="block font-semibold mb-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-[#0b1727] dark:border-gray-700 dark:text-white"
                                            value={checkout?.email ?? ""}
                                            onChange={e => updateCheckoutField("email", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                {/* Ticket counts per type */}
                                <div>
                                    <label className="block font-semibold mb-2">Tickets</label>
                                    <div className="space-y-4">
                                        {TICKET_TYPES.map(t => {
                                            const count = getTicketCount(t.value);
                                            const decrement = () => {
                                                removeTicket(t.value);
                                            }
                                            const increment = () => {
                                                buildTicket(t.value);
                                            }
                                            return (
                                                <div key={t.value} className="flex items-center justify-between bg-[#0b1727] dark:bg-[#0b1727] px-4 py-3 rounded-md border border-gray-300 dark:border-gray-700">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{t.label}</span>
                                                        <span className="text-sm text-gray-400">${t.price} each</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button type="button" onClick={decrement} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white font-bold disabled:opacity-40" disabled={count === 0}>-</button>
                                                        <span className="min-w-[2ch] text-center font-semibold" aria-label={`${t.label} tickets count`}>{count}</span>
                                                        <button type="button" onClick={increment} className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white font-bold disabled:opacity-40" disabled={count === 10}>+</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* Total and submit button section */}
                                <div className="flex flex-row justify-center items-center gap-4 border-t border-gray-700 pt-4">
                                    <button
                                        className="px-8 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 cursor-pointer"
                                        onClick={handleSubmit}
                                    >
                                        Select Seats
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Message if no movie or showtime is selected
                        <div className="text-center text-lg text-gray-500">No movie or showtime selected. Please select a movie and showtime first.</div>
                    )}
                </div>
        </>
    );
}

// Export Booking component as default
export default Booking;