import React from 'react';
import {
	AlertCircle,
	Clock,
	XCircle,
	Info,
	Building2,
	CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface FinancialMetricCardProps {
	/** The financial amount to display */
	value: string;

	hideInfo?: boolean;

	/** Verification status */
	status?: 'verified' | 'pending' | 'failed' | 'unverified';
	/** Card title */
	title: string;
	/** Subtitle text (default: "Max you can borrow") */
	subtitle?: string;
	/** Custom icon component */
	icon?: React.ReactNode;
	/** Icon background color (default: blue) */
	iconColor?: string;
	/** Additional CSS classes */
	className?: string;
	/** Format large numbers (e.g., 1000000 -> 1M) */
	formatLargeNumbers?: boolean;
}

const FinancialMetricCard: React.FC<FinancialMetricCardProps> = ({
	value,

	status = 'verified',
	title,
	subtitle = '',
	icon,
	iconColor = 'bg-blue-50',
	className,
	hideInfo = false,
}) => {
	// Format amount with commas and handle large numbers

	// Status configuration
	const statusConfig = {
		verified: {
			text: 'Verified',
			icon: <CheckCheck className="w-5 h-5" />,
			className: 'bg-green-100 text-green-700 border-green-200',
		},
		pending: {
			text: 'Pending',
			icon: <Clock className="w-4 h-4" />,
			className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
		},
		failed: {
			text: 'Failed',
			icon: <XCircle className="w-4 h-4" />,
			className: 'bg-red-100 text-red-700 border-red-200',
		},
		unverified: {
			text: 'Unverified',
			icon: <AlertCircle className="w-4 h-4" />,
			className: 'bg-gray-100 text-gray-700 border-gray-200',
		},
	};

	const currentStatus = statusConfig[status];

	return (
		<div
			className={cn(
				'bg-white rounded-xl border border-gray-200 p-4  transition-shadow duration-200',
				className
			)}
		>
			{/* Header */}
			<div className="flex items-center gap-3 mb-4">
				<div
					className={cn(
						'p-1 rounded-sm flex items-center justify-center',
						iconColor
					)}
				>
					{icon || <Building2 className="size-5 text-white" />}
				</div>
				<h3 className="text-md font-normal text-zinc-600 font-jarkata">
					{title}
				</h3>
			</div>

			{/* Amount - Large and Prominent */}

			<div className="flex items-baseline gap-2 font-jakarta ">
				<span className="text-[1.72rem] font-semibold text-zinc-600">
					{value}
				</span>
			</div>

			{/* Divider */}
			{!hideInfo && (
				<div className="border-t border-gray-200 mt-5 mb-3"></div>
			)}

			{/* Footer */}
			{!hideInfo && (
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1">
						<Info className="w-5 h-5 text-blue-500" />

						<span className=" text-sm text-gray-600 font-jarkata">
							{subtitle}
						</span>
					</div>

					<div
						className={cn(
							'flex items-center gap-1 px-2 py-1 text-xs font-normal border rounded-',
							currentStatus.className
						)}
					>
						{currentStatus.icon}
						{currentStatus.text}
					</div>
				</div>
			)}
		</div>
	);
};

interface FinancialMetricCardSkeletonProps {
	hideInfo?: boolean;
	className?: string;
}

export const FinancialMetricCardSkeleton: React.FC<
	FinancialMetricCardSkeletonProps
> = ({ hideInfo = false, className }) => {
	return (
		<div
			className={cn(
				'bg-white rounded-xl border border-gray-200 p-4 transition-shadow duration-200',
				className
			)}
		>
			{/* Header */}
			<div className="flex items-center gap-3 mb-4">
				<div className="p-1 rounded-sm flex items-center justify-center bg-gray-100">
					<Skeleton className="size-5" />
				</div>
				<Skeleton className="h-5 w-32" />
			</div>

			{/* Amount - Large and Prominent */}
			<div className="flex items-baseline gap-2 font-jakarta">
				<Skeleton className="h-10 w-40" />
			</div>

			{/* Divider */}
			{!hideInfo && (
				<div className="border-t border-gray-200 mt-5 mb-3"></div>
			)}

			{/* Footer */}
			{!hideInfo && (
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1">
						<div className="w-5 h-5 bg-gray-200 rounded"></div>
						<Skeleton className="h-4 w-24" />
					</div>

					<div className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded bg-gray-50">
						<div className="w-4 h-4 bg-gray-200 rounded"></div>
						<Skeleton className="h-3 w-16" />
					</div>
				</div>
			)}
		</div>
	);
};

export const FinancialMetricCardSkeletons: React.FC<{
	count?: number;
	hideInfo?: boolean;
}> = props => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{[...Array(props.count || 4)].map((_, index) => (
				<FinancialMetricCardSkeleton
					hideInfo={props.hideInfo}
					key={index}
				/>
			))}
		</div>
	);
};

export default FinancialMetricCard;
