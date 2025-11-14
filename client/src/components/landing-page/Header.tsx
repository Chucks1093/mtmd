import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const navLinks = [
		{ name: 'DONATE', href: '#donation' },
		{ name: 'FAQ', href: '#faq' },
	];

	return (
		<header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
			<div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
				<div className="flex items-center justify-between h-20">
					{/* Logo */}
					<a href="/" className="flex items-center gap-2">
						<div className="w-10 h-10 bg-[#7fcd9050] rounded flex items-center justify-center">
							<img
								className="w-6 h-6 opacity-90"
								src="/icons/logo.svg"
								alt="Logo"
							/>
						</div>
						<h1 className="font-bold font-grotesk text-2xl text-zinc-700">
							MTMD
						</h1>
					</a>

					{/* Center Navigation - Desktop */}
					<nav className="hidden lg:flex items-center gap-8  ml-auto mr-14">
						{navLinks.map(link => (
							<a
								key={link.name}
								href={link.href}
								className="text-sm font-medium text-gray-700 hover:text-[#0D2B56] transition-colors font-space-grotesk"
							>
								{link.name}
							</a>
						))}
					</nav>

					{/* Contact Button */}
					<a href="#contact" className="hidden md:block">
						<button className="flex py-3 px-8 justify-center items-center gap-1 bg-green-600 text-white hover:bg-gray-800 shadow-sm text-sm rounded-md">
							CREATE REPORT
							<ArrowUpRight className="size-5 text-white transition-colors" />
						</button>
					</a>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="lg:hidden p-2 text-gray-900 hover:text-[#0D2B56] transition-colors"
						aria-label="Toggle menu"
					>
						{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<nav className="lg:hidden py-6 border-t border-gray-200 bg-white overflow-hidden">
						<div className="flex flex-col gap-4">
							{navLinks.map(link => (
								<a
									key={link.name}
									href={link.href}
									className="text-sm font-medium text-gray-700 hover:text-[#0D2B56] transition-colors py-2"
									onClick={() => setIsMenuOpen(false)}
								>
									{link.name}
								</a>
							))}
							<div className="mt-4 pt-4 border-t border-gray-200">
								<a href="#report">
									<button className="flex py-3.5 justify-center items-center gap-1 bg-gray-700 text-white hover:bg-blue-800 shadow-sm rounded-md">
										CREATE REPORT
										<ArrowUpRight className="size-6 text-white transition-colors" />
									</button>
								</a>
							</div>
						</div>
					</nav>
				)}
			</div>
		</header>
	);
}

export default Header;
