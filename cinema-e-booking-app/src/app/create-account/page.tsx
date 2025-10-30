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
  const [subPromo, setSubPromo] = useState(false);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [billing, setBilling] = useState({ street: "", city: "", state: "", postalCode: "", country: "" });
  const [home, setHome] = useState({ street: "", city: "", state: "", postalCode: "", country: "" });

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
      billingAddress: billing.street || billing.city || billing.postalCode
        ? {
            street: billing.street,
            city: billing.city,
            state: billing.state,
            postalCode: billing.postalCode,
            country: billing.country,
          }
        : undefined,
      homeAddress: home.street || home.city || home.postalCode
        ? {
            street: home.street,
            city: home.city,
            state: home.state,
            postalCode: home.postalCode,
            country: home.country,
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
      <NavBar />
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
                        <input type="checkbox" checked={hasCard} onChange={(e) => setHasCard(e.target.checked)} />
                        <span className="cursor-pointer">Add payment card information (optional)</span>
                        <input type="checkbox" checked={subPromo} onChange={(e) => setSubPromo(e.target.checked)} />
                        <span className="cursor-pointer">Subscribe to promotions (optional)</span>
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
                    )
                  }

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
