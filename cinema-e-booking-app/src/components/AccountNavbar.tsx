"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AccountNavbar() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-300";

  return (
    <nav className="w-full bg-[#0b1727] border-b border-gray-800 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Left: Profile */}
        <Link
          href="/account"
          className={`text-lg font-medium hover:text-blue-400 transition-colors ${isActive(
            "/account/profile"
          )}`}
        >
          Profile
        </Link>

        {/* Right: Change Password */}
        <Link
          href="/change-password"
          className={`text-lg font-medium hover:text-blue-400 transition-colors ${isActive(
            "/account/change-password"
          )}`}
        >
          Change Password
        </Link>
      </div>
    </nav>
  );
}
