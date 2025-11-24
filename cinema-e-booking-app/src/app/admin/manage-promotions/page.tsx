"use client";

import { redirect } from "next/navigation";
import { useAccount } from "@/context/AccountContext";


export default function AdminPromotionsPage() {
  
  const { account } = useAccount();
  if (account?.role != "ADMIN") {
    redirect("/");
  }
  
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold mb-2">Manage Promotions</h1>
        <p className="text-zinc-700 dark:text-zinc-300">This section is coming soon.</p>
      </div>
    </main>
  );
}
