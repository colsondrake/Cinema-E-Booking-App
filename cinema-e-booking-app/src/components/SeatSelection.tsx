'use client'

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import type { Seat } from '@/context/CheckoutContext';
import { useMovie } from '@/context/MovieContext';

const SeatSelection = () => {
    const router = useRouter();
    const { checkout, updateCheckoutField } = useCheckout();
    const { showtime } = useMovie();

    // Currently selected seat ids (derived from checkout).
    const selectedSeatIds = checkout?.seats ? checkout.seats.map(s => s.seatId) : [];
    // Error message
    const [error, setError] = useState<string | null>(null)
    // All seat ids 1..100.
    const seatNumbers = useMemo(() => Array.from({ length: 100 }, (_, i) => i + 1), []);

    // METHODS ----------------------

    // Dynamically fetched taken seats for this showtime (stored as Seat[]).
    const [takenSeatSet, setTakenSeatSet] = useState<Seat[]>([]);

    // Fast lookup for taken seat ids
    const takenSeatIds = useMemo(() => new Set(takenSeatSet.map(s => s.seatId)), [takenSeatSet]);

    // Helper: parse backend seat label to Seat
    const parseSeatLabel = useCallback((label: string): Seat | null => {
        // Supported formats: "row-position" (e.g., "3-4") or letter+number (e.g., "A1")
        let row: number | null = null;
        let pos: number | null = null;

        // Try numeric format row-position
        if (/^\d+[-_]\d+$/.test(label)) {
            const [r, p] = label.split(/[-_]/);
            row = parseInt(r, 10);
            pos = parseInt(p, 10);
        } else if (/^[A-Za-z]\d+$/.test(label)) {
            const letter = label[0].toUpperCase();
            const map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            row = map.indexOf(letter) + 1; // A=1, B=2, ...
            pos = parseInt(label.slice(1), 10);
        }

        if (!row || !pos) return null;
        if (row < 1 || row > 10 || pos < 1 || pos > 10) return null;

        const seatId = (row - 1) * 10 + pos;
        return {
            seatId,
            row,
            seatNumber: `${row}-${pos}`,
            isBooked: true,
        };
    }, []);

    useEffect(() => {
        const fetchTakenSeats = async () => {
            try {
                // Determine showtime id from checkout or movie context
                const showtimeId = (checkout?.showtimeId ?? showtime?.showtimeId) ?? null;
                if (!showtimeId) {
                    setTakenSeatSet([]);
                    return;
                }

                const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
                const url = `${apiBase}/api/showtimes/${String(showtimeId)}/seats`;

                const res = await fetch(url, { method: 'GET', cache: 'no-store' });
                if (!res.ok) {
                    setTakenSeatSet([]);
                    return;
                }
                const data: unknown = await res.json();
                // Expecting string[] of labels from backend
                const labels = Array.isArray(data) ? data : [];
                const seats: Seat[] = labels
                    .map((lbl) => (typeof lbl === 'string' ? parseSeatLabel(lbl) : null))
                    .filter((s): s is Seat => !!s);

                setTakenSeatSet(seats);
            } catch (e) {
                setTakenSeatSet([]);
            }
        };
        fetchTakenSeats();
    }, [checkout?.showtimeId, showtime?.showtimeId, parseSeatLabel]);

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
        if (!checkout || takenSeatIds.has(seatId)) return;
        const isSelected = selectedSeatIds.includes(seatId);
        const seats = isSelected
            ? checkout.seats.filter(s => s.seatId !== seatId)
            : [...checkout.seats, buildSeat(seatId)];

        updateCheckoutField('seats', seats);
    }, [checkout, selectedSeatIds, updateCheckoutField, takenSeatIds, buildSeat]);

    // Helper to build seat button.
    const renderSeat = (num: number) => {
        const isSelected = selectedSeatIds.includes(num);
        const isTaken = takenSeatIds.has(num);
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