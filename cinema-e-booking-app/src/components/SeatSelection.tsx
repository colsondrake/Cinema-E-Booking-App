'use client'

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import type { Seat } from '@/context/CheckoutContext';

const SeatSelection = () => {
    const router = useRouter();
    const { checkout, updateCheckoutField } = useCheckout();

    // Currently selected seat ids (derived from checkout).
    const selectedSeatIds = checkout?.seats ? checkout.seats.map(s => s.seatId) : [];
    // Error message
    const [error, setError] = useState<string | null>(null)
    // All seat ids 1..100.
    const seatNumbers = useMemo(() => Array.from({ length: 100 }, (_, i) => i + 1), []);

    // METHODS ----------------------

    // Dynamically fetched taken seats for this showtime.
    const [takenSeatSet, setTakenSeatSet] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchTakenSeats = async () => {
            if (!checkout?.showtimeId) return;
            try {
                // Fetch all bookings (assuming endpoint returns array of bookings)
                const res = await fetch(`http://localhost:8080/api/bookings`, { method: 'GET' });
                if (!res.ok) return; // Silently ignore failures
                const data = await res.json();

                // Expected shape assumption: data is an array of booking objects
                // Each booking: { showtimeId: string, tickets: [{ seatNumber: string, ticketType: string, ... }] }
                const relevant = Array.isArray(data)
                    ? data.filter(b => b && b.showtimeId === checkout.showtimeId)
                    : [];

                const seatIds: number[] = [];
                for (const booking of relevant) {
                    if (Array.isArray(booking.tickets)) {
                        for (const t of booking.tickets) {
                            if (t?.seatNumber && typeof t.seatNumber === 'string') {
                                // seatNumber format assumed 'row-position'
                                const parts = t.seatNumber.split('-');
                                if (parts.length === 2) {
                                    const row = parseInt(parts[0], 10);
                                    const pos = parseInt(parts[1], 10);
                                    if (!isNaN(row) && !isNaN(pos)) {
                                        const id = (row - 1) * 10 + pos; // inverse mapping
                                        seatIds.push(id);
                                    }
                                }
                            }
                        }
                    }
                }
                setTakenSeatSet(new Set(seatIds));
            } catch (e) {
                // Ignore errors; keep set empty
            }
        };
        fetchTakenSeats();
    }, [checkout?.showtimeId]);

    // Helper to build a full Seat object from an id.
    const buildSeat = useCallback((id: number): Seat => {
        const row = Math.floor((id - 1) / 10) + 1; // rows 1..10
        const positionInRow = ((id - 1) % 10) + 1; // position 1..10
        return {
            seatId: id,
            row,
            seatNumber: `${row}-${positionInRow}`,
            isBooked: false,
        };
    }, []);

    // Toggle seat selection if not taken.
    const toggleSeat = useCallback((seatId: number) => {
        if (!checkout || takenSeatSet.has(seatId)) return;
        const isSelected = selectedSeatIds.includes(seatId);
        const seats = isSelected
            ? checkout.seats.filter(s => s.seatId !== seatId)
            : [...checkout.seats, buildSeat(seatId)];

        updateCheckoutField('seats', seats);
    }, [checkout, selectedSeatIds, updateCheckoutField, takenSeatSet, buildSeat]);

    // Helper to build seat button.
    const renderSeat = (num: number) => {
        const isSelected = selectedSeatIds.includes(num);
        const isTaken = takenSeatSet.has(num);
        const base = 'h-10 w-10 flex items-center justify-center text-xs font-medium rounded-md border transition-colors duration-150';
        const state = isTaken
            ? 'bg-red-700 text-white border-red-800 cursor-not-allowed opacity-70'
            : isSelected
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-500 cursor-pointer'
                : 'bg-[#0b1727] text-white border-gray-700 hover:bg-blue-600 hover:text-white cursor-pointer';
        return (
            <button
                key={num}
                type="button"
                disabled={isTaken}
                onClick={() => toggleSeat(num)}
                className={`${base} ${state}`}
                aria-pressed={isSelected}
                aria-label={`Seat ${num}${isTaken ? ' (Taken)' : ''}`}
            >
                {num}
            </button>
        );
    };

    const handleSubmit = () => {
        setError(null);
        if (checkout?.seats.length != checkout?.tickets.length) {
            setError("Number of seats selected must match number of tickets.");
            return
        }
        router.push("/seat-selection/confirm")
    }

    return (
        <div className="flex flex-col gap-6 bg-[#17233a] p-6 rounded-xl border border-[#17233a] shadow">
            <h2 className="text-xl font-semibold text-center">Select {checkout?.tickets.length} Seats</h2>
            {/* Error Messages */}
            {error && (
                <div className="flex flex-row justify-center">
                    <label className="font-semibold mb-1 text-red-600">{error}</label>
                </div>
            )}

            {/* Screen */}
            <div className="flex flex-col items-center gap-1">
                <div className="w-full h-6 bg-gradient-to-b from-blue-900 to-[#0b1727] rounded-md flex items-center justify-center text-xs tracking-wide border border-blue-800">
                    SCREEN
                </div>
                <div className="flex w-full justify-between text-[10px] text-gray-400 px-1">
                    <span>EXIT</span>
                    <span>EXIT</span>
                </div>
            </div>

            {/* Seat Grid with walkway */}
            <div className="flex flex-col gap-2 mx-auto">
                {Array.from({ length: 10 }, (_, row) => {
                    const start = row * 10;
                    const left = seatNumbers.slice(start, start + 5);
                    const right = seatNumbers.slice(start + 5, start + 10);
                    return (
                        <div key={row} className="flex flex-row items-center gap-4 justify-center">
                            <div className="flex flex-row gap-2">{left.map(renderSeat)}</div>
                            <div className="w-8 h-10 flex items-center justify-center">
                                {row === 0 && (
                                    <span className="text-[10px] text-gray-500 rotate-90 select-none">WALKWAY</span>
                                )}
                            </div>
                            <div className="flex flex-row gap-2">{right.map(renderSeat)}</div>
                        </div>
                    );
                })}
                <div className="flex w-full justify-between text-[10px] text-gray-400 px-1 mt-1">
                    <span>EXIT</span>
                    <span>EXIT</span>
                </div>
            </div>

            <div className="flex flex-col justify-center mt-2 text-lg font-bold text-center">
                <div className="flex flex-row gap-1">
                    <p>Selected:</p>
                    <span className="text-blue-300">{checkout?.seats.map(s => s.seatId).join(', ')}</span>
                </div>
                <div className="flex flex-row justify-between gap-10 mt-2 text-lg font-bold text-center">
                    <button
                        onClick={() => (router.push("/booking"))}
                        className="flex-1 px-6 py-3 rounded-md bg-gray-600 text-white font-bold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200 cursor-pointer"
                    >
                        Back to Booking
                    </button>
                    <button
                        className="flex-1 px-6 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 cursor-pointer"
                        onClick={handleSubmit}
                    >
                        Confirm Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;