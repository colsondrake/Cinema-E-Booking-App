"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, PaymentCard } from "../../context/AccountContext";
import NavBar from "@/components/Navbar";
import AccountNavbar from "@/components/AccountNavbar";

const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;

const AccountPage = () => {
  const router = useRouter();
  const { account, updateAccount, addCard, removeCard, logout } = useAccount();

  // Local editable copy of the account fields
  const [firstName, setFirstName] = useState(account?.firstName || "");
  const [lastName, setLastName] = useState(account?.lastName || "");
  const [email, setEmail] = useState(account?.email || "");
  const [password, setPassword] = useState(account?.password || "");

  const [address, setAddress] = useState(account?.address || { street: "", city: "", state: "", postalCode: "", country: "" });

  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [error, setError] = useState<string | null>(null);

  if (!account) {
    return (
        <>
            <NavBar />
            <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
                <div className="container px-4 mx-auto text-center">
                    <p className="mb-4">No account signed in.</p>
                </div>
            </section>
        </>
    );
  }

  const handleSave = () => {
    setError(null);
    updateAccount({ firstName, lastName, email, password, address: address } as any);
  };

  const handleAddCard = () => {
    setError(null);
        // validate and sanitize inputs
        const digits = cardNumber.replace(/\D/g, "");
        // simple validations: card length roughly 13-16, expiry MM/YY, cvv 3-4
        if (digits.length < 13 || digits.length > 16) { setError("Card number must be between 13 and 16 digits."); return; }
        if (!/^\d{2}\/\d{2}$/.test(expiry)) { setError("Expiry must be in MM/YY format."); return; }
        const mm = parseInt(expiry.split('/')[0], 10);
        if (mm < 1 || mm > 12) { setError("Expiry month must be between 01 and 12."); return; }
        if (!/^[0-9]{3,4}$/.test(cvv)) { setError("CVV must be 3 or 4 digits."); return; }

        // store masked card number for display (demo only) and do not persist CVV
        const masked = digits.length <= 4 ? digits : `**** **** **** ${digits.slice(-4)}`;
        const card: PaymentCard = { id: genId(), cardholderName: cardHolder || `${firstName} ${lastName}`, cardNumber: masked, expiry };
        const ok = addCard(card);
        if (!ok) setError("Maximum 3 cards allowed.");
        else {
            setCardHolder(""); setCardNumber(""); setExpiry(""); setCvv("");
        }
  };

    // Formatting helpers for inputs
    const formatCardNumber = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        // group into 4s
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0,4);
        if (digits.length <= 2) return digits;
        return `${digits.slice(0,2)}/${digits.slice(2)}`;
    };


  return (
    <>
        <NavBar />
        <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
        <div className="container px-4 mx-auto">
            <div className="grid grid-cols-12 justify-center mb-6 md:mb-12">
            <div className="col-span-12 lg:col-span-6 lg:col-start-4 text-center">
                <h2 className="text-3xl md:text-[45px] font-bold mb-6">Account Details</h2>
            </div>
            </div>

            <div className="mx-auto mb-10 w-[770px] flex justify-center">
                <AccountNavbar />
            </div>

            <div className="max-w-3xl mx-auto bg-[#17233a] p-6 rounded-xl border border-[#17233a]">
            {error && <div className="text-red-400 mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white" />
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className="px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white" />
            </div>

            <div className="mt-4">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white" />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <h4 className="mb-2">Address</h4>
                <input value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder="Street" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white mb-2" />
                <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="City" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white mb-2" />
                <input value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} placeholder="Postal code" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white" />
                </div>
            </div>

            <div className="mt-6">
                <h4 className="mb-2">Payment Cards</h4>
                <div className="grid gap-2">
                {(account.paymentCards || []).map(card => (
                    <div key={card.id} className="flex items-center justify-between bg-[#0b1727] p-3 rounded">
                    <div>
                        <div className="font-medium">{card.cardholderName}</div>
                        <div className="text-sm text-gray-300">{card.cardNumber} • {card.expiry}</div>
                    </div>
                    <div>
                        <button onClick={() => removeCard(card.id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded cursor-pointer">Remove</button>
                    </div>
                    </div>
                ))}
                </div>

                {account.paymentCards != undefined && account.paymentCards.length < 3 && (
                    <div className="mt-4 bg-[#0a1420] p-4 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="Cardholder name" className="px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white" />
                        <input value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} placeholder="Card number (1234 5678 9012 3456)" className="px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white" />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" className="px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white w-1/2" />
                        <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0,4))} placeholder="CVV" className="px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white w-1/2" />
                    </div>
                    <div className="mt-3 flex gap-2">
                        <button onClick={handleAddCard} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded cursor-pointer">Add card</button>
                        <button onClick={() => { setCardHolder(""); setCardNumber(""); setExpiry(""); setCvv(""); }} className="px-4 py-2 bg-[#17233a] hover:bg-blue-600 rounded border border-gray-700 cursor-pointer">Clear</button>
                    </div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex gap-3 justify-between">
                <div className="flex gap-2">
                <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded cursor-pointer">Save</button>
                <button onClick={() => { logout(); router.push('/'); }} className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded cursor-pointer">Logout</button>
                </div>
                <div className="text-sm text-gray-300">Signed in as <span className="font-medium">{account.email}</span></div>
            </div>
            </div>
        </div>
        </section>
    </>
  );
};

export default AccountPage;
