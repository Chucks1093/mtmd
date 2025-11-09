import React from 'react';
import {
	Clock,
	CheckCircle,
	XCircle,
	Building2,
	Home,
	GraduationCap,
	Cross,
	ShoppingCart,
	Building,
	Users,
	MoreHorizontal,
	Shield,
	User,
	UserX,
	AlertTriangle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Report status types
export type ReportStatusType = 'PENDING' | 'APPROVED' | 'REJECTED';

// Toilet condition types
export type ToiletConditionType =
	| 'EXCELLENT'
	| 'GOOD'
	| 'FAIR'
	| 'POOR'
	| 'VERY_POOR';

// Facility type
export type FacilityType =
	| 'PUBLIC'
	| 'PRIVATE'
	| 'SCHOOL'
	| 'HOSPITAL'
	| 'MARKET'
	| 'OFFICE'
	| 'RESIDENTIAL'
	| 'OTHER';

// Admin types
export type AdminStatusType =
	| 'PENDING'
	| 'ACTIVE'
	| 'SUSPENDED'
	| 'DEACTIVATED';
export type AdminRoleType = 'SYSTEM_ADMIN' | 'ADMIN';

export const renderUserAvatar = (user: { image?: string; name: string }) => {
	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(n => n.charAt(0))
			.join('')
			.substring(0, 2);
	};

	return (
		<Avatar className="h-8 w-8">
			<AvatarImage src={user.image} alt={user.name} />
			<AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium uppercase">
				{getInitials(user.name)}
			</AvatarFallback>
		</Avatar>
	);
};

export const getReportStatusBadge = (status: ReportStatusType) => {
	const base =
		'flex items-center px-2 py-1 rounded-sm text-xs font-medium border w-fit';

	switch (status) {
		case 'PENDING':
			return (
				<span
					className={`${base} bg-orange-50 text-orange-700 border-orange-400`}
				>
					<Clock className="size-4 mr-1" />
					Pending Review
				</span>
			);
		case 'APPROVED':
			return (
				<span
					className={`${base} bg-green-50 text-green-700 border-green-400`}
				>
					<CheckCircle className="size-4 mr-1" />
					Approved
				</span>
			);
		case 'REJECTED':
			return (
				<span className={`${base} bg-red-50 text-red-700 border-red-400`}>
					<XCircle className="size-4 mr-1" />
					Rejected
				</span>
			);
		default:
			return null;
	}
};

export const getToiletConditionBadge = (condition: ToiletConditionType) => {
	const base =
		'flex items-center px-2 py-1 rounded-sm text-xs font-medium border w-fit';

	switch (condition) {
		case 'EXCELLENT':
			return (
				<span
					className={`${base} bg-green-50 text-green-700 border-green-400`}
				>
					Excellent
				</span>
			);
		case 'GOOD':
			return (
				<span
					className={`${base} bg-blue-50 text-blue-700 border-blue-400`}
				>
					Good
				</span>
			);
		case 'FAIR':
			return (
				<span
					className={`${base} bg-yellow-50 text-yellow-700 border-yellow-400`}
				>
					Fair
				</span>
			);
		case 'POOR':
			return (
				<span
					className={`${base} bg-orange-50 text-orange-700 border-orange-400`}
				>
					Poor
				</span>
			);
		case 'VERY_POOR':
			return (
				<span className={`${base} bg-red-50 text-red-700 border-red-400`}>
					Very Poor
				</span>
			);
		default:
			return null;
	}
};

export const getFacilityTypeBadge = (facilityType: FacilityType) => {
	const base =
		'flex items-center px-2 py-1 rounded-sm text-xs font-medium border w-fit';

	switch (facilityType) {
		case 'PUBLIC':
			return (
				<span
					className={`${base} bg-blue-50 text-blue-700 border-blue-400`}
				>
					<Building2 className="size-4 mr-1" />
					Public
				</span>
			);
		case 'PRIVATE':
			return (
				<span
					className={`${base} bg-purple-50 text-purple-700 border-purple-400`}
				>
					<Home className="size-4 mr-1" />
					Private
				</span>
			);
		case 'SCHOOL':
			return (
				<span
					className={`${base} bg-green-50 text-green-700 border-green-400`}
				>
					<GraduationCap className="size-4 mr-1" />
					School
				</span>
			);
		case 'HOSPITAL':
			return (
				<span className={`${base} bg-red-50 text-red-700 border-red-400`}>
					<Cross className="size-4 mr-1" />
					Hospital
				</span>
			);
		case 'MARKET':
			return (
				<span
					className={`${base} bg-yellow-50 text-yellow-700 border-yellow-400`}
				>
					<ShoppingCart className="size-4 mr-1" />
					Market
				</span>
			);
		case 'OFFICE':
			return (
				<span
					className={`${base} bg-cyan-50 text-cyan-700 border-cyan-400`}
				>
					<Building className="size-4 mr-1" />
					Office
				</span>
			);
		case 'RESIDENTIAL':
			return (
				<span
					className={`${base} bg-indigo-50 text-indigo-700 border-indigo-400`}
				>
					<Users className="size-4 mr-1" />
					Residential
				</span>
			);
		case 'OTHER':
			return (
				<span
					className={`${base} bg-gray-50 text-gray-700 border-gray-400`}
				>
					<MoreHorizontal className="size-4 mr-1" />
					Other
				</span>
			);
		default:
			return null;
	}
};

export const getAdminStatusBadge = (status: AdminStatusType) => {
	const base =
		'flex items-center px-2 py-1 rounded-sm text-xs font-medium border w-fit';

	switch (status) {
		case 'ACTIVE':
			return (
				<span
					className={`${base} bg-green-50 text-green-700 border-green-400`}
				>
					<CheckCircle className="size-4 mr-1" />
					Active
				</span>
			);
		case 'PENDING':
			return (
				<span
					className={`${base} bg-orange-50 text-orange-700 border-orange-400`}
				>
					<Clock className="size-4 mr-1" />
					Pending
				</span>
			);
		case 'SUSPENDED':
			return (
				<span
					className={`${base} bg-yellow-50 text-yellow-700 border-yellow-400`}
				>
					<AlertTriangle className="size-4 mr-1" />
					Suspended
				</span>
			);
		case 'DEACTIVATED':
			return (
				<span className={`${base} bg-red-50 text-red-700 border-red-400`}>
					<UserX className="size-4 mr-1" />
					Deactivated
				</span>
			);
		default:
			return null;
	}
};

export const getAdminRoleBadge = (role: AdminRoleType) => {
	const base =
		'flex items-center px-2 py-1 rounded-sm text-xs font-medium border w-fit';

	switch (role) {
		case 'SYSTEM_ADMIN':
			return (
				<span
					className={`${base} bg-purple-50 text-purple-700 border-purple-400`}
				>
					<Shield className="size-4 mr-1" />
					System Admin
				</span>
			);
		case 'ADMIN':
			return (
				<span
					className={`${base} bg-blue-50 text-blue-700 border-blue-400`}
				>
					<User className="size-4 mr-1" />
					Admin
				</span>
			);
		default:
			return null;
	}
};
