import { useEffect, useState } from 'react';
import {
	Search,
	ChevronDown,
	ListFilter,
	MoreVertical,
	Eye,
	XCircle,
	CheckCircle,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import EmptyState from '@/components/dashboard/EmptyState';
import { TabsContent } from '@/components/ui/tabs';
import { useNavigate } from 'react-router';
import TableSkeleton from '@/components/dashboard/TableSkeleton';
import { reportService, type Report } from '@/services/report.service';
import Pagination from '@/components/dashboard/Pagination';

import { formatDate } from '@/utils/date.utils';
import showToast from '@/utils/toast.util';
import {
	getReportStatusBadge,
	getToiletConditionBadge,
	getFacilityTypeBadge,
	renderUserAvatar,
} from '@/components/dashboard/StatusBadge';

const ReportsTable: React.FC = () => {
	const [reportsData, setReportsData] = useState<Report[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [facilityTypeFilter, setFacilityTypeFilter] = useState('all');
	const [toiletConditionFilter, setToiletConditionFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 30;
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const navigate = useNavigate();
	const [processingRows, setProcessingRows] = useState<Set<string>>(new Set());

	// Get display text for status filter
	const getStatusFilterDisplayText = () => {
		switch (statusFilter) {
			case 'PENDING':
				return 'Pending Review';
			case 'APPROVED':
				return 'Approved';
			case 'REJECTED':
				return 'Rejected';
			default:
				return 'All Status';
		}
	};

	// Get display text for facility type filter
	const getFacilityTypeFilterDisplayText = () => {
		switch (facilityTypeFilter) {
			case 'PUBLIC':
				return 'Public';
			case 'PRIVATE':
				return 'Private';
			case 'SCHOOL':
				return 'School';
			case 'HOSPITAL':
				return 'Hospital';
			case 'MARKET':
				return 'Market';
			case 'OFFICE':
				return 'Office';
			case 'RESIDENTIAL':
				return 'Residential';
			case 'OTHER':
				return 'Other';
			default:
				return 'All Facility Types';
		}
	};

	// Get display text for toilet condition filter
	const getToiletConditionFilterDisplayText = () => {
		switch (toiletConditionFilter) {
			case 'EXCELLENT':
				return 'Excellent';
			case 'GOOD':
				return 'Good';
			case 'FAIR':
				return 'Fair';
			case 'POOR':
				return 'Poor';
			case 'VERY_POOR':
				return 'Very Poor';
			default:
				return 'All Conditions';
		}
	};

	// Filter logic
	const filteredReports = reportsData.filter(report => {
		const matchesSearch =
			report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			report.submitterName
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			report.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
			report.lga.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === 'all' || report.status === statusFilter;

		const matchesFacilityType =
			facilityTypeFilter === 'all' ||
			report.facilityType === facilityTypeFilter;

		const matchesToiletCondition =
			toiletConditionFilter === 'all' ||
			report.toiletCondition === toiletConditionFilter;

		return (
			matchesSearch &&
			matchesStatus &&
			matchesFacilityType &&
			matchesToiletCondition
		);
	});

	const handleStatusFilterChange = (status: string) => {
		setStatusFilter(status);
		setCurrentPage(1);
	};

	const handleFacilityTypeFilterChange = (facilityType: string) => {
		setFacilityTypeFilter(facilityType);
		setCurrentPage(1);
	};

	const handleToiletConditionFilterChange = (condition: string) => {
		setToiletConditionFilter(condition);
		setCurrentPage(1);
	};

	// Report actions
	const handlePreviewReport = (report: Report) => {
		console.log('Preview report:', report.id);
		navigate(`/admin/dashboard/reports/${report.id}`);
	};

	const handleApproveReport = async (
		reportId: string,
		notes = 'Report approved by admin'
	) => {
		setProcessingRows(prev => new Set(prev).add(reportId));

		try {
			const result = await reportService.updateReportStatus(reportId, {
				status: 'APPROVED',
				adminNotes: notes,
			});

			if (result.success) {
				showToast.success('Report approved successfully');
				const updatedReports = reportsData.map((item): Report => {
					if (item.id === reportId) {
						return {
							...item,
							status: 'APPROVED',
							adminNotes: notes,
						};
					}
					return item;
				});
				setReportsData(updatedReports);
			} else {
				showToast.error('Failed to approve report');
			}
		} catch (error) {
			showToast.error('Failed to approve report');
			console.error('Error approving report:', error);
		} finally {
			setProcessingRows(prev => {
				const newSet = new Set(prev);
				newSet.delete(reportId);
				return newSet;
			});
		}
	};

	const handleRejectReport = async (
		reportId: string,
		notes = 'Report rejected by admin'
	) => {
		setProcessingRows(prev => new Set(prev).add(reportId));

		try {
			const result = await reportService.updateReportStatus(reportId, {
				status: 'REJECTED',
				adminNotes: notes,
			});

			if (result.success) {
				showToast.success('Report rejected successfully');
				const updatedReports = reportsData.map((item): Report => {
					if (item.id === reportId) {
						return {
							...item,
							status: 'REJECTED',
							adminNotes: notes,
						};
					}
					return item;
				});
				setReportsData(updatedReports);
			} else {
				showToast.error('Failed to reject report');
			}
		} catch (error) {
			showToast.error('Failed to reject report');
			console.error('Error rejecting report:', error);
		} finally {
			setProcessingRows(prev => {
				const newSet = new Set(prev);
				newSet.delete(reportId);
				return newSet;
			});
		}
	};

	const handleDeleteReport = async (reportId: string) => {
		setProcessingRows(prev => new Set(prev).add(reportId));

		try {
			const result = await reportService.deleteReport(reportId);

			if (result.success) {
				showToast.success('Report deleted successfully');
				setReportsData(prev =>
					prev.filter(report => report.id !== reportId)
				);
			} else {
				showToast.error('Failed to delete report');
			}
		} catch (error) {
			showToast.error('Failed to delete report');
			console.error('Error deleting report:', error);
		} finally {
			setProcessingRows(prev => {
				const newSet = new Set(prev);
				newSet.delete(reportId);
				return newSet;
			});
		}
	};

	const getActionButtons = (report: Report) => {
		const isProcessing = processingRows.has(report.id);

		return (
			<div className="flex flex-col gap-1">
				<button
					onClick={() => handlePreviewReport(report)}
					disabled={isProcessing}
					className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
						isProcessing
							? 'text-gray-400 cursor-not-allowed'
							: 'text-gray-700 hover:bg-gray-100'
					}`}
				>
					<Eye className="w-4 h-4" />
					Preview
				</button>

				{report.status === 'PENDING' && (
					<>
						<button
							onClick={() => handleApproveReport(report.id)}
							disabled={isProcessing}
							className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
								isProcessing
									? 'text-gray-400 cursor-not-allowed'
									: 'text-gray-700 hover:bg-green-50'
							}`}
						>
							<CheckCircle className="w-4 h-4" />
							{isProcessing ? 'Approving...' : 'Approve'}
						</button>

						<button
							onClick={() => handleRejectReport(report.id)}
							disabled={isProcessing}
							className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
								isProcessing
									? 'text-gray-400 cursor-not-allowed'
									: 'text-gray-700 hover:bg-red-50'
							}`}
						>
							<XCircle className="w-4 h-4" />
							{isProcessing ? 'Rejecting...' : 'Reject'}
						</button>
					</>
				)}

				<button
					onClick={() => handleDeleteReport(report.id)}
					disabled={isProcessing}
					className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
						isProcessing
							? 'text-gray-400 cursor-not-allowed'
							: 'text-gray-700 hover:bg-red-50'
					}`}
				>
					<XCircle className="w-4 h-4" />
					{isProcessing ? 'Deleting...' : 'Delete'}
				</button>
			</div>
		);
	};

	const emptyComponentToRender = () => {
		if (error) {
			return (
				<EmptyState
					image="/icons/error.svg"
					title="Failed to fetch reports"
					description="An error occurred when fetching reports"
					className="rounded-none py-12 border-0"
				/>
			);
		}
		if (filteredReports.length === 0 && searchQuery) {
			return (
				<EmptyState
					image="/icons/search.svg"
					title="No reports matched your search"
					description="Try adjusting your search criteria."
					className="rounded-none py-12 border-0"
				/>
			);
		}

		if (filteredReports.length === 0) {
			return (
				<EmptyState
					image="/icons/no-reports.svg"
					title="No toilet reports found"
					description="Toilet reports will appear here once submitted."
					className="rounded-none py-12 border-0"
				/>
			);
		}
	};

	useEffect(() => {
		const fetchReportsData = async () => {
			try {
				setLoading(true);
				const result = await reportService.getAllReports({
					page: currentPage,
					limit: itemsPerPage,
				});

				setReportsData(result.data.reports);
				setTotalItems(result.data.total);
				setTotalPages(result.data.totalPages);
				setCurrentPage(result.data.page);
			} catch (error) {
				console.error('Failed to fetch reports data:', error);
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchReportsData();
	}, [currentPage]);

	if (loading) return <TableSkeleton />;

	return (
		<TabsContent value="reports" className="mt-6 bg-white rounded-xl border">
			{/* Filters */}
			<div className="p-4 border-b">
				<div className="flex items-center justify-between">
					<div className="flex flex-wrap gap-3 items-center">
						<div className="relative w-[25rem] lg:block hidden">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<Search className="w-4 h-4 text-gray-400" />
							</div>
							<input
								type="text"
								className="bg-white border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
								placeholder="Search reports..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>

						{/* Status Filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100">
									<ListFilter className="w-4 h-4 mr-2 -ml-1 text-gray-500" />
									{getStatusFilterDisplayText()}
									<ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-48">
								<DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase">
									Status
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => handleStatusFilterChange('all')}
									className={`cursor-pointer ${
										statusFilter === 'all'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									All Status
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusFilterChange('PENDING')}
									className={`cursor-pointer ${
										statusFilter === 'PENDING'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Pending Review
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusFilterChange('APPROVED')}
									className={`cursor-pointer ${
										statusFilter === 'APPROVED'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Approved
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusFilterChange('REJECTED')}
									className={`cursor-pointer ${
										statusFilter === 'REJECTED'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Rejected
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Facility Type Filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="lg:inline-flex hidden items-center px-4 py-2.5 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100">
									<ListFilter className="w-4 h-4 mr-2 -ml-1 text-gray-500" />
									{getFacilityTypeFilterDisplayText()}
									<ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-48">
								<DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase">
									Facility Type
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => handleFacilityTypeFilterChange('all')}
									className={`cursor-pointer ${
										facilityTypeFilter === 'all'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									All Facility Types
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleFacilityTypeFilterChange('PUBLIC')
									}
									className={`cursor-pointer ${
										facilityTypeFilter === 'PUBLIC'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Public
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleFacilityTypeFilterChange('PRIVATE')
									}
									className={`cursor-pointer ${
										facilityTypeFilter === 'PRIVATE'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Private
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleFacilityTypeFilterChange('SCHOOL')
									}
									className={`cursor-pointer ${
										facilityTypeFilter === 'SCHOOL'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									School
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleFacilityTypeFilterChange('HOSPITAL')
									}
									className={`cursor-pointer ${
										facilityTypeFilter === 'HOSPITAL'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Hospital
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleFacilityTypeFilterChange('MARKET')
									}
									className={`cursor-pointer ${
										facilityTypeFilter === 'MARKET'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Market
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleFacilityTypeFilterChange('OFFICE')
									}
									className={`cursor-pointer ${
										facilityTypeFilter === 'OFFICE'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Office
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleFacilityTypeFilterChange('RESIDENTIAL')
									}
									className={`cursor-pointer ${
										facilityTypeFilter === 'RESIDENTIAL'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Residential
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleFacilityTypeFilterChange('OTHER')
									}
									className={`cursor-pointer ${
										facilityTypeFilter === 'OTHER'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Other
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Toilet Condition Filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="lg:inline-flex hidden items-center px-4 py-2.5 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100">
									<ListFilter className="w-4 h-4 mr-2 -ml-1 text-gray-500" />
									{getToiletConditionFilterDisplayText()}
									<ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-48">
								<DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase">
									Toilet Condition
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() =>
										handleToiletConditionFilterChange('all')
									}
									className={`cursor-pointer ${
										toiletConditionFilter === 'all'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									All Conditions
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleToiletConditionFilterChange('EXCELLENT')
									}
									className={`cursor-pointer ${
										toiletConditionFilter === 'EXCELLENT'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Excellent
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleToiletConditionFilterChange('GOOD')
									}
									className={`cursor-pointer ${
										toiletConditionFilter === 'GOOD'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Good
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleToiletConditionFilterChange('FAIR')
									}
									className={`cursor-pointer ${
										toiletConditionFilter === 'FAIR'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Fair
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleToiletConditionFilterChange('POOR')
									}
									className={`cursor-pointer ${
										toiletConditionFilter === 'POOR'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Poor
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleToiletConditionFilterChange('VERY_POOR')
									}
									className={`cursor-pointer ${
										toiletConditionFilter === 'VERY_POOR'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Very Poor
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									<div className="flex items-center">
										Submitter Name
									</div>
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									<div className="flex items-center">Location</div>
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									<div className="flex items-center">Condition</div>
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									<div className="flex items-center">
										Facility Type
									</div>
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									<div className="flex items-center">Status</div>
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									<div className="flex items-center">Created</div>
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredReports.map(report => {
								const isProcessing = processingRows.has(report.id);

								return (
									<tr
										key={report.id}
										className={`transition-all duration-200 ${
											isProcessing
												? 'bg-gray-50 opacity-60'
												: 'hover:bg-gray-50'
										}`}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												{renderUserAvatar({
													image: undefined,
													name: report.submitterName,
												})}
												<div className="ml-3">
													<div
														className={`text-sm font-medium font-jakarta ${
															isProcessing
																? 'text-gray-400'
																: 'text-gray-700'
														}`}
													>
														{report.submitterName}
													</div>
													{report.submitterEmail && (
														<div className="text-sm text-gray-500">
															{report.submitterEmail}
														</div>
													)}
												</div>
											</div>
										</td>

										<td className="px-6 py-4 whitespace-nowrap">
											<div
												className={`text-sm ${
													isProcessing
														? 'text-gray-400'
														: 'text-gray-900'
												}`}
											>
												<div className="font-medium">
													{report.state}
												</div>
												<div className="text-gray-500">
													{report.lga}
												</div>
											</div>
										</td>

										<td className="px-6 py-4 whitespace-nowrap">
											<div
												className={isProcessing ? 'opacity-50' : ''}
											>
												{getToiletConditionBadge(
													report.toiletCondition
												)}
											</div>
										</td>

										<td className="px-6 py-4 whitespace-nowrap">
											<div
												className={isProcessing ? 'opacity-50' : ''}
											>
												{getFacilityTypeBadge(report.facilityType)}
											</div>
										</td>

										<td className="px-6 py-4 whitespace-nowrap">
											<div
												className={isProcessing ? 'opacity-50' : ''}
											>
												{getReportStatusBadge(report.status)}
											</div>
										</td>

										<td className="px-6 py-4 whitespace-nowrap">
											<div
												className={`text-sm ${
													isProcessing
														? 'text-gray-400'
														: 'text-gray-700'
												}`}
											>
												{formatDate(report.createdAt)}
											</div>
										</td>

										<td className="px-6 py-4 whitespace-nowrap text-center">
											<Popover>
												<PopoverTrigger asChild>
													<button
														disabled={isProcessing}
														className={`flex items-center justify-center border rounded-md px-2 py-1 shadow-md mx-auto transition-colors ${
															isProcessing
																? 'text-gray-300 border-gray-200 cursor-not-allowed'
																: 'text-gray-500 hover:text-gray-700 border-gray-400'
														}`}
													>
														<MoreVertical className="h-4 w-4 stroke-3" />
													</button>
												</PopoverTrigger>
												<PopoverContent className="w-48 p-2">
													{getActionButtons(report)}
												</PopoverContent>
											</Popover>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{/* Empty State */}
				{emptyComponentToRender()}

				{/* Pagination */}
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
					onPageChange={setCurrentPage}
					itemName="report"
				/>
			</div>
		</TabsContent>
	);
};

export default ReportsTable;
