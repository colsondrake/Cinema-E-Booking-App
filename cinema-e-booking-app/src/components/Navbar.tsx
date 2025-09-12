'use client'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faSearch } from "@fortawesome/free-solid-svg-icons";

const ButtonMenu = () => (
	<ul className="flex items-center justify-center mb-2 lg:mb-0">
		<li>
			<button className="bg-blue-600 text-white hover:bg-opacity-90 rounded-lg px-4 py-2">
				<FontAwesomeIcon icon={faShoppingCart} />
			</button>
			<button className="bg-blue-600 text-white hover:bg-opacity-90 rounded-lg px-4 py-2 ml-2">
				<FontAwesomeIcon icon={faSearch} />
			</button>
		</li>
	</ul>
);

const AuthNavMenu = () => (
	<>
        <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-1.5 px-4 rounded">
            Sign Up
        </button>
        <button className="border border-blue-600 bg-blue-600 text-white hover:bg-opacity-90 py-1.5 px-4 rounded">
            Login
        </button>
	</>
);

const Navbar = () => {
	return (
		<div className="ezy__nav5_hKJMDKOc py-6 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white relative">
			<nav>
				<div className="container px-4">
					<div className="flex items-center justify-between">
						<a className="font-black text-3xl min-w-[33%]" href="#!">
							{" "}
							LOGO{" "}
						</a>
						<button
							className="block lg:hidden cursor-pointer h-10 z-20"
							type="button"
							id="hamburger"
						>
							<div className="h-0.5 w-7 bg-black dark:bg-white -translate-y-2" />
							<div className="h-0.5 w-7 bg-black dark:bg-white" />
							<div className="h-0.5 w-7 bg-black dark:bg-white translate-y-2" />
						</button>
						<div
							className="flex flex-col lg:flex-row justify-center lg:justify-between items-center text-3xl gap-6 lg:text-base lg:gap-2 absolute h-screen w-screen top-0 left-full lg:left-0 lg:relative lg:h-auto lg:w-auto bg-white dark:bg-[#0b1727] lg:bg-transparent grow"
							id="navbar"
						>

							<ButtonMenu />
                          
                          	<AuthNavMenu />
							
						</div>
					</div>
				</div>
			</nav>
		</div>
	);
};

export default Navbar