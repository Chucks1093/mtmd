import { ArrowUpRight } from 'lucide-react';

function Hero() {
	return (
		<section className="md:min-h-screen min-h-auto  relative overflow-hidden  ">
			<img
				src="/images/box-lines.png"
				className="absolute w-full h-full inset-0 opacity-70 pointer-events-none hidden"
				alt=""
			/>
			<div className="max-w-7xl mx-auto px-6 lg:px-8 ">
				<div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center md:mt-0 mt-[16vh] md:mb-0 mb-6">
					{/* Left Side - Text Content */}
					<div className="space-y-5">
						{/* Main Heading with Highlighted Words */}
						<div className="w-fit flex items-center gap-2  px-4 py-2 bg-gray-50 border border-gray-300 text-gray-600 rounded-full text-xs font-medium md:tracking-wider ">
							REPORT, TRACK, IMPROVE
						</div>
						<h1 className="text-5xl md:text-[3.7rem] tracking-[-.08em] md:tracking-tight font-medium text-gray-700 font-space-grotesk">
							<span className="block">National Tiolet</span>
							<span className="block">Campaign</span>
						</h1>

						{/* Description */}
						<p className="text-sm md:text-lg font-inter tracking-tight text-gray-500 leading-relaxed max-w-md">
							This initiative encourage citizes to report the conditon of
							there houshold toilet as part of the nationwide effort to
							eradicate open defecation and promote proper sanitation
							practices.
						</p>

						{/* CTA Buttons */}
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
							<a href="#report">
								<button className="flex py-3.5 px-7 rounded-md justify-center items-center gap-1 bg-green-600 text-white hover:bg-gray-800 shadow-sm">
									Send a Report
									<ArrowUpRight className="size-6 text-white transition-colors" />
								</button>
							</a>
							<a href="#donation">
								<button className="py-3.5 px-7 rounded-md border-2 border-gray-300 text-gray-500 bg-white hover:border-green-600 hover:text-green-600">
									Support a Ward
								</button>
							</a>
						</div>
					</div>

					{/* Right Side - Image and Buttons */}
					<div className="relative md:h-screen h-auto">
						<img
							className="w-full h-full inset-0  absolute"
							src="/images/noise.png"
							alt=""
						/>
						<img
							className="w-full rounded-xl h-[25rem] md:h-full object-cover"
							src="/images/hero.jpg"
							alt=""
						/>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Hero;
