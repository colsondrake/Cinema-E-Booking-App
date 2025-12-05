'use client'

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { useAccount } from "@/context/AccountContext";
import type { Seat } from '@/context/CheckoutContext';
import { useMovie } from '@/context/MovieContext';

const SeatSelection = () => {
    const router = useRouter();
    const { checkout, updateCheckoutField } = useCheckout();
    const { account } = useAccount();
    const { showtime } = useMovie();

    // Currently selected seat labels (derived from checkout). Use backend labels like "A1".
    const selectedSeatIds = checkout?.seats ? checkout.seats.map(s => s.seatNumber) : [];
    // Error message
    const [error, setError] = useState<string | null>(null)
    // (Seat labels are generated per-row below.)

    // METHODS ----------------------

    // Dynamically fetched taken seats for this showtime (stored as string labels, e.g. "A1").
    const [takenSeatSet, setTakenSeatSet] = useState<string[]>([]);

    // Fast lookup for taken seat labels
    const takenSeatIds = useMemo(() => new Set(takenSeatSet), [takenSeatSet]);

    useEffect(() => {
        const fetchTakenSeats = async () => {
            try {
                // Try a list of candidate ids so we match the backend's expected id format.
                const candidates = [
                    checkout?.showtimeId,
                    showtime?.showtimeId,
                    // some APIs may expose `id` or `_id` fields
                    (showtime as any)?.id,
                    (showtime as any)?._id,
                    // older code may store selected showtime in sessionStorage
                    typeof window !== 'undefined' ? sessionStorage.getItem('selectedShowtimeId') : null,
                ].filter(Boolean).map(String);

                const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

                let found = false;
                for (const candidate of candidates) {
                    const url = `${apiBase}/api/showtimes/${candidate}/seats`;
                    try {
                        // Log the candidate we are trying
                        // eslint-disable-next-line no-console
                        console.debug('[SeatSelection] trying showtimeId ->', candidate, url);

                        const res = await fetch(url, { method: 'GET', cache: 'no-store' });
                        if (!res.ok) {
                            // eslint-disable-next-line no-console
                            console.debug('[SeatSelection] fetch failed', candidate, res.status, await res.text().catch(() => ''));
                            continue;
                        }
                        const data: unknown = await res.json();
                        const labels = Array.isArray(data) ? data.filter(l => typeof l === 'string').map(String) : [];
                        if (labels.length > 0) {
                            setTakenSeatSet(labels);
                            found = true;
                            break;
                        } else {
                            // API returned empty array for this id — keep trying other candidates
                            // eslint-disable-next-line no-console
                            console.debug('[SeatSelection] api returned empty array for', candidate);
                            continue;
                        }
                    } catch (err) {
                        // eslint-disable-next-line no-console
                        console.debug('[SeatSelection] fetch error for', candidate, err);
                    }
                }

                if (!found) {
                    // Fallback to using showtime.takenSeats from context (if preloaded)
                    const fallback = Array.isArray((showtime as any)?.takenSeats) ? (showtime as any).takenSeats.map(String) : [];
                    setTakenSeatSet(fallback);
                    // eslint-disable-next-line no-console
                    console.debug('[SeatSelection] falling back to context takenSeats', fallback);
                }
            } catch (e) {
                setTakenSeatSet([]);
            }
        };
        fetchTakenSeats();
    }, [checkout?.showtimeId, showtime?.showtimeId, showtime?.takenSeats]);

    // Helper to build a full Seat object from a label (e.g. "A1" or "3-4").
    const buildSeat = useCallback((label: string): Seat => {
        // Default values
        let rowNum = 0;
        let seatNum = '';

        if (/^\d+[-_]\d+$/.test(label)) {
            const [r, p] = label.split(/[-_]/);
            rowNum = parseInt(r, 10);
            seatNum = `${r}-${p}`;
        } else if (/^[A-Za-z]\d+$/.test(label)) {
            const letter = label[0].toUpperCase();
            const map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            rowNum = map.indexOf(letter) + 1;
            seatNum = label;
        } else {
            // fallback: put label into seatNumber and leave row 0
            seatNum = label;
        }

        // Compute a numeric seatId for internal use (1..100) when possible
        let seatId = 0;
        if (rowNum > 0) {
            const posMatch = label.match(/\d+$/);
            const pos = posMatch ? parseInt(posMatch[0], 10) : 0;
            seatId = (rowNum - 1) * 10 + pos;
        }

        return {
            seatId,
            row: rowNum,
            seatNumber: seatNum,
            isBooked: false,
        };
    }, []);

    // Toggle seat selection if not taken. Uses backend label (e.g. "A1").
    const toggleSeat = useCallback((seatLabel: string) => {
        if (!checkout || takenSeatIds.has(seatLabel)) return;
        const isSelected = selectedSeatIds.includes(seatLabel);
        const seats = isSelected
            ? checkout.seats.filter(s => s.seatNumber !== seatLabel)
            : [...checkout.seats, buildSeat(seatLabel)];

        updateCheckoutField('seats', seats);
    }, [checkout, selectedSeatIds, updateCheckoutField, takenSeatIds, buildSeat]);

    // Helper to build seat button.
    const renderSeat = (label: string, displayLabel?: string) => {
        const isSelected = selectedSeatIds.includes(label);
        const isTaken = takenSeatIds.has(label);
        const base = 'h-10 w-10 flex items-center justify-center text-xs font-medium rounded-md border transition-colors duration-150';
        const state = isTaken
            ? 'bg-red-700 text-white border-red-800 cursor-not-allowed opacity-70'
            : isSelected
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-500 cursor-pointer'
                : 'bg-[#0b1727] text-white border-gray-700 hover:bg-blue-600 hover:text-white cursor-pointer';
        return (
            <button
                key={label}
                type="button"
                disabled={isTaken}
                onClick={() => toggleSeat(label)}
                className={`${base} ${state}`}
                aria-pressed={isSelected}
                aria-label={`Seat ${label}${isTaken ? ' (Taken)' : ''}`}
            >
                {displayLabel ?? label}
            </button>
        );
    };

    const handleSubmit = () => {
        setError(null);
        if (checkout?.seats.length != checkout?.tickets.length) {
            setError("Number of seats selected must match number of tickets.");
            return
        }
        if (account) router.push("/booking/checkout");
        else router.push("/booking/sign-in")
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
                {Array.from({ length: 10 }, (_, rowIndex) => {
                    const rowLetter = String.fromCharCode('A'.charCodeAt(0) + rowIndex);
                    const left = Array.from({ length: 5 }, (_, i) => `${rowLetter}${i + 1}`);
                    const right = Array.from({ length: 5 }, (_, i) => `${rowLetter}${i + 6}`);
                    return (
                        <div key={rowIndex} className="flex flex-row items-center gap-4 justify-center">
                            <div className="flex flex-row gap-2">{left.map(l => renderSeat(l))}</div>
                            <div className="w-8 h-10 flex items-center justify-center">
                                {rowIndex === 0 && (
                                    <span className="text-[10px] text-gray-500 rotate-90 select-none">WALKWAY</span>
                                )}
                            </div>
                            <div className="flex flex-row gap-2">{right.map(l => renderSeat(l))}</div>
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
                    <span className="text-blue-300">{checkout?.seats.map(s => s.seatNumber).join(', ')}</span>
                </div>
                <div className="flex flex-row justify-between gap-10 mt-2 text-lg font-bold text-center">
                    <button
                        onClick={() => (router.push("/booking/ticket-selection"))}
                        className="flex-1 px-6 py-3 rounded-md bg-gray-600 text-white font-bold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200 cursor-pointer"
                    >
                        Back to Ticket Selection
                    </button>
                    <button
                        className="flex-1 px-6 py-3 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 cursor-pointer"
                        onClick={handleSubmit}
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;