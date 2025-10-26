'use client';

import AuthLayout from "@/components/AuthLayout";
import InputField from "@/components/InputField";
import Navbar from "@/components/Navbar";

export default function forgotPassword() {
    return (
        <>
            <Navbar />
            <AuthLayout title="Forgot Password">
                
                <form className="space-y-6">
                    <InputField
                        label="Enter your email address to reset you password"
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="Enter your email"
                        />

                    <button
                        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg 
                         hover:bg-blue-600 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 font-medium transition-colors">
                        Submit
                    </button>
                </form>
            </AuthLayout>
        </>
    )
}