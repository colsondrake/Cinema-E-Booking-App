'use client'

import React from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/context/CheckoutContext";
import { useMovie } from "@/context/MovieContext";
import { useAccount } from "@/context/AccountContext";

const TICKET_PRICES: Record<string, number> = {
    adult: 12,
    senior: 9,
    child: 6,
};

const ConfirmBooking = () => {
    const router = useRouter();
    const { checkout } = useCheckout();
    const { movie, showtime } = useMovie();
    const { account } = useAccount();

    // Calculate ticket counts by type
    const ticketCounts = checkout?.tickets.reduce((acc, ticket) => {
        acc[ticket.ticketType] = (acc[ticket.ticketType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    // Calculate total price
    const totalPrice = checkout?.tickets.reduce((sum, ticket) => {
        return sum + (TICKET_PRICES[ticket.ticketType] || 0);
    }, 0) || 0;

    // Get selected seats
    const selectedSeats = checkout?.seats.filter(seat => 
        checkout.tickets.some(ticket => ticket.seatNumber === seat.seatNumber)
    ) || [];

    const handleConfirm = () => {
        // Navigate to checkout page
        if (account) {
            router.push("/booking/checkout");
        } else {
            router.push("/booking/sign-in");
        }
    };

    if (!checkout || !movie || !showtime) {
        return (
            <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No booking information found</h2>
                    <p className="text-gray-500 mb-6">Please start your booking from the movies page.</p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-6 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
                    >
                        Go to Movies
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="relative py-14 bg-[#0b1727] text-white min-h-screen">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 text-center text-blue-300">Confirm Your Booking</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Movie Details Section */}
                    <div className="bg-[#17233a] rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-blue-300">Movie Details</h2>
                        <div className="flex flex-col gap-4">
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                            />
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">{movie.title} ({movie.year})</h3>
                                <p className="text-gray-300">
                                    <span className="font-semibold">Director:</span> {movie.director}
                                </p>
                                <p className="text-gray-300">
                                    <span className="font-semibold">Genre:</span> {movie.genres.join(", ")}
                                </p>
                                <p className="text-gray-300">
                                    <span className="font-semibold">Rating:</span> {movie.rating}
                                </p>
                                <p className="text-gray-400 text-sm">{movie.description}</p>
                                <div className="pt-2 border-t border-gray-600">
                                    <p className="text-gray-300">
                                        <span className="font-semibold">Showtime:</span> {showtime.date} at {showtime.time}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Summary Section */}
                    <div className="bg-[#17233a] rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-blue-300">Booking Summary</h2>
                        
                        {/* Tickets Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-200">Tickets</h3>
                            <div className="space-y-2">
                                {ticketCounts.adult > 0 && (
                                    <div className="flex justify-between items-center bg-[#0b1727] px-4 py-2 rounded-md">
                                        <span className="text-gray-300">Adult × {ticketCounts.adult}</span>
                                        <span className="font-semibold">${TICKET_PRICES.adult * ticketCounts.adult}</span>
                                    </div>
                                )}
                                {ticketCounts.senior > 0 && (
                                    <div className="flex justify-between items-center bg-[#0b1727] px-4 py-2 rounded-md">
                                        <span className="text-gray-300">Senior × {ticketCounts.senior}</span>
                                        <span className="font-semibold">${TICKET_PRICES.senior * ticketCounts.senior}</span>
                                    </div>
                                )}
                                {ticketCounts.child > 0 && (
                                    <div className="flex justify-between items-center bg-[#0b1727] px-4 py-2 rounded-md">
                                        <span className="text-gray-300">Child × {ticketCounts.child}</span>
                                        <span className="font-semibold">${TICKET_PRICES.child * ticketCounts.child}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Seats Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-200">Selected Seats</h3>
                            <div className="bg-[#0b1727] px-4 py-3 rounded-md">
                                <div className="flex flex-wrap gap-2">
                                    {checkout?.seats.length > 0 ? (
                                        checkout?.seats.map((seat, index) => (
                                            <span
                                                key={index}
                                                className="inline-block bg-blue-600 text-white px-3 py-1 rounded-md font-semibold"
                                            >
                                                {seat.seatNumber}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400">No seats selected</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Total Price Section */}
                        <div className="border-t border-gray-600 pt-4 mb-6">
                            <div className="flex justify-between items-center text-xl font-bold">
                                <span>Total Price:</span>
                                <span className="text-blue-300">${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 rounded-md bg-gray-600 text-white font-bold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200 cursor-pointer"
                            >
                                Back to Seat Selection
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 px-6 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 cursor-pointer"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ConfirmBooking;
