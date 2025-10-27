"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Types for account data
export type PaymentCard = {
  id: string; // local id
  cardholderName: string;
  cardNumber: string; // stored masked when persisted
  expiry: string; // MM/YY
  cvv?: string;
};

export type Address = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type Account = {
  firstName: string;
  lastName: string;
  email: string;
  password: string; // for demo only; do NOT store plaintext passwords in production
  paymentCards?: PaymentCard[];
  billingAddress?: Address;
  homeAddress?: Address;
};

type AccountContextType = {
  account: Account | null;
  createAccount: (acc: Account) => Promise<boolean>;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateAccount: (patch: Partial<Account>) => void;
  addCard: (card: PaymentCard) => boolean; // returns false if max reached
  removeCard: (cardId: string) => void;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const STORAGE_KEY = "cinema_account";

// Helper to mask card number when persisting
const maskCardNumber = (num: string) => {
  const digits = num.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return "**** **** **** " + digits.slice(-4);
};

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);

  // useEffect(() => {
  //   // load from sessionStorage if present
  //   try {
  //     const raw = sessionStorage.getItem(STORAGE_KEY);
  //     if (raw) {
  //       const parsed: Account = JSON.parse(raw);
  //       setAccount(parsed);
  //     }
  //   } catch (e) {
  //     console.warn("Failed to load account from storage", e);
  //   }
  // }, []);

  // const persist = (acc: Account | null) => {
  //   try {
  //     if (acc) {
  //       // mask card numbers before persisting
  //       const safe = { ...acc, paymentCards: acc.paymentCards?.map(c => ({ ...c, cardNumber: maskCardNumber(c.cardNumber) })) };
  //       sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  //     } else {
  //       sessionStorage.removeItem(STORAGE_KEY);
  //     }
  //   } catch (e) {
  //     console.warn("Failed to persist account", e);
  //   }
  // };

  const createAccount = async (acc: Account): Promise<boolean> => {
    // Prepare payload expected by backend User model
    const payload: any = {
      // backend expects a single name field; combine first and last
      name: `${acc.firstName || ""} ${acc.lastName || ""}`.trim(),
      email: acc.email,
      password: acc.password,
      // include addresses or payment cards if backend supports them
      billingAddress: acc.billingAddress,
      homeAddress: acc.homeAddress
    };

    try {
      const res = await fetch("http://localhost:8080/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Optionally read error body for debugging
        const err = await res.json().catch(() => null);
        console.warn("Registration failed", err || res.statusText);
        return false;
      }

      // Successful registration — keep local account state for the session
      setAccount(acc);
      // persist(acc);
      return true;
    } catch (e) {
      console.warn("Failed to register user", e);
      return false;
    }
  };

  const login = (email: string, password: string) => {
    // For now, check against stored account in sessionStorage
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const stored: Account = JSON.parse(raw);
      if (stored.email.toLowerCase() === email.toLowerCase() && stored.password === password) {
        setAccount(stored);
        return true;
      }
    } catch (e) {
      console.warn("Login check failed", e);
    }
    return false;
  };

  const logout = () => {
    setAccount(null);
    // keep stored account in sessionStorage but clear current session representation
    // Alternatively remove storage entirely: sessionStorage.removeItem(STORAGE_KEY);
  };

  const updateAccount = (patch: Partial<Account>) => {
    setAccount(prev => {
      const updated = { ...((prev as Account) || {}), ...patch } as Account;
      // persist(updated);
      return updated;
    });
  };

  const addCard = (card: PaymentCard) => {
    if (!account) return false;
    const existing = account.paymentCards || [];
    if (existing.length >= 3) return false;
    const updated: Account = { ...account, paymentCards: [...existing, card] };
    setAccount(updated);
    // persist(updated);
    return true;
  };

  const removeCard = (cardId: string) => {
    if (!account) return;
    const updated: Account = { ...account, paymentCards: (account.paymentCards || []).filter(c => c.id !== cardId) };
    setAccount(updated);
    // persist(updated);
  };

  return (
    <AccountContext.Provider value={{ account, createAccount, login, logout, updateAccount, addCard, removeCard }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
};

export default AccountContext;
