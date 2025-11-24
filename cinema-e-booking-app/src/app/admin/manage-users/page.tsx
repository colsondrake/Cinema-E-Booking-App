"use client";

import { redirect } from "next/navigation";
import { useAccount } from "@/context/AccountContext";


export default function AdminUsersPage() {
  
  const { account } = useAccount();
  if (account?.role != "ADMIN") {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen bg-[#0b1727] items-center justify-center">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
        <p className="text-zinc-700 dark:text-zinc-300">This section is coming soon.</p>
      </div>
    </main>
  );
}
