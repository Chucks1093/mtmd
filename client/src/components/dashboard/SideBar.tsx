import React from 'react';
import {
	LogOut,
	LayoutGrid,
	ClipboardList,
	Handshake,
	Coins,
	UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavLink, useNavigate } from 'react-router';
import { authService } from '@/services/auth.service';
import { useProfileStore } from '@/hooks/useProfileStore';
import showToast from '@/utils/toast.util';

interface NavigationItem {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	id: string;
	link: string;
	isNew?: boolean;
}

interface NavigationSection {
	title: string;
	items: NavigationItem[];
}

const navigationData: NavigationSection[] = [
	{
		title: 'MAIN MENU',
		items: [
			{
				icon: LayoutGrid,
				label: 'Dashboard',
				id: 'dashboard',
				link: '/admin/dashboard',
			},
			{
				icon: ClipboardList, // ← Changed from Landmark - better for reports
				label: 'Reports',
				id: 'dashboard',
				link: '/admin/dashboard/reports',
			},
			{
				icon: UserCog,
				label: 'Admins',
				id: 'admins',
				link: '/admin/dashboard/admins',
			},
			{
				icon: Coins,
				label: 'Donations',
				id: 'donations',
				link: '/admin/dashboard/donations',
			},
			{
				icon: Handshake,
				label: 'Partners',
				id: 'partners',
				link: '/admin/dashboard/partners',
			},
		],
	},
	// {
	// 	title: 'ACCOUNT',
	// 	items: [
	// 		{
	// 			icon: Settings, // ← Perfect as is
	// 			label: 'Settings',
	// 			id: 'session-history',
	// 			link: '/dashboard/settings',
	// 		},
	// 	],
	// },
];

interface SideBarItemProps {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	link: string;
	isNew?: boolean;
	onNavigate?: () => void;
}

const SideBarItem: React.FC<SideBarItemProps> = ({
	icon: Icon,
	label,
	link,
	isNew = false,
	onNavigate,
}) => {
	return (
		<NavLink
			end
			to={link}
			onClick={onNavigate}
			className={({ isActive }) =>
				`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
					isActive ? 'bg-green-50' : 'text-gray-700 hover:bg-gray-100'
				}`
			}
		>
			{({ isActive }) => (
				<>
					<Icon
						className={`w-4 h-4 ${
							isActive
								? 'text-green-500'
								: 'text-gray-600 group-hover:text-gray-800'
						}`}
					/>
					<span
						className={`text-sm font-medium ${
							isActive
								? 'text-green-500'
								: 'text-gray-700 group-hover:text-gray-900'
						}`}
					>
						{label}
					</span>
					{isNew && (
						<span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
							New
						</span>
					)}
				</>
			)}
		</NavLink>
	);
};

interface SectionHeaderProps {
	title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
	if (!title) return null;

	return (
		<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
			{title}
		</h3>
	);
};

interface SideBarProps {
	className?: string;
	onNavigate?: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ className, onNavigate }) => {
	const { clearProfile } = useProfileStore();
	const navigate = useNavigate();

	const handleLogout = async () => {
		showToast.loading('Logging out...');
		await authService.logout();
		clearProfile();
		navigate('/admin/auth');
		showToast.success('Logged Out');
	};

	return (
		<aside
			className={cn(
				'w-64 border-gray-200 h-screen bg-white flex flex-col z-10 shadow-lg lg:shadow-none',
				className
			)}
		>
			{/* Brand Header */}
			<div className="h-16 flex items-center gap-2 px-4 border-b border-gray-200">
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
			</div>

			{/* Navigation Content */}
			<div className="flex-1 overflow-y-auto py-4 px-2 border-r border-gray-200">
				<nav className="space-y-6">
					{navigationData.map((section, sectionIndex) => (
						<div key={sectionIndex}>
							<SectionHeader title={section.title} />
							<div className="space-y-1">
								{section.items.map(item => (
									<SideBarItem
										key={item.label}
										icon={item.icon}
										label={item.label}
										link={item.link}
										isNew={item.isNew}
										onNavigate={onNavigate}
									/>
								))}
							</div>
						</div>
					))}
				</nav>
			</div>

			{/* User Profile */}
			<div className="p-4 border-t border-r border-gray-200">
				<button
					onClick={handleLogout}
					className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group text-gray-700 hover:bg-gray-100 w-full"
				>
					<LogOut className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
					<span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
						Log Out
					</span>
				</button>
			</div>
		</aside>
	);
};

export default SideBar;
