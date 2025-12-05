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
    const { checkout, submitCheckout, updateCheckoutField } = useCheckout();
    const { movie, showtime } = useMovie();
    const { account } = useAccount();

    // Load initial account details for checkout if present
    useEffect(() => {
        // Only write account and showtime info into checkout when it's missing
        // This prevents updateCheckoutField from causing repeated updates/re-renders
        if (!account && !showtime) return;

        if (account) {
            if (account.firstName && account.lastName) {
                if (checkout?.name !== `${account.firstName} ${account.lastName}`) {
                    updateCheckoutField("name", `${account.firstName} ${account.lastName}`);
                }
            }
            if (account.email) {
                if (checkout?.email !== account.email) updateCheckoutField("email", account.email);
            }
            if (account.paymentCards && account.paymentCards[0] != undefined) {
                // copy the first saved payment card into checkout.card only if different
                if (JSON.stringify(checkout?.card) !== JSON.stringify(account.paymentCards[0])) {
                    updateCheckoutField("card", account.paymentCards[0]);
                }
            }
            // Ensure userId is present in checkout so backend validation passes
            if (account.id) {
                if (checkout?.userId !== account.id) {
                    updateCheckoutField("userId", account.id);
                }
            }
        }

        // Set showtimeId only when it's not already set to avoid loops
        if (showtime?.showtimeId) {
            if (checkout?.showtimeId !== showtime.showtimeId) {
                updateCheckoutField("showtimeId", showtime.showtimeId);
            }
        }
    }, [account, showtime, checkout?.showtimeId, checkout?.name, checkout?.email, checkout?.card, updateCheckoutField])

    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};
        const name = (checkout?.name || "").toString();
        const email = (checkout?.email || "").toString();
        const cardNumber = (checkout?.card?.cardNumber || "").toString();
        const expiry = (checkout?.card?.expiry || "").toString();
        const cvv = (checkout?.card?.cvv || "").toString();

        if (!name.trim()) e.name = "Name is required.";
        if (!email.trim()) e.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";

        const rawCard = cardNumber.replace(/\s+/g, "");
        if (!rawCard) e.cardNumber = "Card number is required.";
        else if (!/^[0-9]{13,19}$/.test(rawCard)) e.cardNumber = "Card number must be 13–19 digits.";

        if (!expiry.trim()) e.expiry = "Expiration date is required.";
        else if (!/^(0[1-9]|1[0-2])[\/]?(\d{2}|\d{4})$/.test((expiry || "").trim())) e.expiry = "Enter a valid expiration (MM/YY or MM/YYYY).";

        if (!cvv.trim()) e.cvv = "CVV is required.";
        else if (!/^[0-9]{3,4}$/.test(cvv)) e.cvv = "CVV must be 3 or 4 digits.";

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    const handleCardInput = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 19);
        const parts = digits.match(/.{1,4}/g) || [];
        const formatted = parts.join(" ");
        const newCard = { ...(checkout?.card || {}), cardNumber: formatted, id: checkout?.card?.id ?? "" };
        updateCheckoutField("card", newCard as any);
    }

    const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        console.log("handleSubmit invoked", { checkout });
        if (!validate()) {
            console.log("validation failed", { errors });
            setErrors((prev) => ({ ...prev, submit: prev.submit || "Please fix errors above." }));
            return;
        }

        if (!checkout) return setErrors((prev) => ({ ...prev, submit: "No checkout data available." }));

        try {
            setLoading(true);
            const res = await submitCheckout(checkout);
            console.log("submitCheckout result", res);
            if (res.success) {
                setSubmitted(true);
            } else {
                setErrors((prev) => ({ ...prev, submit: res.message || "Booking failed" }));
            }
        } catch (e: any) {
            console.error("submitCheckout threw", e);
            setErrors((prev) => ({ ...prev, submit: e?.message || "Booking failed" }));
        } finally {
            setLoading(false);
        }
    }

    // ------- Effects -------
    useEffect(() => {
        if (submitted) router.push("/checkout/thank-you");
    }, [submitted, router]);


    // ------- Values -------

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

                        {/* Back Button */}
                        <button
                            type="button"
                            onClick={() => router.push("/booking/seat-selection")}
                            className="cursor-pointer -1 px-6 py-3 rounded-md bg-gray-600 text-white font-bold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
                        >
                            Back to Seat Selection
                        </button>

                    </div>

                    {/* Checkout Section */}
                    <div className="bg-[#17233a] rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-blue-300">Checkout</h2>

                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Name Input */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-200">Full Name</h3>
                                    <input
                                        type="text"
                                        value={(checkout?.name) ?? ""}
                                        onChange={(e) => updateCheckoutField("name", e.target.value)}
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
                                        value={(checkout?.email) ?? ""}
                                        onChange={(e) => updateCheckoutField("email", e.target.value)}
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
                                        value={(checkout?.card?.cardNumber) ?? ""}
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
                                        value={(checkout?.card?.expiry) ?? ""}
                                        onChange={(e) => updateCheckoutField("card", { ...(checkout?.card || {}), expiry: e.target.value, id: checkout?.card?.id ?? "" } as any)}
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
                                        value={(checkout?.card?.cvv) ?? ""}
                                        onChange={(e) => updateCheckoutField("card", { ...(checkout?.card || {}), cvv: e.target.value.replace(/\D/g, "").slice(0,4), id: checkout?.card?.id ?? "" } as any)}
                                        placeholder="123"
                                        className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white mb-4"
                                        aria-invalid={!!errors.cvv}
                                    />
                                    {errors.cvv && <p className="mt-1 text-sm text-red-400">{errors.cvv}</p>}
                                </div>

                                {/* Submit Button */}
                                {errors.submit && (
                                    <p className="col-span-2 text-sm text-red-400">{errors.submit}</p>
                                )}
                                <button
                                    type="submit"
                                    className="col-span-2 cursor-pointer flex-1 px-6 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : "Purchase Tickets"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ConfirmBooking;
