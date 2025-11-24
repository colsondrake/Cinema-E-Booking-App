'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "@/context/AccountContext";

const AuthNavMenu = () => {
	const router = useRouter();
	const { account, logout } = useAccount();

	// Debug: log account so we can verify client state in the navbar
	console.log("Navbar account:", account);

	if (account?.role == "USER" || account?.role == null) {
		return (
			<div className="flex items-center space-x-2">
				<Link href="/">
					<button className="border border-blue-600 bg-blue-600 text-white hover:bg-blue-500 py-1.5 px-4 rounded ml-2 cursor-pointer">
						Home
					</button>
				</Link>
				{account == null && (
					<>
					<Link href="/create-account">
						<button className="border border-blue-600 bg-blue-600 text-white hover:bg-blue-500 py-1.5 px-4 rounded ml-2 cursor-pointer">
							Create Account
						</button>
					</Link>
					<Link href="/login">
						<button className="border border-blue-600 bg-blue-600 text-white hover:bg-blue-500 py-1.5 px-4 rounded ml-2 cursor-pointer">
							Login
						</button>
					</Link>
					</>
				)}
				{account != null && (
					<Link href="/account">
						<button className="border border-blue-600 bg-blue-600 text-white hover:bg-blue-500 py-1.5 px-4 rounded ml-2 cursor-pointer">
							Account
						</button>
					</Link>
				)}

				{/* Show Logout when an account is present */}
				{account && (
					<button
						onClick={() => {
							logout();
							router.push('/');
						}}
						className="border border-blue-600 bg-blue-600 text-white hover:bg-blue-500 py-1.5 px-4 rounded ml-2 cursor-pointer"
					>
						Logout
					</button>
				)}

				{/* Quick visual indicator for debugging: shows signed-in email when account exists */}
				{account && (
					<span className="text-xl text-gray-100 ml-2">Hello, {account.firstName}!</span>
				)}

			</div>
		);
	}
	if (account?.role == "ADMIN") {
		return (
			<div className="flex items-center space-x-2">
				<Link href="/admin">
					<button className="border border-blue-600 bg-blue-600 text-white hover:bg-blue-500 py-1.5 px-4 rounded ml-2 cursor-pointer">
						Home
					</button>
				</Link>
				{/* Show Logout when an account is present */}
				{account && (
					<button
						onClick={() => {
							logout();
							router.push('/');
						}}
						className="border border-blue-600 bg-blue-600 text-white hover:bg-blue-500 py-1.5 px-4 rounded ml-2 cursor-pointer"
					>
						Logout
					</button>
				)}

				{/* Quick visual indicator for debugging: shows signed-in email when account exists */}
				{account && (
					<span className="text-xl text-gray-100 ml-2">Hello, {account.firstName}!</span>
				)}

			</div>
		)
	}
};

const Navbar = () => {
	return (
		<div className="py-6 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white sticky top-0 z-50 shadow-md">
			<div className="flex flex-col items-center justify-center w-full">
				<Link className="font-black text-3xl mb-4" href="/">
					CINEMAGIC
				</Link>
				<AuthNavMenu />
			</div>
		</div>
	);
};

export default Navbar