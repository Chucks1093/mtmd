const Footer = () => {
	const currentYear = new Date().getFullYear();

	const socialLinks = {
		meta: 'https://facebook.com',
		instagram: 'https://instagram.com',
		x: 'https://x.com',
		reddit: 'https://reddit.com',
		linkedin: 'https://linkedin.com',
	};

	return (
		<footer className="bg-white py-16 px-4">
			<div className="max-w-7xl px-6 lg:px-8 relative mx-auto text-zinc-600">
				<div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
					{/* Logo and Description Section */}
					<div className="col-span-1">
						<a href="/" className="flex items-center gap-2 mb-4">
							<div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center">
								<img
									className="w-6 h-6 opacity-90"
									src="/icons/logo.svg"
									alt="Logo"
								/>
							</div>
							<span className="text-lg font-semibold text-zinc-800">
								NTC
							</span>
						</a>

						<p className="text-gray-500 mb-6 text-sm font-space-grotesk">
							We specialize in improving sanitation infrastructure and
							public health awareness across Nigeria.
						</p>
					</div>
					{/* Quick Links */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg text-zinc-800">
							Quick Links
						</h3>
						<div className="flex flex-col space-y-3 text-sm">
							<a className="text-zinc-600 hover:text-zinc-900 transition-colors">
								Home
							</a>
							<a className="text-zinc-600 hover:text-zinc-900 transition-colors">
								Submit Report
							</a>
							<a className="text-zinc-600 hover:text-zinc-900 transition-colors">
								View Map
							</a>
							<a className="text-zinc-600 hover:text-zinc-900 transition-colors">
								Campaign Stats
							</a>
							<a className="text-zinc-600 hover:text-zinc-900 transition-colors">
								Get Involved
							</a>
						</div>
					</div>

					{/* Our Services */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg text-zinc-800">
							Our Services
						</h3>
						<div className="flex flex-col space-y-3 text-sm">
							<a className="text-zinc-600 hover:text-zinc-900 transition-colors">
								Toilet Condition Reporting
							</a>
							<a className="text-zinc-600 hover:text-zinc-900 transition-colors">
								Sanitation Data Analytics
							</a>
							<a className="text-zinc-600 hover:text-zinc-900 transition-colors">
								Community Engagement
							</a>
							<a className="text-zinc-600 hover:text-zinc-900 transition-colors">
								Policy Advisory Support
							</a>
						</div>
					</div>

					{/* Company */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg text-zinc-800">
							Company
						</h3>
						<div className="flex flex-col space-y-3 text-sm">
							<a className="text-zinc-600 hover:text-zinc-900 transition-colors">
								Terms and Conditions
							</a>
							<a className="text-zinc-600 hover:text-zinc-900 transition-colors">
								Privacy Policy
							</a>
						</div>
					</div>

					{/* Contact Us */}
					<div className="space-y-4">
						<h3 className="font-semibold text-lg text-zinc-800">
							Contact Us
						</h3>
						<div className="flex flex-col space-y-2 text-sm text-zinc-600">
							<p>info@ntcampaign.ng</p>
							<p>+234 801 234 5678</p>
							<p>123 Sanitation Drive, Abuja, Nigeria</p>
						</div>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
					<p className="text-gray-500 text-sm mb-4 md:mb-0">
						© {currentYear} National Toilet Campaign — All rights
						reserved.
					</p>

					{/* Social Media Links */}
					<div className="flex items-center gap-6 opacity-70">
						<a
							href={socialLinks.meta}
							className="text-gray-600 hover:text-gray-900 transition-colors border p-2.5 rounded-full border-zinc-600"
							aria-label="Facebook"
						>
							<img
								src="/icons/facebook.svg"
								className="size-4"
								alt="Facebook"
							/>
						</a>
						<a
							href={socialLinks.instagram}
							className="text-gray-600 hover:text-gray-900 transition-colors border p-2.5 rounded-full border-zinc-600"
							aria-label="Instagram"
						>
							<img
								src="/icons/instagram.svg"
								className="size-4"
								alt="Instagram"
							/>
						</a>
						<a
							href={socialLinks.x}
							className="text-gray-600 hover:text-gray-900 transition-colors border p-2.5 rounded-full border-zinc-600"
							aria-label="X (Twitter)"
						>
							<img
								src="/icons/x.svg"
								className="size-4"
								alt="X (Twitter)"
							/>
						</a>
						<a
							href={socialLinks.linkedin}
							className="text-gray-600 hover:text-gray-900 transition-colors border p-2.5 rounded-full border-zinc-600"
							aria-label="LinkedIn"
						>
							<img
								src="/icons/linkedIn.svg"
								className="size-4"
								alt="LinkedIn"
							/>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
