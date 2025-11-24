"use client";

import { useAccount } from "@/context/AccountContext";
import { useCheckout } from "@/context/CheckoutContext";
import { useMovie } from "@/context/MovieContext";

export default function Test() {

    const { movie, showtime } = useMovie();
    const { checkout } = useCheckout();
    const { account } = useAccount();

    return (
        <div className="h-screen bg-black flex flex-col w-75 border-l-2 gap-10 p-3">
            <div className="h-50 overflow-y-auto border p-2">
            <pre>Movie: {JSON.stringify(movie, null, 2)}</pre>
            </div>
            <div className="h-50 overflow-y-auto border p-2">
            <pre>Showtime: {JSON.stringify(showtime, null, 2)}</pre>
            </div>
            <div className="h-50 overflow-y-auto border p-2">
            <pre>Checkout: {JSON.stringify(checkout, null, 2)}</pre>
            </div>
            <div className="h-50 overflow-y-auto border p-2">
            <pre>Account: {JSON.stringify(account, null, 2)}</pre>
            </div>
        </div>
    );
}