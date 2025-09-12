'use client'

const MovieCategories = [
	{ label: "All", value: "", isActive: true },
	{ label: "Action", value: "Branding", isActive: false },
	{ label: "Drama", value: "Code", isActive: false },
	{ label: "Comedy", value: "Marketing", isActive: false },
	{ label: "Romance", value: "Photography", isActive: false },
	{ label: "Sci-Fi", value: "Development", isActive: false },
];

const MovieList = [
	{
		image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio12.jpg",
		title: "Movie 1",
		MovieCategories: ["Action"],
	},
	{
		image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio13.jpg",
		title: "Movie 2",
		MovieCategories: ["Drama"],
	},
	{
		image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio14.jpg",
		title: "Movie 3",
		MovieCategories: ["Comedy"],
	},
	{
		image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio15.jpg",
		title: "Movie 4",
		MovieCategories: ["Romance"],
	},
	{
		image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio16.jpg",
		title: "Movie 5",
		MovieCategories: ["Sci-Fi"],
	},
	{
		image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio17.jpg",
		title: "Movie 6",
		MovieCategories: ["Action"],
	},
	{
		image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio18.jpg",
		title: "Movie 7",
		MovieCategories: ["Comedy"],
	},
	{
		image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio19.jpg",
		title: "Movie 8",
		MovieCategories: ["Drama"],
	},
	{
		image: "https://cdn.easyfrontend.com/pictures/portfolio/portfolio20.jpg",
		title: "Movie 9",
		MovieCategories: ["Romance"],
	},
];

const Movies = () => {
	return (
		<section className="ezy__portfolio3_vcX0HacO py-14 md:py-24 bg-white dark:bg-[#0b1727] text-[#373572] dark:text-white">
			<div className="container px-4 mx-auto">
				<div className="grid grid-cols-12 justify-center mb-6 md:mb-12">
					<div className="col-span-12 lg:col-span-6 lg:col-start-4 text-center">
						<p className="mb-2">Welcome To</p>
						<h2 className="text-3xl md:text-[45px] font-bold mb-6">
							Cinema eBooking App
						</h2>
					</div>
					<div className="col-span-12 text-center mt-6">
						{MovieCategories.map((category, i) => (
							<button
								onClick={() => (category.isActive = !category.isActive)}
								className={`btn m-1 py-2 px-5 hover:bg-blue-600 hover:text-white rounded-md ${
									category.isActive && "bg-blue-600 text-white"
								}`}
								key={i}
							>
								{category.label}
							</button>
						))}
					</div>
				</div>
				<div className="grid grid-cols-6 gap-6 md:gap-y-12 text-center">
					{MovieList.map((portfolio, i) => (
						<div className="col-span-6 md:col-span-3 lg:col-span-2" key={i}>
							<div className="rounded-xl overflow-hidden">
								<img
									src={portfolio.image}
									alt={portfolio.title}
									className="max-w-[250px] h-auto rounded-xl mx-auto"
								/>
								<div className="mt-6">
									<h5 className="text-xl font-medium mb-1">
										{portfolio.title}
									</h5>
									<p className="mb-0">{portfolio.MovieCategories.join(", ")}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Movies