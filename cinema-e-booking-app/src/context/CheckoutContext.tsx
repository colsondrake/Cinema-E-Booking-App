"use client";

import React, { createContext, useContext, useState } from "react";
import { PaymentCard } from "@/context/AccountContext";

export type Seat = {
  seatId: number;
  row: number;
  seatNumber: string;
  isBooked: boolean;
}
export type Ticket = {
  ticketType: string;
  seatNumber: string;
}

export type Checkout = {
  name: string | null;
  email: string | null;
  card: PaymentCard | null;
  showtimeId: string | null;
  userId: string | null;
  tickets: Ticket[];
  seats: Seat[];
}

type CheckoutContextType = {
  checkout: Checkout;
  setCheckout: React.Dispatch<React.SetStateAction<Checkout>>;
  updateCheckoutField: <K extends keyof Checkout>(field: K, value: Checkout[K]) => void;
  submitCheckout: (chk: Checkout) => Promise<{ success: boolean; message?: string; booking?: any }>;
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);


export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [checkout, setCheckout] = useState<Checkout>({
    name: null,
    email: null,
    card: null,
    showtimeId: null,
    userId: null,
    tickets: [],
    seats: [],
  });

  const updateCheckoutField = <K extends keyof Checkout>(field: K, value: Checkout[K]) => {
    setCheckout((prev) => {
      if (!prev) return prev; // No checkout to update yet
      return { ...prev, [field]: value };
    });
  };

  const submitCheckout = async (chk: Checkout): Promise<{ success: boolean; message?: string; booking?: any }> => {
    try {
      // Basic validation
      if (!chk) return { success: false, message: "No checkout data provided" };
      if (!chk.showtimeId) return { success: false, message: "Missing showtimeId" };
      if (!chk.tickets || chk.tickets.length === 0) return { success: false, message: "No tickets selected" };

      // Map frontend Checkout to backend BookingRequestDTO shape
      // Backend expects enum names (ADULT, SENIOR, CHILD). Convert frontend
      // ticketType values (e.g. "adult") to uppercase before sending.
      // Build a robust tickets array: prefer ticket.seatNumber, fall back to seats[] if needed.
      const ticketsPayload = chk.tickets.map((t, idx) => {
        let seatNumber = t.seatNumber;
        if ((!seatNumber || seatNumber === "") && chk.seats && chk.seats[idx]) {
          seatNumber = chk.seats[idx].seatNumber;
        }
        return {
          seatNumber: String(seatNumber || ""),
          ticketType: String(t.ticketType || "").toUpperCase(),
        };
      });

      const payload: any = {
        showtimeId: String(chk.showtimeId),
        userId: chk.userId || undefined,
        contactName: chk.name || undefined,
        contactEmail: chk.email || undefined,
        tickets: ticketsPayload,
      };

      // Include payment card info if available (backend supports PaymentCardDTO)
      if (chk.card) {
        payload.paymentCard = {
          cardNumber: String(chk.card.cardNumber || "").replace(/\s+/g, ""),
          expiry: chk.card.expiry || undefined,
          cvv: chk.card.cvv || undefined,
          id: chk.card.id || undefined,
        };
      }

      // Remove undefined keys to avoid unnecessary backend validation failures
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || "http://localhost:8080";
      const url = apiBase.replace(/\/$/, "") + "/api/bookings";

      // Debug: log payload (avoid logging full card numbers in production)
      // eslint-disable-next-line no-console
      console.debug("submitCheckout -> POST", url, { payload: { ...payload, paymentCard: payload.paymentCard ? { ...payload.paymentCard, cardNumber: payload.paymentCard.cardNumber ? "****REDACTED****" : undefined } : undefined } });

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Try to surface backend validation messages
        const msg = (json && (json.error || json.message)) || `Server returned ${res.status}`;
        return { success: false, message: msg };
      }

      // On success return booking object (backend response)
      return { success: true, booking: json };
    } catch (e: any) {
      console.warn("submitCheckout error", e);
      return { success: false, message: e?.message || String(e) };
    }
  };

  return (
    <CheckoutContext.Provider value={{ checkout, setCheckout, updateCheckoutField, submitCheckout }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
};

export default CheckoutContext;
