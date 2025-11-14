import React, { useEffect, useState } from 'react';
import partnerService, { type Partner } from '@/services/partner.service';

const PartnersSection: React.FC = () => {
	const [partners, setPartners] = useState<{ name: string; icon: string }[]>(
		[]
	);
	const [loading, setLoading] = useState(true);

	// Duplicate partners array for seamless loop
	const duplicatedPartners = [
		...partners,
		...partners,
		...partners,
		...partners,
	];

	// Fetch partners data
	useEffect(() => {
		const fetchPartners = async () => {
			try {
				setLoading(true);
				const result = await partnerService.getPublicPartners();

				if (result.success && result.data.partners.length > 0) {
					// Transform partner data to match expected structure
					const transformedPartners = result.data.partners.map(
						(partner: Partner) => ({
							name: partner.name,
							icon: partner.logo,
						})
					);
					setPartners(transformedPartners);
				}
			} catch (err) {
				console.error('Failed to fetch partners:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchPartners();
	}, []);

	// Don't render if loading or no partners
	if (loading) {
		return (
			<section className="text-gray-100 my-16">
				<div className="max-w-6xl mx-auto py-12 px-2 md:px-12 md:rounded-2xl">
					<div className="text-center mb-10">
						<h1 className="text-2xl md:text-5xl font-montserrat font-semibold text-gray-700">
							Sponsors & Partners
						</h1>
						<p className="text-sm w-[90%] mx-auto first-line:md:text-md mt-4 text-gray-500">
							We are proud to have the support of incredible
							organizations that share our vision of leveling up careers
						</p>
					</div>
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
						<span className="ml-3 text-gray-600">
							Loading partners...
						</span>
					</div>
				</div>
			</section>
		);
	}

	if (partners.length === 0) {
		return null;
	}

	return (
		<section className="text-gray-100 py-[5rem]  bg-[#ecf1ed]">
			<div className="max-w-6xl mx-auto py-12 px-2 md:px-12 md:rounded-2xl">
				{/* Header */}
				<div className="w-fit flex items-center gap-2 mx-auto px-4 py-2 border border-gray-300 text-gray-600 rounded-full text-xs font-medium ">
					OUR PARTNERS
				</div>
				<h1 className="text-gray-700 tracking-tight font-space-grotesk text-[1.8rem] md:text-[3rem] font-semibold mt-3 text-center">
					Working with leading organizations
					<br />
					improving Nigeria's sanitation
				</h1>

				{/* Scrolling Partners Container */}
				<div className="relative overflow-hidden mt-12">
					{/* Gradient overlays for smooth fade */}
					<div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-[#ecf1ed] to-transparent z-10 pointer-events-none" />
					<div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-[#ecf1ed] to-transparent z-10 pointer-events-none" />

					{/* Scrolling container */}
					<div className="flex animate-scroll">
						{duplicatedPartners.map((partner, index) => (
							<div
								key={index}
								className="flex-shrink-0 mx-2 md:mx-5 group cursor-pointer "
							>
								<div className="relative p-4 rounded-xl transition-all duration-300">
									{/* Partner Icon */}
									<div className="text-center min-h-[5rem] flex flex-col justify-center items-center ">
										<div className="flex justify-center items-center mb-2   py-4 bg-white gap-4 px-10 rounded-2xl">
											<img
												src={partner.icon}
												alt={partner.name}
												className="size-12 rounded-full  object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0"
											/>
											<h2 className="font-space-grotesk tracking-tighter text-zinc-700 text-2xl font-semibold">
												{partner.name}
											</h2>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default PartnersSection;
