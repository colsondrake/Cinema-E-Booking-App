"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// lightweight id generator to avoid extra dependency
const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
import { useAccount } from "../../context/AccountContext";

// Signup page: create account form
const SignupPage = () => {
  const router = useRouter();
  const { createAccount } = useAccount();

  // Required fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subPromo, setSubPromo] = useState(false);
  const [address, setAddress] = useState({ street: "", city: "", state: "", postalCode: "", country: "" });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (e: string) => {
    return /^\S+@\S+\.\S+$/.test(e);
  };
  const validatePassword = (p: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(p);
  };

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Error handling
    if (!firstName || !lastName) {
      setError("Please provide your first and last name.");
      setIsSubmitting(false);
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase and a digit.");
      setIsSubmitting(false);
      return;
    }

    // build account object
    const account: any = {
      firstName,
      lastName,
      email,
      password,
      address: address.street || address.city || address.postalCode
        ? {
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          }
        : undefined,
    };

    const result = await createAccount(account as any);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message || "Failed to create account. Please try again.");
      return;
    }

    // Route to login page on success
    router.push("/create-account/check-verification");
  };

  return (
    <>
      <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-12 justify-center mb-6 md:mb-12">
            <div className="col-span-12 lg:col-span-6 lg:col-start-4 text-center">
                <h2 className="text-3xl md:text-[45px] font-bold mb-6">Create Account</h2>
                {error && <div className="text-red-400 mb-4">Error: {error}</div>}
                <form onSubmit={handleSubmit}>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white"
                    required
                  />
                  <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="ml-4 px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white"
                      required
                  />
                  <div className="mt-4">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password (min 8 chars; include uppercase, lowercase, and a minimum of one digit)"
                        className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white"
                        required
                    />
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={subPromo} onChange={(e) => setSubPromo(e.target.checked)} />
                        <span className="cursor-pointer">Subscribe to promotions (optional)</span>
                    </label>
                  </div>

                  {/* Optional addresses */}
                  <div className="mt-6 grid grid-cols-1 gap-4">
                    <div>
                        <h4 className="mb-2">Address (optional)</h4>
                        <input value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="Street" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white mb-2" />
                        <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="City" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white mb-2" />
                        <input value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} placeholder="Postal code" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white" />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-center">
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-md cursor-pointer">
                      {isSubmitting ? "Creating…" : "Create Account"}
                    </button>
                    <button type="button" onClick={() => router.push('/login')} className="px-6 py-2 bg-[#17233a] hover:bg-blue-600 rounded-md border border-gray-700 cursor-pointer">Already have an account? Login</button>
                  </div>
                </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SignupPage;
