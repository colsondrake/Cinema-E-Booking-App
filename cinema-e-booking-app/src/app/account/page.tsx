"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, PaymentCard } from "../../context/AccountContext";
import AccountNavbar from "@/components/AccountNavbar";

const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;

const AccountPage = () => {
  const router = useRouter();
  const { account, updateAccountField, updateAccount, addCard, logout } = useAccount();

  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (!account) {
    return (
        <>
            <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
                <div className="container px-4 mx-auto text-center">
                    <p className="mb-4">No account signed in.</p>
                </div>
            </section>
        </>
    );
  }

    const handleSave = async () => {
        setError(null);
        setSaveMessage(null);
        const result = await updateAccount(account);
        if (!result.success) {
            setError(result.message || "Failed to update profile");
        } else {
            setSaveMessage(result.message || "Profile updated successfully");
        }
    };

    const handleAddCard = async () => {
        setError(null);
        if (!account) return;
        const digits = cardNumber.replace(/\D/g, "");
        if (!cardHolder || digits.length < 12 || !/^\d{2}\/\d{2}$/.test(expiry)) {
            setError("Please enter a valid card holder, card number, and expiry (MM/YY)");
            return;
        }
        const newCard: PaymentCard = {
            id: genId(),
            cardholderName: cardHolder,
            cardNumber: digits,
            expiry,
            cvv,
        };
        const result = await addCard(newCard);
        if (!result.success) {
            setError(result.message || "Failed to add card");
            return;
        }
        // Clear inputs on success
        setCardHolder("");
        setCardNumber("");
        setExpiry("");
        setCvv("");
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
        <section className="py-14 md:py-24 bg-[#0b1727] text-white min-h-screen">
        <div className="container px-4 mx-auto">
            <div className="grid grid-cols-14 justify-center mb-6 md:mb-12">
            <div className="col-span-12 lg:col-span-6 lg:col-start-4 text-center">
                <h2 className="text-3xl md:text-[45px] font-bold mb-6">Account Details</h2>
            </div>
            </div>

            <div className="mx-auto mb-10 w-[770px] flex justify-center">
                <AccountNavbar />
            </div>

            <div className="max-w-3xl mx-auto bg-[#17233a] p-6 rounded-xl border border-[#17233a]">
            {/* {error && <div className="text-red-400 mb-4">{error}</div>} */}
            {saveMessage && <div className="text-green-400 mb-4">{saveMessage}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={account.firstName} onChange={e => updateAccountField("firstName", e.target.value)} placeholder="First name" className="px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white" />
                <input value={account.lastName} onChange={e => updateAccountField("lastName", e.target.value)} placeholder="Last name" className="px-4 py-2 rounded-md bg-[#0b1727] border border-gray-700 text-white" />
            </div>

            

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <h4 className="mb-2">Address</h4>
                <input value={account?.address?.street} onChange={() => {}} placeholder="Street" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white mb-2" />
                <input value={account?.address?.city} onChange={() => {}} placeholder="City" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white mb-2" />
                <input value={account?.address?.postalCode} onChange={() => {}} placeholder="Postal code" className="w-full px-3 py-2 rounded bg-[#17233a] border border-gray-700 text-white" />
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
                    </div>
                ))}
                </div>

                {account.paymentCards != undefined && account.paymentCards.length < 4 && (
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
            <div className="mt-6">
            <label className="flex items-center gap-2">
                <input type="checkbox" checked={account.isSubscribedToPromotions} onChange={(e) => updateAccountField("isSubscribedToPromotions", e.target.checked)} />
                <span className="cursor-pointer">Subscribe to promotions (optional)</span>
            </label>
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
