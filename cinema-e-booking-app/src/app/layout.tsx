import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AccountProvider } from "../context/AccountContext";
import { CheckoutProvider } from "../context/CheckoutContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cinema E-Booking App",
  description: "CSCI 4050 Software Engineering Fall 2025 Team 1 Term Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap the entire app with AccountProvider so all pages/components can access account state */}
        <AccountProvider>
          <CheckoutProvider>
            <Navbar />
            {children}
          </CheckoutProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
