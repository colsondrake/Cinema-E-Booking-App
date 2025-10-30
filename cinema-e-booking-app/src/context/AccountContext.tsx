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
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // for demo only; do NOT store plaintext passwords in production
  paymentCards?: PaymentCard[];
  address?: Address;
};

type AccountContextType = {
  account: Account | null;
  createAccount: (acc: Account) => Promise<{ success: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAccount: (
    patch: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: Address;
      newPassword?: string;
      currentPassword?: string;
      subscribeToPromotions?: boolean;
    }
  ) => Promise<{ success: boolean; message?: string }>;
  addCard: (card: PaymentCard) => Promise<{ success: boolean; message?: string }>; // returns success and optional message
  requestPasswordReset?: (email: string) => Promise<{ success: boolean; message: string }>;
  changePassword?: (
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ) => Promise<{ success: boolean; message?: string }>;
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

  const persistAccount = (acc: Account | null) => {
    if (!acc) return;
    const safeToStore: Account = {
      ...acc,
      paymentCards: (acc.paymentCards || []).map((c) => ({
        ...c,
        cardNumber: maskCardNumber(c.cardNumber),
        cvv: undefined,
      })),
    } as Account;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeToStore));
    } catch (e) {
      console.warn("Failed to persist account to sessionStorage", e);
    }
  };

  const detectCardType = (num: string): string => {
    const digits = (num || "").replace(/\D/g, "");
    if (/^4/.test(digits)) return "VISA";
    if (/^(5[1-5])/.test(digits)) return "MASTERCARD";
    if (/^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) return "MASTERCARD";
    if (/^(34|37)/.test(digits)) return "AMEX";
    if (/^(6(?:011|5))/.test(digits)) return "DISCOVER";
    return "UNKNOWN";
  };

  const createAccount = async (acc: Account): Promise<{ success: boolean; message?: string }> => {
    try {
      // Map frontend Account to expected registration DTO
      const payload: any = {
        firstName: acc.firstName,
        lastName: acc.lastName,
        email: acc.email,
        password: acc.password,
        confirmPassword: acc.password, // frontend doesn't ask separately
        // only include phone if present
        phone: (acc as any).phone || undefined,
        // map postalCode -> zipCode to match backend Address model
        address: acc.address
          ? {
              street: acc.address.street,
              city: acc.address.city,
              state: acc.address.state,
              zipCode: (acc.address as any).postalCode || (acc.address as any).zipCode || "",
              country: acc.address.country || undefined,
            }
          : undefined,
        subscribeToPromotions: false,
      };

      // Remove undefined properties so backend won't validate empty phone
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const res = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Try to parse JSON error message and return it
        try {
          const err = await res.json();
          // If validation errors are present, synthesize a message
          if (err && err.errors && Array.isArray(err.errors)) {
            const messages = err.errors.map((e: any) => e.defaultMessage || e.message).join("; ");
            return { success: false, message: messages };
          }
          if (err && err.error) return { success: false, message: err.error };
          if (err && err.message) return { success: false, message: err.message };
        } catch (e) {
          console.warn("Create account failed, status:", res.status);
        }
        return { success: false, message: `Server returned ${res.status}` };
      }

      // If backend returns created user, use it; otherwise use submitted account
      let created: Account | null = null;
      try {
        const json = await res.json();
        // backend may return full user object or wrapper; try to find sensible fields
        if (json) {
          created = {
            firstName: json.firstName || acc.firstName,
            lastName: json.lastName || acc.lastName,
            email: json.email || acc.email,
            password: acc.password,
            paymentCards: acc.paymentCards || [],
            address: json.address || acc.address,
          } as Account;
        }
      } catch (e) {
        // no json body: fallback
        created = acc;
      }

      // Persist to sessionStorage (mask card numbers before storing)
      const maskCardNumber = (num?: string) => {
        if (!num) return "";
        const digits = num.replace(/\D/g, "");
        if (digits.length <= 4) return digits;
        return "**** **** **** " + digits.slice(-4);
      };

      const safeToStore: Account = {
        ...(created || acc),
        paymentCards: (created?.paymentCards || acc.paymentCards || []).map((c) => ({
          ...c,
          cardNumber: maskCardNumber(c.cardNumber),
        })),
      } as Account;

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeToStore));
      } catch (e) {
        console.warn("Failed to persist account to sessionStorage", e);
      }

      setAccount(created || acc);
      return { success: true };
    } catch (e) {
      console.warn("createAccount error", e);
      return { success: false, message: String(e) };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      if (!res.ok) {
        // Try to parse structured error message from backend and throw it so callers can display it
        let msg = `Server returned ${res.status}`;
        try {
          const err = await res.json();
          if (err) {
            if (Array.isArray(err.errors)) {
              msg = err.errors.map((e: any) => e.defaultMessage || e.message).join('; ');
            } else if (err.error) {
              msg = err.error;
            } else if (err.message) {
              msg = err.message;
            }
          }
        } catch (e) {
          // ignore JSON parse errors and fall back to status
        }
        throw new Error(msg);
      }

      const json = await res.json();

      // Map server response to frontend Account shape
      const backendCards: any[] = Array.isArray(json.paymentCards) ? json.paymentCards : [];
      const mappedCards: PaymentCard[] = backendCards.map((c) => ({
        id: c.id || (c.lastFourDigits ? `card-${c.lastFourDigits}` : String(Math.random()).slice(2)),
        cardholderName: c.cardholderName || c.cardholderName || "",
        // store masked card number based on returned lastFourDigits
        cardNumber: c.cardNumber || (c.lastFourDigits ? `**** **** **** ${c.lastFourDigits}` : ""),
        expiry: c.expiryDate || c.expiry || "",
      }));

      const backendAddress = json.address || json.home_address || null;
      const mappedAddress: Address | undefined = backendAddress
        ? {
            street: backendAddress.street || backendAddress.addressLine || "",
            city: backendAddress.city || "",
            state: backendAddress.state || "",
            postalCode: backendAddress.zipCode || backendAddress.postalCode || "",
            country: backendAddress.country || "",
          }
        : undefined;

      const acc: Account = {
        id: json.id || "",
        firstName: json.firstName || "",
        lastName: json.lastName || "",
        email: json.email || email,
        password: password, // demo only
        paymentCards: mappedCards,
        address: mappedAddress,
      };

      // Persist masked cards and account to sessionStorage
      const safeToStore: Account = {
        ...acc,
        paymentCards: (acc.paymentCards || []).map((c) => ({ ...c, cardNumber: maskCardNumber(c.cardNumber) })),
      };

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeToStore));
      } catch (e) {
        console.warn("Failed to persist account to sessionStorage", e);
      }

      setAccount(acc);
      return true;
    } catch (e) {
      // Log and re-throw so callers (pages/components) can present the error message to users.
      console.warn("login error", e);
      throw e;
    }
  };

  const logout = () => {
    setAccount(null);
    // keep stored account in sessionStorage but clear current session representation
    // Alternatively remove storage entirely: sessionStorage.removeItem(STORAGE_KEY);
  };

  const updateAccount = async (
    patch: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: Address;
      newPassword?: string;
      currentPassword?: string;
      subscribeToPromotions?: boolean;
    }
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!account || !account.id) {
        return { success: false, message: "No user session found" };
      }

      // Build UserProfileDTO payload
      const payload: any = {
        firstName: patch.firstName,
        lastName: patch.lastName,
        phone: patch.phone,
        subscribeToPromotions: patch.subscribeToPromotions,
      };

      if (patch.address) {
        payload.homeAddress = {
          street: patch.address.street || "",
          city: patch.address.city || "",
          state: patch.address.state || "",
          zipCode: (patch.address as any).zipCode || patch.address.postalCode || "",
          country: patch.address.country || undefined,
        };
      }

      if (patch.newPassword && patch.newPassword.trim().length > 0) {
        payload.newPassword = patch.newPassword.trim();
        if (!patch.currentPassword || patch.currentPassword.trim().length === 0) {
          return { success: false, message: "Current password is required to change password" };
        }
      }

      // Remove undefined keys
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      let url = `http://localhost:8080/api/users/${encodeURIComponent(account.id)}/profile`;
      if (payload.newPassword) {
        url += `?currentPassword=${encodeURIComponent(patch.currentPassword as string)}`;
      }

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": account.id,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Try to surface backend validation messages
        let msg = (json && (json.error || json.message)) || `Server returned ${res.status}`;
        if (Array.isArray(json?.errors)) {
          msg = json.errors.map((e: any) => e.defaultMessage || e.message).join('; ');
        }
        return { success: false, message: msg };
      }

      // Update local account with returned user data and/or provided patch
      const userResp = json?.user || {};
      const updated: Account = {
        ...(account as Account),
        firstName: userResp.firstName ?? patch.firstName ?? (account as Account).firstName,
        lastName: userResp.lastName ?? patch.lastName ?? (account as Account).lastName,
        email: userResp.email ?? (account as Account).email,
        // We don't store phone in Account type; ignore for now.
        address: patch.address ? { ...(account as Account).address, ...patch.address } : (account as Account).address,
        // Do not store plaintext passwords; if changed successfully, clear local password for safety.
        password: payload.newPassword ? "" : (account as Account).password,
      } as Account;

      setAccount(updated);
      persistAccount(updated);
      return { success: true, message: (json && (json.message || "Profile updated successfully")) || "Profile updated successfully" };
    } catch (e: any) {
      return { success: false, message: e?.message || "Failed to update profile" };
    }
  };

  const addCard = async (card: PaymentCard): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!account || !account.id) {
        return { success: false, message: "No user session found" };
      }
      const currentCards = account.paymentCards || [];
      if (currentCards.length >= 4) {
        return { success: false, message: "Maximum of 3 cards reached" };
      }

      // Build payload for backend PaymentCard model
      const digits = (card.cardNumber || "").replace(/\D/g, "");
      if (digits.length < 12) {
        return { success: false, message: "Card number appears invalid" };
      }
      const payload: any = {
        cardholderName: card.cardholderName,
        cardNumber: digits,
        expiryDate: card.expiry, // backend expects expiryDate per controller usage
        cardType: detectCardType(digits),
      };

      const res = await fetch(`http://localhost:8080/api/users/${encodeURIComponent(account.id)}/payment-cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": account.id,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (json && (json.error || json.message)) || `Server returned ${res.status}`;
        return { success: false, message: msg };
      };

      // Expect shape { message, card: { id, cardType, lastFourDigits, expiryDate, cardholderName } }
      const serverCard = (json && json.card) || {};
      const added: PaymentCard = {
        id: serverCard.id || card.id || `${Date.now()}`,
        cardholderName: serverCard.cardholderName || card.cardholderName,
        cardNumber: serverCard.lastFourDigits
          ? `**** **** **** ${serverCard.lastFourDigits}`
          : maskCardNumber(card.cardNumber),
        expiry: serverCard.expiryDate || card.expiry,
      };

      const updated: Account = {
        ...(account as Account),
        paymentCards: [...currentCards, added],
      };
      setAccount(updated);
      persistAccount(updated);
      return { success: true, message: json?.message || "Payment card added" };
    } catch (e: any) {
      return { success: false, message: e?.message || "Failed to add card" };
    }
  };

  // Request a password reset email for the provided address
  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("http://localhost:8080/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = (json && (json.error || json.message)) || (res.status === 404 ? "Email not found" : `Server returned ${res.status}`);
        return { success: false, message: msg };
      }
      return { success: true, message: (json && (json.message || "Password reset email sent")) || "Password reset email sent" };
    } catch (e: any) {
      return { success: false, message: e?.message || "Failed to request password reset" };
    }
  };

  // Directly call backend change-password endpoint (for logged-in flows)
  const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/${encodeURIComponent(userId)}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, message: (json && (json.error || json.message)) || `Server returned ${res.status}` };
      }
      return { success: true, message: (json && json.message) || "Password changed successfully" };
    } catch (e: any) {
      return { success: false, message: e?.message || "Failed to change password" };
    }
  };

  return (
    <AccountContext.Provider value={{ account, createAccount, login, logout, updateAccount, addCard, requestPasswordReset, changePassword }}>
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
