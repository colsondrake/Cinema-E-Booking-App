'use client';

import Booking from "@/components/Booking";
import SeatSelection from "@/components/SeatSelection";

export default function Page() {
    return (
        <section className="bg-[#0b1727] text-white min-h-screen py-4">
            <div className="container mx-auto px-4 flex flex-row gap-10 items-center">
                <div className="flex">
                    <SeatSelection />
                </div>
                <div className="flex-1 w-full">
                    <Booking />
                </div>
            </div>
        </section>
    );
}