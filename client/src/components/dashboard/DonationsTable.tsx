import { useEffect, useState } from 'react';
import {
	Search,
	ChevronDown,
	ListFilter,
	MoreVertical,
	Eye,
	RefreshCw,
	Copy,
	Check,
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
import TableSkeleton from '@/components/dashboard/TableSkeleton';
import donationService, { type Donation } from '@/services/donation.service';
import Pagination from '@/components/dashboard/Pagination';
import { formatDate } from '@/utils/date.utils';
import showToast from '@/utils/toast.util';
import ViewDonationModal from './ViewDonationModal';

const getDonationStatusBadge = (status: Donation['status']) => {
	const base =
		'flex items-center px-2 py-1 rounded-sm text-xs font-medium border w-fit';

	switch (status) {
		case 'SUCCESS':
			return (
				<span
					className={`${base} bg-green-50 text-green-700 border-green-400`}
				>
					Success
				</span>
			);
		case 'PENDING':
			return (
				<span
					className={`${base} bg-yellow-50 text-yellow-700 border-yellow-400`}
				>
					Pending
				</span>
			);
		case 'FAILED':
			return (
				<span className={`${base} bg-red-50 text-red-700 border-red-400`}>
					Failed
				</span>
			);
		case 'CANCELLED':
			return (
				<span
					className={`${base} bg-gray-50 text-gray-700 border-gray-400`}
				>
					Cancelled
				</span>
			);
		default:
			return null;
	}
};

const formatCurrency = (amount: number, currency: string = 'NGN') => {
	return new Intl.NumberFormat('en-NG', {
		style: 'currency',
		currency: currency,
	}).format(amount);
};

// Copy Reference Component
const CopyReference: React.FC<{ reference: string }> = ({ reference }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(reference);
			setCopied(true);
			showToast.success('Reference copied to clipboard');
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.log(error);
			showToast.error('Failed to copy reference');
		}
	};

	const displayRef = reference.substring(0, 7);

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm font-mono text-gray-700">
				{displayRef}...
			</span>
			<button
				onClick={handleCopy}
				className="p-1 hover:bg-gray-100 rounded transition-colors"
				title="Copy full reference"
			>
				{copied ? (
					<Check className="w-3 h-3 text-green-600" />
				) : (
					<Copy className="w-3 h-3 text-gray-500 hover:text-gray-700" />
				)}
			</button>
		</div>
	);
};

const DonationsTable: React.FC = () => {
	const [donationsData, setDonationsData] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 30;
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [processingRows] = useState<Set<string>>(new Set());
	const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
		null
	);
	const [showViewModal, setShowViewModal] = useState(false);

	const getStatusFilterDisplayText = () => {
		switch (statusFilter) {
			case 'SUCCESS':
				return 'Success';
			case 'PENDING':
				return 'Pending';
			case 'FAILED':
				return 'Failed';
			case 'CANCELLED':
				return 'Cancelled';
			default:
				return 'All Status';
		}
	};

	const filteredDonations = donationsData.filter(donation => {
		const matchesSearch =
			donation.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			donation.donorEmail
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			(donation.paystackReference &&
				donation.paystackReference
					.toLowerCase()
					.includes(searchQuery.toLowerCase()));

		const matchesStatus =
			statusFilter === 'all' || donation.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const handleStatusFilterChange = (status: string) => {
		setStatusFilter(status);
		setCurrentPage(1);
	};

	const handleViewDonation = (donation: Donation) => {
		setSelectedDonation(donation);
		setShowViewModal(true);
	};

	const handleRefreshData = async () => {
		await fetchDonationsData();
		showToast.success('Donations data refreshed');
	};

	const emptyComponentToRender = () => {
		if (error) {
			return (
				<EmptyState
					image="/icons/error.svg"
					title="Failed to fetch donations"
					description="An error occurred when fetching donations"
					className="rounded-none py-12 border-0"
				/>
			);
		}

		if (filteredDonations.length === 0 && searchQuery) {
			return (
				<EmptyState
					image="/icons/search.svg"
					title="No donations matched your search"
					description="Try adjusting your search criteria."
					className="rounded-none py-12 border-0"
				/>
			);
		}

		if (filteredDonations.length === 0) {
			return (
				<EmptyState
					image="/icons/no-donations.svg"
					title="No donations found"
					description="Donations will appear here once received."
					className="rounded-none py-12 border-0"
				/>
			);
		}
	};

	const fetchDonationsData = async () => {
		try {
			setLoading(true);
			const result = await donationService.getAllDonations({
				page: currentPage,
				limit: itemsPerPage,
			});

			if (result.success && result.data) {
				console.log(result);
				setDonationsData(result.data.donations);
				setTotalItems(result.data.total);
				setTotalPages(result.data.totalPages);
				setCurrentPage(result.data.page);
			} else {
				setError(true);
			}
		} catch (error) {
			console.error('Failed to fetch donations data:', error);
			setError(true);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDonationsData();
	}, [currentPage, statusFilter]);

	if (loading) return <TableSkeleton />;

	return (
		<>
			<div className="mt-6 bg-white rounded-xl border">
				{/* Filter Header */}
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
									placeholder="Search donations..."
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
										onClick={() =>
											handleStatusFilterChange('SUCCESS')
										}
										className={`cursor-pointer ${
											statusFilter === 'SUCCESS'
												? 'bg-gray-100 text-gray-900'
												: 'text-gray-700'
										}`}
									>
										Success
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											handleStatusFilterChange('PENDING')
										}
										className={`cursor-pointer ${
											statusFilter === 'PENDING'
												? 'bg-gray-100 text-gray-900'
												: 'text-gray-700'
										}`}
									>
										Pending
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleStatusFilterChange('FAILED')}
										className={`cursor-pointer ${
											statusFilter === 'FAILED'
												? 'bg-gray-100 text-gray-900'
												: 'text-gray-700'
										}`}
									>
										Failed
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											handleStatusFilterChange('CANCELLED')
										}
										className={`cursor-pointer ${
											statusFilter === 'CANCELLED'
												? 'bg-gray-100 text-gray-900'
												: 'text-gray-700'
										}`}
									>
										Cancelled
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Refresh Button */}
							<button
								onClick={handleRefreshData}
								className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100"
							>
								<RefreshCw className="w-4 h-4 mr-2 -ml-1 text-gray-500" />
								Refresh
							</button>
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
										<div className="flex items-center">Donor</div>
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										<div className="flex items-center">Amount</div>
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										<div className="flex items-center">Reference</div>
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
										<div className="flex items-center">Date</div>
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
								{filteredDonations.map(donation => {
									const isProcessing = processingRows.has(donation.id);
									return (
										<tr
											key={donation.id}
											className={`transition-all duration-200 ${
												isProcessing
													? 'bg-gray-50 opacity-60'
													: 'hover:bg-gray-50'
											}`}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex flex-col">
													<div
														className={`text-sm font-medium font-jakarta ${
															isProcessing
																? 'text-gray-400'
																: 'text-gray-700'
														}`}
													>
														{donation.isAnonymous
															? 'Anonymous Donor'
															: donation.donorName}
													</div>
													<div className="text-sm text-gray-500">
														{donation.isAnonymous
															? 'Hidden'
															: donation.donorEmail}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div
													className={`text-sm font-semibold ${
														isProcessing
															? 'text-gray-400'
															: 'text-gray-900'
													}`}
												>
													{formatCurrency(
														donation.amount,
														donation.currency
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div
													className={
														isProcessing ? 'opacity-50' : ''
													}
												>
													{donation.paystackReference && (
														<CopyReference
															reference={
																donation.paystackReference
															}
														/>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div
													className={
														isProcessing ? 'opacity-50' : ''
													}
												>
													{getDonationStatusBadge(donation.status)}
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
													{formatDate(donation.createdAt)}
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
														<div className="flex flex-col gap-1">
															<button
																onClick={() =>
																	handleViewDonation(donation)
																}
																disabled={isProcessing}
																className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
																	isProcessing
																		? 'text-gray-400 cursor-not-allowed'
																		: 'text-gray-700 hover:bg-gray-100'
																}`}
															>
																<Eye className="w-4 h-4" />
																View Details
															</button>
														</div>
													</PopoverContent>
												</Popover>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					{emptyComponentToRender()}

					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={totalItems}
						itemsPerPage={itemsPerPage}
						onPageChange={setCurrentPage}
						itemName="donation"
					/>
				</div>
			</div>

			{/* View Donation Modal */}
			{selectedDonation && (
				<ViewDonationModal
					isOpen={showViewModal}
					onClose={() => {
						setShowViewModal(false);
						setSelectedDonation(null);
					}}
					donation={selectedDonation}
				/>
			)}
		</>
	);
};

export default DonationsTable;
