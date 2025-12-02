'use client'

import React, { useState, useEffect } from "react";
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

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");

    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isValidEmail = (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    const luhnCheck = (num: string) => {
        const digits = num.replace(/\s+/g, "").split("").reverse().map(d => parseInt(d, 10));
        if (digits.some(isNaN)) return false;
        let sum = 0;
        for (let i = 0; i < digits.length; i++) {
            let digit = digits[i];
            if (i % 2 === 1) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
        }
        return sum % 10 === 0;
    }

    const isValidExpiry = (value: string) => {
        const cleaned = value.trim();
        const mmYY = /^(0[1-9]|1[0-2])[\/]?(\d{2}|\d{4})$/;
        const m = cleaned.match(mmYY);
        if (!m) return false;
        const month = parseInt(m[1], 10);
        let year = parseInt(m[2], 10);
        if (m[2].length === 2) {
            const now = new Date();
            const prefix = Math.floor(now.getFullYear() / 100) * 100;
            year = prefix + year;
            if (year < now.getFullYear() - 80) year += 100;
        }
        const endOfMonth = new Date(year, month, 0);
        const today = new Date();
        return endOfMonth >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    const validate = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = "Name is required.";
        if (!email.trim()) e.email = "Email is required.";
        else if (!isValidEmail(email)) e.email = "Enter a valid email address.";

        const rawCard = cardNumber.replace(/\s+/g, "");
        if (!rawCard) e.cardNumber = "Card number is required.";
        else if (!/^[0-9]{13,19}$/.test(rawCard)) e.cardNumber = "Card number must be 13–19 digits.";
        else if (!luhnCheck(rawCard)) e.cardNumber = "Card number appears invalid.";

        if (!expiry.trim()) e.expiry = "Expiration date is required.";
        else if (!isValidExpiry(expiry)) e.expiry = "Enter a valid, non-expired date (MM/YY or MM/YYYY).";

        if (!cvv.trim()) e.cvv = "CVV is required.";
        else if (!/^[0-9]{3,4}$/.test(cvv)) e.cvv = "CVV must be 3 or 4 digits.";

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        if (validate()) {
            setSubmitted(true);
        }
    }

    useEffect(() => {
        if (submitted) router.push("/checkout/thank-you");
    }, [submitted, router]);

    const handleCardInput = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 19);
        const parts = digits.match(/.{1,4}/g) || [];
        setCardNumber(parts.join(" "));
    }

    // Calculate ticket counts by type
    const ticketCounts = checkout?.tickets.reduce((acc, ticket) => {
        acc[ticket.ticketType] = (acc[ticket.ticketType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    // Calculate total price
    const totalPrice = checkout?.tickets.reduce((sum, ticket) => {
        return sum + (TICKET_PRICES[ticket.ticketType] || 0);
    }, 0) || 0;

    if (!checkout || !movie || !showtime) {
        return (
            <section className="py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No booking information found</h2>
                    <p className="text-gray-500 mb-6">Please start your booking from the movies page.</p>
                    <button
                        onClick={() => router.push("/")}
                        className="cursor-pointer px-6 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer"
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
                <h1 className="text-3xl font-bold mb-8 text-center text-blue-300">Checkout</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Movie Details Section */}
                    <div className="col-span-2 bg-[#17233a] rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-blue-300">Movie Details</h2>
                        <div className="flex flex-row gap-4">
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                            />
                            <div className="space-y-2 flex flex-col justify-center">
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
                    </div>

                    {/* Checkout Section */}
                    <div className="bg-[#17233a] rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-blue-300">Checkout</h2>
                        
                        {account ? (
                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Name Input */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-200">Full Name</h3>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4"
                                            placeholder="Jane Doe"
                                            aria-invalid={!!errors.name}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                                    </div>
                                    
                                    {/* Email Input */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-200">Email Address</h3>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4"
                                            placeholder="you@example.com"
                                            aria-invalid={!!errors.email}
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                                    </div>

                                    {/* Card Number Input */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-200">Card Number</h3>
                                        <input
                                            inputMode="numeric"
                                            value={cardNumber}
                                            onChange={(e) => handleCardInput(e.target.value)}
                                            className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4"
                                            placeholder="1234 5678 9012 3456"
                                            aria-invalid={!!errors.cardNumber}
                                        />
                                        {errors.cardNumber && <p className="mt-1 text-sm text-red-400">{errors.cardNumber}</p>}
                                    </div>

                                    {/* Expiration Input */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-200">Expiration (MM/YY)</h3>
                                        <input
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                            placeholder="MM/YY or MM/YYYY"
                                            className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4"
                                            aria-invalid={!!errors.expiry}
                                        />
                                        {errors.expiry && <p className="mt-1 text-sm text-red-400">{errors.expiry}</p>}
                                    </div>

                                    {/* CVV Input */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-200">CVV</h3>
                                        <input
                                            inputMode="numeric"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0,4))}
                                            placeholder="123"
                                            className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4"
                                            aria-invalid={!!errors.cvv}
                                        />
                                        {errors.cvv && <p className="mt-1 text-sm text-red-400">{errors.cvv}</p>}
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Name Input */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-200">Full Name</h3>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4"
                                            placeholder="Jane Doe"
                                            aria-invalid={!!errors.name}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                                    </div>
                                    
                                    {/* Email Input */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-200">Email Address</h3>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4"
                                            placeholder="you@example.com"
                                            aria-invalid={!!errors.email}
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                                    </div>

                                    {/* Card Number Input */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-200">Card Number</h3>
                                        <input
                                            inputMode="numeric"
                                            value={cardNumber}
                                            onChange={(e) => handleCardInput(e.target.value)}
                                            className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4"
                                            placeholder="1234 5678 9012 3456"
                                            aria-invalid={!!errors.cardNumber}
                                        />
                                        {errors.cardNumber && <p className="mt-1 text-sm text-red-400">{errors.cardNumber}</p>}
                                    </div>

                                    {/* Expiration Input */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-200">Expiration (MM/YY)</h3>
                                        <input
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                            placeholder="MM/YY or MM/YYYY"
                                            className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4"
                                            aria-invalid={!!errors.expiry}
                                        />
                                        {errors.expiry && <p className="mt-1 text-sm text-red-400">{errors.expiry}</p>}
                                    </div>

                                    {/* CVV Input */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-200">CVV</h3>
                                        <input
                                            inputMode="numeric"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0,4))}
                                            placeholder="123"
                                            className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4"
                                            aria-invalid={!!errors.cvv}
                                        />
                                        {errors.cvv && <p className="mt-1 text-sm text-red-400">{errors.cvv}</p>}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="cursor-pointer -1 px-6 py-3 rounded-md bg-gray-600 text-white font-bold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                                    >
                                        Back to Seat Selection
                                    </button>
                                    <button
                                        type="submit"
                                        className="cursor-pointer flex-1 px-6 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
                                    >
                                        Purchase Tickets
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="col-span-2 bg-[#17233a] rounded-xl shadow-lg p-6">
                        <div className="flex flex-row gap-4 justify-center">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="cursor-pointer -1 px-6 py-3 rounded-md bg-gray-600 text-white font-bold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                            >
                                Back to Seat Selection
                            </button>
                            <button
                                type="submit"
                                className="cursor-pointer flex-1 px-6 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
                            >
                                Purchase Tickets
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ConfirmBooking;
