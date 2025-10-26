'use client'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const AuthNavMenu = () => (
	<div className="flex items-center space-x-2">
		<Link href="/shopping-cart">
			<button className="bg-blue-600 text-white hover:bg-opacity-90 rounded-lg px-4 py-2 cursor-pointer">
				<FontAwesomeIcon icon={faShoppingCart} />
			</button>
		</Link>
		<Link href="/profile">
			<button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-1.5 px-4 rounded cursor-pointer">
				Profile
			</button>
		</Link>
		<Link href="/signup">
			<button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-1.5 px-4 rounded cursor-pointer">
				Sign Up
			</button>
		</Link>
		<Link href="/login">
			<button className="border border-blue-600 bg-blue-600 text-white hover:bg-opacity-90 py-1.5 px-4 rounded ml-2 cursor-pointer">
				Login
			</button>
		</Link>
	</div>
);

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