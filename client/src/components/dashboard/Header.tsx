import React from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	TooltipProvider,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { LogOut, ChevronDown, Menu, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfileStore } from '@/hooks/useProfileStore';
import { authService } from '@/services/auth.service';
import { useNavigate } from 'react-router';

import showToast from '@/utils/toast.util';

export interface Notification {
	id: string;
	title: string;
	message: string;
	type: string; // e.g., "IN_APP", "EMAIL", etc.
	isRead: boolean;
	loanApplicationId: string;
	createdAt: string;
	updatedAt: string;
}

export interface Pagination {
	currentPage: number;
	totalPages: number;
	totalDocuments: number;
	hasNextPage: boolean;
}

export interface NotificationsData {
	notifications: Notification[];
	pagination: Pagination;
	unreadCount: number;
}

export interface NotificationsResponse {
	success: boolean;
	message: string;
	data: NotificationsData;
}

interface HeaderProps {
	className?: string;
	onMenuClick?: () => void;
	showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
	className,
	onMenuClick,
	showMenuButton = false,
}) => {
	// Internal state
	const { profile, clearProfile } = useProfileStore();
	const navigate = useNavigate();

	const handleLogout = async () => {
		showToast.message('Logging out...');
		await authService.logout();
		clearProfile();
		navigate('/');
		showToast.message('Signed Out');
	};

	const handleQuestionClick = () => {
		console.log('Help/Question clicked');
		navigate('/dashboard/supoprt');
		// Add your help/FAQ logic here
	};

	const getInitials = (name: string) => {
		if (!name) return '';
		return name
			.split(' ')
			.map(part => part.charAt(0))
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		profile && (
			<TooltipProvider>
				<header
					className={cn(
						'h-16 bg-white border-b border-gray-200  flex justify-center  ',
						className
					)}
				>
					<div className="flex items-center justify-between w-full h-full .max-w-7xl px-4">
						{/* Left Section - Mobile Menu + Search */}
						<div className="flex items-center gap-4 flex-1">
							{/* Mobile Menu Button */}
							{showMenuButton && (
								<div
									className="lg:hidden p-2 cursor-pointer rounded-md hover:bg-gray-100 transition-colors"
									onClick={onMenuClick}
								>
									<Menu className="h-5 w-5" />
								</div>
							)}

							{/* Logo - Hidden on mobile when search is active */}
							<div className="flex items-center gap-3 lg:hidden">
								<div className="w-10 h-10 bg-green-700 rounded flex items-center justify-center">
									<img
										className="w-6 h-6 opacity-90"
										src="/icons/logo.svg"
										alt="Logo"
									/>
								</div>
							</div>

							{/* Search */}
							<div className="flex-1 max-w-lg hidden md:block">
								<h1>
									Page /{' '}
									<span className="font-semibold">Overview</span>
								</h1>
							</div>
						</div>

						{/* Right Section - Actions + User */}
						<div className="flex items-center gap-2 ml-4">
							{/* Question/Help Button */}
							<Tooltip>
								<TooltipTrigger asChild onClick={handleQuestionClick}>
									<div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
										<HelpCircle className="w-5 h-5 text-gray-600" />
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>Help & Support</p>
								</TooltipContent>
							</Tooltip>

							{/* User Dropdown */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<div className="flex items-center gap-2 px-2 sm:px-3 py-2 h-auto bg-white border border-gray-200 rounded-full hover:border-gray-300 transition-all duration-200 cursor-pointer">
										<Avatar className="w-8 h-8">
											<AvatarImage
												src={
													profile.profilePicture ||
													'/avatars/avatar-5.png'
												}
												alt={`${profile.name}`}
											/>
											<AvatarFallback className="bg-blue-500 text-white text-sm">
												{getInitials(profile.name)}
											</AvatarFallback>
										</Avatar>

										<ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
									</div>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align="end"
									className="w-64 bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-black/5 border-0 rounded-xl p-2"
								>
									{/* User Info Section with Centered Avatar */}
									<div className=" flex flex-col items-center py-4 px-2  bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-2">
										<Avatar className="w-16 h-16 mb-3 ring-2 ring-white shadow-md">
											<AvatarImage
												src={profile.profilePicture || ''}
												alt={profile.name}
											/>
											<AvatarFallback className="bg-blue-500 text-white text-lg font-semibold">
												{getInitials(profile.name)}
											</AvatarFallback>
										</Avatar>
										<div className="text-center">
											<p className="text-sm font-semibold text-gray-900 mb-1">
												{profile.name}
											</p>
											<p className="text-xs text-gray-600">
												{profile.email}
											</p>
										</div>
									</div>

									<DropdownMenuSeparator className="my-2" />

									<DropdownMenuItem
										className="cursor-pointer flex items-center px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-lg transition-colors"
										onClick={handleLogout}
									>
										<LogOut className="mr-3 h-4 w-4" />
										<span>Sign Out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</header>
			</TooltipProvider>
		)
	);
};

export default Header;
