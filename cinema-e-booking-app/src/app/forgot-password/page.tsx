'use client';

import React, { useState } from 'react';
import { useAccount } from '../../context/AccountContext';

export default function ForgotPasswordPage() {
    const { requestPasswordReset } = useAccount();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }
        if (!requestPasswordReset) {
            setError('Password reset is currently unavailable.');
            return;
        }
        setLoading(true);
        const res = await requestPasswordReset(email.trim());
        setLoading(false);
        if (res.success) {
            setMessage(res.message || 'If that email exists, a reset link has been sent.');
            setEmail('');
        } else {
            setError(res.message || 'Unable to process request');
        }
    };

    return (
        <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-12 justify-center mb-6 md:mb-12">
                    <div className="col-span-12 lg:col-span-6 lg:col-start-4 text-center">
                        <p className="mb-2">Account Support</p>
                        <h2 className="text-3xl md:text-[45px] font-bold mb-2">Forgot Password</h2>
                        <p className="text-gray-300">Enter your account email to receive a password reset link.</p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="col-span-12 text-center mt-6 flex flex-col items-center gap-4">
                    <div className="flex flex-row gap-2 w-full max-w-2xl justify-center items-center">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full max-w-xs px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#17233a] border-gray-700 text-white"
                            aria-label="Email address"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-[#17233a] text-white rounded-md border border-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-200 cursor-pointer disabled:opacity-60"
                        >
                            {loading ? 'Sending…' : 'Send Reset Link'}
                        </button>
                    </div>

                    {error && <div className="text-red-400 mt-2">{error}</div>}
                    {message && <div className="text-green-400 mt-2">{message}</div>}
                </form>
            </div>
        </section>
    );
}