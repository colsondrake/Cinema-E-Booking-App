'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/context/AccountContext";

/**
 * Booking functional component
 * Manages state for movie, showtime, ticket selection, food selection, and user info.
 */
const Checkout = () => {
    const router = useRouter();
    const { account } = useAccount();

    // State to track if booking is submitted
    const [submitted, setSubmitted] = useState(false);
    /**
     * Handles form submission for booking.
     * Sets submitted state to true to show confirmation.
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true); 
    };

    useEffect(() => {
        if (submitted == true) {
            router.push("/checkout/thank-you");
        }
    }, [submitted])

    return (
        <>
            {/* Navigation bar */}
                <div className="w-full max-w-2xl bg-[#17233a] rounded-xl shadow-lg p-8">
                    {/* Booking header */}
                    <h2 className="text-2xl font-bold mb-6 text-center text-blue-300">Checkout</h2>
                    {/* Show different form depending on whether or not the user is signed into an account or not. */}
                    {account ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">



                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">



                            </div>
                        </form>
                    )}
                </div>
        </>
    );
}

// Export Checkout component as default
export default Checkout;