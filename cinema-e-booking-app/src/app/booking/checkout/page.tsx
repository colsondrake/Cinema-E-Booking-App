'use client';

import Checkout from "@/components/Checkout";

export default function Page() {
    return (
        <section className="bg-[#0b1727] text-white min-h-screen py-4">
            <div className="container mx-auto px-4 flex flex-row justify-center gap-10 items-center">
                <div className="flex flex-1 flex-col w-full">
                    <Checkout />
                </div>
            </div>
        </section>
    );
}