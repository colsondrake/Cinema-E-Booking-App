"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Seat = {
  seatId: number;
}

export type Checkout = {
  ticketId: number | null;
  showtimeId: number | null;
  bookingId: number | null;
  type: string | null;
  price: number | null;
  seats: Seat[];
}

type CheckoutContextType = {
  checkout: Checkout | null;
  updateCheckoutField: <K extends keyof Checkout>(field: K, value: Checkout[K]) => void;
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);


export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [checkout, setCheckout] = useState<Checkout>({
    ticketId: null,
    showtimeId: null,
    bookingId: null,
    type: null,
    price: null,
    seats: [],
  });

  const updateCheckoutField = <K extends keyof Checkout>(field: K, value: Checkout[K]) => {
    setCheckout((prev) => {
      if (!prev) return prev; // No checkout to update yet
      return { ...prev, [field]: value };
    });
  };


  return (
    <CheckoutContext.Provider value={{ checkout, updateCheckoutField }}>
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
