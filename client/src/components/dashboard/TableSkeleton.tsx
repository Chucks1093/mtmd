import { Skeleton } from '@/components/ui/skeleton';
import {
	Search,
	ListFilter,
	ChevronDown,
	Calendar,
	ChevronRight,
} from 'lucide-react';

export const TableSkeleton: React.FC = () => {
	return (
		<div className="mt-6 bg-white rounded-xl border">
			{/* Header Section */}
			<div className="p-4 border-b">
				<div className="flex items-center md:justify-between justify-end">
					<div className="flex flex-wrap gap-3 items-center">
						{/* Search Input Skeleton */}
						<div className="relative w-[25rem] hidden lg:block">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<Search className="w-4 h-4 text-gray-300" />
							</div>
							<Skeleton className="h-10 w-full rounded-sm" />
						</div>

						{/* Filter Dropdown Skeleton */}
						<div className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-center bg-white border border-gray-200 rounded-sm">
							<ListFilter className="w-4 h-4 mr-2 -ml-1 text-gray-300" />
							<Skeleton className="h-4 w-16 hidden lg:block" />
							<ChevronDown className="w-4 h-4 ml-2 text-gray-300" />
						</div>
					</div>

					{/* Date Picker Skeleton */}
					<div className="gap-3 md:flex hidden">
						<div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white">
							<Calendar className="w-4 h-4 text-gray-300" />
							<Skeleton className="h-4 w-20" />
							<ChevronDown className="w-4 h-4 text-gray-300" />
						</div>
					</div>
				</div>
			</div>

			{/* Table Skeleton */}
			<div className="bg-white overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						{/* Table Headers */}

						{/* Table Body Skeleton */}
						<tbody className="bg-white divide-y divide-gray-200">
							{[...Array(5)].map((_, index) => (
								<tr key={index} className="hover:bg-gray-50">
									{/* Loan ID */}
									<td className="px-6 py-4 whitespace-nowrap">
										<Skeleton className="h-4 w-16" />
									</td>
									{/* Amount */}
									<td className="px-6 py-4 whitespace-nowrap">
										<Skeleton className="h-4 w-20" />
									</td>
									{/* Disbursed On */}
									<td className="px-6 py-4 whitespace-nowrap">
										<Skeleton className="h-4 w-24" />
									</td>
									{/* Status */}
									<td className="px-6 py-4 whitespace-nowrap">
										<Skeleton className="h-6 w-16 rounded-full" />
									</td>
									{/* Repaid On */}
									<td className="px-6 py-4 whitespace-nowrap">
										<Skeleton className="h-4 w-24" />
									</td>
									{/* Repayment Score */}
									<td className="px-6 py-4 whitespace-nowrap">
										<Skeleton className="h-6 w-20 rounded-full" />
									</td>
									{/* Actions */}
									<td className="px-6 py-4 whitespace-nowrap text-right">
										<div className="flex items-center justify-end border rounded-md px-2 py-1 border-gray-200">
											<Skeleton className="h-4 w-8 mr-1" />
											<ChevronRight className="h-4 w-4 text-gray-300" />
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination Skeleton */}
				<div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
					{/* Results info skeleton */}
					<div className="text-center sm:text-left">
						<Skeleton className="h-4 w-48 mx-auto sm:mx-0" />
					</div>

					{/* Pagination controls skeleton */}
					<div className="flex flex-col xs:flex-row items-center gap-2 xs:gap-2">
						{/* Navigation buttons skeleton */}
						<div className="flex items-center gap-1 xs:gap-2 order-2 xs:order-1 xs:mr-2">
							<div className="px-3 sm:px-4 py-2 border border-gray-200 rounded-md bg-white">
								<Skeleton className="h-4 w-12 sm:w-16" />
							</div>
							<div className="px-3 sm:px-4 py-2 border border-gray-200 rounded-md bg-white">
								<Skeleton className="h-4 w-8 sm:w-12" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TableSkeleton;
