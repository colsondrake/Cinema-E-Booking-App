"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

// Types for account data
export type PaymentCard = {
  id: string; // local id
  cardholderName: string;
  cardNumber: string; // stored masked when persisted
  expiry: string; // MM/YY
  cvv?: string;
};

export type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Account = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; 
  isLoggedIn: boolean;
  emailVerified: boolean;
  isActive: boolean;
  role: string;
  paymentCards?: PaymentCard[];
  address?: Address;
  isSubscribedToPromotions: boolean;
};

type AccountContextType = {
  account: Account | null;
  updateAccountField: <K extends keyof Account>(field: K, value: Account[K]) => void;
  createAccount: (acc: Account) => Promise<{ success: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAccount: (acc: Account) => Promise<{ success: boolean; message?: string }>;
  addCard: (card: PaymentCard) => Promise<{ success: boolean; message?: string }>; // returns success and optional message
  deleteCard: (cardId: string)=> Promise<{ success: boolean; message?: string }>
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Helper to mask card number when persisting
const maskCardNumber = (num: string) => {
  const digits = num.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return "**** **** **** " + digits.slice(-4);
};

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);

  // Function to update a single field in the account
  const updateAccountField = <K extends keyof Account>(field: K, value: Account[K]) => {
    setAccount((prev) => {
      if (!prev) return prev; // No account to update yet
      return { ...prev, [field]: value };
    });
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

  const createAccount = async (
    acc: Account
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // Map frontend Account to expected registration DTO
      const payload: any = {
        firstName: acc.firstName,
        lastName: acc.lastName,
        email: acc.email,
        password: acc.password,
        confirmPassword: acc.password,
        phone: (acc as any).phone || undefined,
  
        // ✅ backend expects "homeAddress" with "zipCode"
        homeAddress: acc.address
          ? {
              street: acc.address.street,
              city: acc.address.city,
              state: acc.address.state,
              zipCode: acc.address.postalCode, // map postalCode -> zipCode
              country: acc.address.country,
            }
          : undefined,
  
        subscribeToPromotions: acc.isSubscribedToPromotions ?? false,
      };
  
      // Remove undefined properties so backend won't validate empty phone/homeAddress
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );
  
      const res = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        // Try to parse JSON error message and return it
        try {
          const err = await res.json();
          if (err && err.errors && Array.isArray(err.errors)) {
            const messages = err.errors
              .map((e: any) => e.defaultMessage || e.message)
              .join("; ");
            return { success: false, message: messages };
          }
          if (err && err.error) return { success: false, message: err.error };
          if (err && err.message) return { success: false, message: err.message };
        } catch (e) {
          console.warn("Create account failed, status:", res.status);
        }
        return { success: false, message: `Server returned ${res.status}` };
      }
  
      let created: Account | null = null;
  
      try {
        const json: any = await res.json();
  
        const backendAddr =
          json.homeAddress || json.address || json.home_address || null;
  
        const mappedAddress = backendAddr
          ? {
              street: backendAddr.street ?? acc.address?.street ?? "",
              city: backendAddr.city ?? acc.address?.city ?? "",
              state: backendAddr.state ?? acc.address?.state ?? "",
              postalCode:
                backendAddr.postalCode ??
                backendAddr.zipCode ??
                acc.address?.postalCode ??
                "",
              country: backendAddr.country ?? acc.address?.country ?? "",
            }
          : acc.address;
  
        created = {
          id: json.id || acc.id || "",
          firstName: json.firstName || acc.firstName,
          lastName: json.lastName || acc.lastName,
          email: json.email || acc.email,
          password: acc.password,
  
          // session flags
          isLoggedIn: true,
          emailVerified: json.emailVerified ?? false,
          isActive: json.isActive ?? true,
          role: json.role || "USER",
  
          // address + promos
          address: mappedAddress,
          isSubscribedToPromotions:
            json.isSubscribedToPromotions ??
            acc.isSubscribedToPromotions ??
            false,
  
          paymentCards: acc.paymentCards || [],
        };
      } catch (e) {
        // No JSON body or parse error – fall back to what user entered
        created = {
          ...(acc as Account),
          id: acc.id || "",
          isLoggedIn: true,
          emailVerified: false,
          isActive: true,
          role: acc.role || "USER",
        };
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

      console.log("LOGIN JSON:", json);
      console.log("LOGIN paymentCards:", json.paymentCards);
      
      // Map server response to frontend Account shape
      const backendCards: any[] = Array.isArray(json.paymentCards) ? json.paymentCards : [];
      const mappedCards: PaymentCard[] = backendCards.map((c) => ({
        id: c.id || (c.lastFourDigits ? `card-${c.lastFourDigits}` : String(Math.random()).slice(2)),
        cardholderName: c.cardholderName || "",
        cardNumber: c.cardNumber || (c.lastFourDigits ? `**** **** **** ${c.lastFourDigits}` : ""),
        expiry: c.expiryDate || c.expiry || "",
      }));
      
      // 🔧 normalize homeAddress (object OR string)
      const rawAddr = json.homeAddress || json.address || json.home_address || null;
      
      let backendAddress: any = null;
      
      if (rawAddr) {
        if (typeof rawAddr === "string") {
          // try to parse "Street, City ZIP"
          const [streetPart, cityZipPart] = rawAddr.split(",").map((p) => p.trim());
          let city = "";
          let zip = "";
      
          if (cityZipPart) {
            const parts = cityZipPart.split(/\s+/);
            if (parts.length >= 2) {
              zip = parts.pop() || "";
              city = parts.join(" ");
            } else {
              city = cityZipPart;
            }
          }
      
          backendAddress = {
            street: streetPart || rawAddr,
            city,
            state: "",
            zipCode: zip,
            country: "",
          };
        } else {
          backendAddress = rawAddr;
        }
      }
      
      const acc: Account = {
        id: json.id || "",
        firstName: json.firstName || "",
        lastName: json.lastName || "",
        email: json.email || email,
        password,
        isLoggedIn: true,
        emailVerified: true,
        isActive: true,
        role: json.role || "",
        paymentCards: mappedCards,
        isSubscribedToPromotions: json.subscribeToPromotions ?? false,
      
        address: backendAddress
          ? {
              street: backendAddress.street ?? "",
              city: backendAddress.city ?? "",
              state: backendAddress.state ?? "",
              postalCode:
                backendAddress.postalCode ??
                backendAddress.zipCode ??
                "",
              country: backendAddress.country ?? "",
            }
          : undefined,
      };
      
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
  };

  const updateAccount = async (acc: Account): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!account || !account.id) {
        return { success: false, message: "No user session found" };
      }

      // Build UserProfileDTO payload
      const payload: any = {
        firstName: acc.firstName,
        lastName: acc.lastName,
        phone: undefined,
        homeAddress: acc.address
          ? {
              street: acc.address.street,
              city: acc.address.city,
              state: acc.address.state,
              zipCode: acc.address.postalCode,
              country: acc.address.country,
            }
          : undefined,
        newPassword: undefined,
        subscribeToPromotions: acc.isSubscribedToPromotions,
      };

      // Remove undefined keys
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      let url = `http://localhost:8080/api/users/${encodeURIComponent(account.id)}/profile`;

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
      return { success: true, message: json?.message || "Payment card added" };
    } catch (e: any) {
      return { success: false, message: e?.message || "Failed to add card" };
    }
  };

  const deleteCard = async (cardId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!account || !account.id) {
        return { success: false, message: "No user session found" };
      }
  
      const res = await fetch(
        `http://localhost:8080/api/users/${encodeURIComponent(account.id)}/payment-cards/${encodeURIComponent(cardId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": account.id,
          },
        }
      );
  
      const json = await res.json().catch(() => ({} as any));
  
      if (!res.ok) {
        const msg = (json && (json.error || json.message)) || `Server returned ${res.status}`;
        return { success: false, message: msg };
      }
  
      // Update local account state
      const currentCards = account.paymentCards || [];
      const remaining = currentCards.filter((c) => c.id !== cardId);
      setAccount({
        ...(account as Account),
        paymentCards: remaining,
      });
  
      return { success: true, message: json.message || "Payment card removed" };
    } catch (e: any) {
      return { success: false, message: e?.message || "Failed to delete payment card" };
    }
  };
  

  return (
    <AccountContext.Provider value={{ account, updateAccountField, createAccount, login, logout, updateAccount, addCard, deleteCard }}>
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
