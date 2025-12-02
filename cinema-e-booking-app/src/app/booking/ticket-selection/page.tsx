'use client';

import Booking from "@/components/Booking";

export default function Page() {
    return (
        <section className="bg-[#0b1727] text-white min-h-screen py-4">
            <div className="container mx-auto px-4 flex flex-row justify-center gap-10 items-center">
                <Booking />
            </div>
        </section>
    );
}