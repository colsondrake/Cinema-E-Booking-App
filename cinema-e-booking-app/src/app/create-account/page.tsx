"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// lightweight id generator to avoid extra dependency
const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
import { useAccount } from "../../context/AccountContext";
import NavBar from "@/components/Navbar";

// Signup page: create account form
const SignupPage = () => {
  const router = useRouter();
  const { createAccount } = useAccount();

  // Required fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Optional fields
  const [hasCard, setHasCard] = useState(false);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [billing, setBilling] = useState({ street: "", city: "", state: "", postalCode: "", country: "" });
  const [home, setHome] = useState({ street: "", city: "", state: "", postalCode: "", country: "" });

  const [error, setError] = useState<string | null>(null);

  const validateEmail = (e: string) => {
    return /^\S+@\S+\.\S+$/.test(e);
  };

  const handleSubmit = (ev?: React.FormEvent) => {
    ev?.preventDefault();
    setError(null);
    if (!firstName || !lastName) {
      setError("Please provide your first and last name.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const account = {
      firstName,
      lastName,
      email,
      password,
      paymentCards: hasCard
        ? [
            {
              id: genId(),
              cardholderName: cardHolder || `${firstName} ${lastName}`,
              cardNumber: cardNumber,
              expiry: expiry,
              cvv: cvv,
            },
          ]
        : [],
      billingAddress: billing,
      homeAddress: home,
    };

    createAccount(account as any);
    router.push("/account");
  };

  return (
    <>
        <NavBar />
        <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
        <div className="container px-4 mx-auto">
            <div className="grid grid-cols-12 justify-center mb-6 md:mb-12">
            <div className="col-span-12 lg:col-span-6 lg:col-start-4 text-center">
                <h2 className="text-3xl md:text-[45px] font-bold mb-6">Create Account</h2>
            </div>
            </div>

            <div className="max-w-2xl mx-auto bg-[#17233a] p-6 rounded-xl border border-[#17233a]">
            {error && <div className="text-red-400 mb-4">Error: {error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white"
                    required
                />
                </div>

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
                    placeholder="Password (min 6 chars)"
                    className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white"
                    required
                />
                </div>

                <div className="mt-6">
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={hasCard} onChange={(e) => setHasCard(e.target.checked)} />
                    <span className="cursor-pointer">Add payment card information (optional)</span>
                </label>
                </div>

                {hasCard && (
                <div className="mt-4 bg-[#0a1420] p-4 rounded">
                    <input
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Cardholder name"
                    className="w-full px-4 py-2 rounded-md bg-[#17233a] border border-gray-700 text-white mb-2"
                    />
                    <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9 ]/g, ""))}
                    placeholder="Card number"
                    maxLength={19}
                    className="w-full px-4 py-2 rounded-md bg-[#17233a] border border-gray-700 text-white mb-2"
                    />
                    <div className="flex gap-2">
                    <input
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="px-4 py-2 rounded-md bg-[#17233a] border border-gray-700 text-white w-1/2"
                    />
                    <input
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        placeholder="CVV"
                        maxLength={4}
                        className="px-4 py-2 rounded-md bg-[#17233a] border border-gray-700 text-white w-1/2"
                    />
                    </div>
                </div>
                )}

                {/* Optional addresses */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="mb-2">Billing Address (optional)</h4>
                    <input value={billing.street} onChange={e => setBilling({ ...billing, street: e.target.value })} placeholder="Street" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white mb-2" />
                    <input value={billing.city} onChange={e => setBilling({ ...billing, city: e.target.value })} placeholder="City" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white mb-2" />
                    <input value={billing.postalCode} onChange={e => setBilling({ ...billing, postalCode: e.target.value })} placeholder="Postal code" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white" />
                </div>

                <div>
                    <h4 className="mb-2">Home Address (optional)</h4>
                    <input value={home.street} onChange={e => setHome({ ...home, street: e.target.value })} placeholder="Street" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white mb-2" />
                    <input value={home.city} onChange={e => setHome({ ...home, city: e.target.value })} placeholder="City" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white mb-2" />
                    <input value={home.postalCode} onChange={e => setHome({ ...home, postalCode: e.target.value })} placeholder="Postal code" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white" />
                </div>
                </div>

                <div className="mt-6 flex gap-3 justify-center">
                <button type="submit" onClick={handleSubmit} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-md cursor-pointer">Create Account</button>
                <button type="button" onClick={() => router.push('/login')} className="px-6 py-2 bg-[#17233a] hover:bg-blue-600 rounded-md border border-gray-700 cursor-pointer">Already have an account? Login</button>
                </div>
            </form>
            </div>
        </div>
        </section>
    </>
  );
};

export default SignupPage;
