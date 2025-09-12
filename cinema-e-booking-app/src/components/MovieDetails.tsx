'use client'

const MovieDetails = () => {
	return (
		<section className="ezy__featured7_eHXjvozM relative py-14 md:py-24 bg-white dark:bg-[#0b1727] text-zinc-900 dark:text-white z-[1]">
			<div className="container px-4">
				<div className="grid grid-cols-12 justify-center">
					<div className="col-span-12 lg:col-span-10 lg:col-start-2">
						<div className="grid grid-cols-12">
							<div className="col-span-12 md:col-span-6 md:py-12">
								<div
									className="bg-center bg-no-repeat bg-cover rounded-xl min-h-[150px] h-full"
									style={{
										backgroundImage:
											"url(https://cdn.easyfrontend.com/pictures/featured/featured_7.png)",
									}}
								></div>
							</div>
							<div className="col-span-12 md:col-span-6 pb-6 md:py-12 relative">
								<div className="bg-blue-100 dark:bg-[#1E2735] absolute -top-[10%] right-0 left-0 bottom-0 md:top-0 md:-left-[20%] rounded-xl rotate-180 -z-[1]"></div>
								<div className="p-6 lg:p-14 mb-12">
									<h4 className="text-2xl font-bold mb-4">Product Design</h4>
									<p>
										Assumenda non repellendus distinctio nihil dicta sapiente,
										quibusdam maiores, illum at, aliquid blanditiis eligendi
										qui.Assumenda non repellendus distinctio nihil dicta
										sapiente, quibusdam maiores, illum at, aliquid blanditiis
										eligendi qui.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default MovieDetails;