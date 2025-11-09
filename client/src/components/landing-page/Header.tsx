import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navLinks = [
		{ name: 'ABOUT', href: '#about' },
		{ name: 'SERVICES', href: '#services' },
		{ name: 'REVIEWS', href: '#reviews' },
		{ name: 'BLOGS', href: '#blogs' },
	];

	return (
		<motion.header
			className="fixed top-0 left-0 w-full bg-white shadow-sm z-50"
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5, ease: 'easeOut' }}
		>
			<div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
				<div className="flex items-center justify-between h-20">
					{/* Logo */}
					<motion.a
						href="/"
						className="flex items-center gap-2"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center">
							<img
								className="w-6 h-6 opacity-90"
								src="/icons/logo.svg"
								alt="Logo"
							/>
						</div>
					</motion.a>

					{/* Center Navigation - Desktop */}
					<nav className="hidden lg:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
						{navLinks.map((link, index) => (
							<motion.a
								key={link.name}
								href={link.href}
								className="text-sm font-medium text-gray-700 hover:text-[#0D2B56] transition-colors font-space-grotesk"
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.1 * index + 0.3 }}
								whileHover={{ scale: 1.05, y: -2 }}
								whileTap={{ scale: 0.95 }}
							>
								{link.name}
							</motion.a>
						))}
					</nav>

					{/* Contact Button */}
					<motion.a
						href="#contact"
						className="hidden md:block"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<button className="flex py-2.5 px-4 justify-center items-center gap-1 bg-gray-700 text-white hover:bg-gray-800 shadow-sm text-sm rounded-md">
							CONTACT US
							<ArrowUpRight className="size-5 text-white transition-colors" />
						</button>
					</motion.a>

					{/* Mobile Menu Button */}
					<motion.button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="lg:hidden p-2 text-gray-900 hover:text-[#0D2B56] transition-colors"
						aria-label="Toggle menu"
						whileTap={{ scale: 0.9 }}
					>
						<AnimatePresence mode="wait">
							{isMenuOpen ? (
								<motion.div
									key="close"
									initial={{ rotate: -90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: 90, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<X size={24} />
								</motion.div>
							) : (
								<motion.div
									key="menu"
									initial={{ rotate: 90, opacity: 0 }}
									animate={{ rotate: 0, opacity: 1 }}
									exit={{ rotate: -90, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<Menu size={24} />
								</motion.div>
							)}
						</AnimatePresence>
					</motion.button>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{isMenuOpen && (
						<motion.nav
							className="lg:hidden py-6 border-t border-gray-200 bg-white overflow-hidden"
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3, ease: 'easeInOut' }}
						>
							<div className="flex flex-col gap-4">
								{navLinks.map((link, index) => (
									<motion.a
										key={link.name}
										href={link.href}
										className="text-sm font-medium text-gray-700 hover:text-[#0D2B56] transition-colors py-2"
										onClick={() => setIsMenuOpen(false)}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.3, delay: index * 0.1 }}
										whileTap={{ scale: 0.95 }}
									>
										{link.name}
									</motion.a>
								))}
								<motion.div
									className="mt-4 pt-4 border-t border-gray-200"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.4 }}
								>
									<a href="#contact">
										<button className="flex py-3.5 justify-center items-center gap-1 bg-gray-700 text-white hover:bg-blue-800 shadow-sm rounded-md">
											CONTACT US
											<ArrowUpRight className="size-6 text-white transition-colors" />
										</button>
									</a>
								</motion.div>
							</div>
						</motion.nav>
					)}
				</AnimatePresence>
			</div>
		</motion.header>
	);
}

export default Header;
