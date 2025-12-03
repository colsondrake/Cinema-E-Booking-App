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
  showtimeId: number | null;
  userId: string | null;
  tickets: Ticket[];
  seats: Seat[];
}

type CheckoutContextType = {
  checkout: Checkout;
  setCheckout: React.Dispatch<React.SetStateAction<Checkout>>;
  updateCheckoutField: <K extends keyof Checkout>(field: K, value: Checkout[K]) => void;
  submitCheckout: (chk: Checkout) => Promise<{ success: boolean; message?: string }>;
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

  const submitCheckout = async (chk: Checkout): Promise<{ success: boolean; message?: string }> => {
    // Map frontend Checkout to expected ____ DTO
    try {
      const payload: any = {

      }




      return { success: true };
    } catch (e) {
      console.warn("createAccount error", e);
      return { success: false, message: String(e) };
    }
  }

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
