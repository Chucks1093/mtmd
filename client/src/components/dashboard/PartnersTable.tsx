import { useEffect, useState } from 'react';
import {
	Search,
	ChevronDown,
	ListFilter,
	MoreVertical,
	Edit2,
	Trash2,
	Building2,
	Globe,
	RefreshCw,
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
import partnerService, { type Partner } from '@/services/partner.service';
import Pagination from '@/components/dashboard/Pagination';
import { formatDate } from '@/utils/date.utils';
import showToast from '@/utils/toast.util';
import AddPartnerModal from './AddPartnerModal';

const getPartnerTypeBadge = (type: Partner['type']) => {
	const base =
		'flex items-center size-7 justify-center rounded-full text-lg font-medium border font-bold ';

	const configs = {
		CORPORATE: {
			color: 'bg-blue-50 text-blue-700 border-blue-400',
			label: 'Corporate',
		},
		NGO: {
			color: 'bg-green-50 text-green-700 border-green-400',
			label: 'NGO',
		},
		GOVERNMENT: {
			color: 'bg-purple-50 text-purple-700 border-purple-400',
			label: 'Government',
		},
		INTERNATIONAL: {
			color: 'bg-indigo-50 text-indigo-700 border-indigo-400',
			label: 'International',
		},
		COMMUNITY: {
			color: 'bg-orange-50 text-orange-700 border-orange-400',
			label: 'Community',
		},
		ACADEMIC: {
			color: 'bg-cyan-50 text-cyan-700 border-cyan-400',
			label: 'Academic',
		},
		MEDIA: {
			color: 'bg-pink-50 text-pink-700 border-pink-400',
			label: 'Media',
		},
	};

	const config = configs[type];
	return (
		<span className={`${base} ${config.color} font-grotesque`}>
			{config.label.charAt(0)}
		</span>
	);
};

interface PartnersTableProps {
	onStatsUpdate?: () => void;
}

const PartnersTable: React.FC<PartnersTableProps> = ({ onStatsUpdate }) => {
	const [partnersData, setPartnersData] = useState<Partner[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [typeFilter, setTypeFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 12; // Using 12 for better card grid layout
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [processingRows, setProcessingRows] = useState<Set<string>>(new Set());
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

	const getStatusFilterDisplayText = () => {
		switch (statusFilter) {
			case 'ACTIVE':
				return 'Active';
			case 'INACTIVE':
				return 'Inactive';
			case 'PENDING':
				return 'Pending';
			default:
				return 'All Status';
		}
	};

	const getTypeFilterDisplayText = () => {
		switch (typeFilter) {
			case 'CORPORATE':
				return 'Corporate';
			case 'NGO':
				return 'NGO';
			case 'GOVERNMENT':
				return 'Government';
			case 'INTERNATIONAL':
				return 'International';
			case 'COMMUNITY':
				return 'Community';
			case 'ACADEMIC':
				return 'Academic';
			case 'MEDIA':
				return 'Media';
			default:
				return 'All Types';
		}
	};

	const filteredPartners = partnersData.filter(partner => {
		const matchesSearch =
			partner.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(partner.description &&
				partner.description
					.toLowerCase()
					.includes(searchQuery.toLowerCase())) ||
			(partner.contactPerson &&
				partner.contactPerson
					.toLowerCase()
					.includes(searchQuery.toLowerCase()));

		const matchesStatus =
			statusFilter === 'all' || partner.status === statusFilter;
		const matchesType = typeFilter === 'all' || partner.type === typeFilter;

		return matchesSearch && matchesStatus && matchesType;
	});

	const handleStatusFilterChange = (status: string) => {
		setStatusFilter(status);
		setCurrentPage(1);
	};

	const handleTypeFilterChange = (type: string) => {
		setTypeFilter(type);
		setCurrentPage(1);
	};

	const handleEditPartner = (partner: Partner) => {
		setSelectedPartner(partner);
		setIsEditModalOpen(true);
	};

	const handleDeletePartner = async (
		partnerId: string,
		partnerName: string
	) => {
		if (
			window.confirm(
				`Are you sure you want to delete partner "${partnerName}"? This action cannot be undone.`
			)
		) {
			setProcessingRows(prev => new Set(prev).add(partnerId));
			try {
				const result = await partnerService.deletePartner(partnerId);
				if (result.success) {
					showToast.success('Partner deleted successfully');
					setPartnersData(prev =>
						prev.filter(partner => partner.id !== partnerId)
					);
					if (onStatsUpdate) onStatsUpdate();
				} else {
					showToast.error('Failed to delete partner');
				}
			} catch (error) {
				showToast.error('Failed to delete partner');
				console.error('Error deleting partner:', error);
			} finally {
				setProcessingRows(prev => {
					const newSet = new Set(prev);
					newSet.delete(partnerId);
					return newSet;
				});
			}
		}
	};

	const handleRefreshData = async () => {
		await fetchPartnersData();
		showToast.success('Partners data refreshed');
	};

	const emptyComponentToRender = () => {
		if (error) {
			return (
				<EmptyState
					image="/icons/error.svg"
					title="Failed to fetch partners"
					description="An error occurred when fetching partners"
					className="rounded-none py-12 border-0"
				/>
			);
		}

		if (filteredPartners.length === 0 && searchQuery) {
			return (
				<EmptyState
					image="/icons/search.svg"
					title="No partners matched your search"
					description="Try adjusting your search criteria."
					className="rounded-none py-12 border-0"
				/>
			);
		}

		if (filteredPartners.length === 0) {
			return (
				<EmptyState
					image="/icons/no-partners.svg"
					title="No partners found"
					description="Partners will appear here once added."
					className="rounded-none py-12 border-0"
				/>
			);
		}
	};

	const fetchPartnersData = async () => {
		try {
			setLoading(true);
			const result = await partnerService.getAllPartners({
				page: currentPage,
				limit: itemsPerPage,
			});

			if (result.success && result.data) {
				setPartnersData(result.data.partners);
				setTotalItems(result.data.total);
				setTotalPages(result.data.totalPages);
				setCurrentPage(result.data.page);
			} else {
				setError(true);
			}
		} catch (error) {
			console.error('Failed to fetch partners data:', error);
			setError(true);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPartnersData();
	}, [currentPage, statusFilter, typeFilter]);

	if (loading) return <TableSkeleton />;

	return (
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
								placeholder="Search partners..."
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>

						{/* Status Filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="hidden .inline-flex items-center px-4 py-2.5 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100">
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
									onClick={() => handleStatusFilterChange('ACTIVE')}
									className={`cursor-pointer ${
										statusFilter === 'ACTIVE'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Active
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusFilterChange('INACTIVE')}
									className={`cursor-pointer ${
										statusFilter === 'INACTIVE'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Inactive
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusFilterChange('PENDING')}
									className={`cursor-pointer ${
										statusFilter === 'PENDING'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Pending
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Type Filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="lg:inline-flex hidden items-center px-4 py-2.5 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100">
									<ListFilter className="w-4 h-4 mr-2 -ml-1 text-gray-500" />
									{getTypeFilterDisplayText()}
									<ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-48">
								<DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase">
									Type
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => handleTypeFilterChange('all')}
									className={`cursor-pointer ${
										typeFilter === 'all'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									All Types
								</DropdownMenuItem>
								{[
									'CORPORATE',
									'NGO',
									'GOVERNMENT',
									'INTERNATIONAL',
									'COMMUNITY',
									'ACADEMIC',
									'MEDIA',
								].map(type => (
									<DropdownMenuItem
										key={type}
										onClick={() => handleTypeFilterChange(type)}
										className={`cursor-pointer ${
											typeFilter === type
												? 'bg-gray-100 text-gray-900'
												: 'text-gray-700'
										}`}
									>
										{type.charAt(0) + type.slice(1).toLowerCase()}
									</DropdownMenuItem>
								))}
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

			{/* Partner Cards Grid */}
			<div className="bg-white overflow-hidden">
				{filteredPartners.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
						{filteredPartners.map(partner => {
							const isProcessing = processingRows.has(partner.id);
							return (
								<div
									key={partner.id}
									className={`bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md hover:border-gray-300 ${
										isProcessing
											? 'opacity-60 pointer-events-none'
											: ''
									}`}
								>
									{/* Partner Header */}
									<div className="flex items-start justify-between mb-3">
										<div className=" gap-3 flex-1 min-w-0">
											{/* Partner Logo */}
											<div className="flex-shrink-0 size-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center  mt-2 relative">
												{partner.logo ? (
													<img
														src={partner.logo}
														alt={`${partner.name} logo`}
														className="w-full h-full object-cover rounded-xl"
														onError={e => {
															e.currentTarget.style.display =
																'none';
															e.currentTarget.nextElementSibling?.classList.remove(
																'hidden'
															);
														}}
													/>
												) : null}
												<Building2
													className={`w-6 h-6 text-gray-400 ${
														partner.logo ? 'hidden' : ''
													}`}
												/>
												<div className="absolute -bottom-2 -right-2">
													{getPartnerTypeBadge(partner.type)}
												</div>
											</div>

											{/* Partner Info */}
											<div className="flex-1 min-w-0 mt-2">
												<h3 className="font-semibold text-gray-900 truncate text-lg font-grotesque text-center">
													{partner.name}
												</h3>
												{partner.website && (
													<div className="flex items-center justify-center text-gray-500 underline gap-1 text-xs">
														<Globe className="w-3 h-3" />
														<a
															href={partner.website}
															target="_blank"
															rel="noopener noreferrer"
															className="hover:text-blue-600 truncate"
														>
															{partner.website.replace(
																/^https?:\/\//,
																''
															)}
														</a>
													</div>
												)}
											</div>
										</div>

										{/* Actions Menu */}
										<Popover>
											<PopoverTrigger asChild>
												<button
													disabled={isProcessing}
													className={`flex items-center justify-center w-8 h-8 rounded-md border transition-colors flex-shrink-0 ${
														isProcessing
															? 'text-gray-300 border-gray-200 cursor-not-allowed'
															: 'text-gray-500 hover:text-gray-700 border-gray-300 hover:border-gray-400'
													}`}
												>
													<MoreVertical className="w-4 h-4" />
												</button>
											</PopoverTrigger>
											<PopoverContent className="w-48 p-2">
												<div className="flex flex-col gap-1">
													<button
														onClick={() =>
															handleEditPartner(partner)
														}
														disabled={isProcessing}
														className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
															isProcessing
																? 'text-gray-400 cursor-not-allowed'
																: 'text-gray-700 hover:bg-blue-50'
														}`}
													>
														<Edit2 className="w-4 h-4" />
														Edit Partner
													</button>
													<button
														onClick={() =>
															handleDeletePartner(
																partner.id,
																partner.name
															)
														}
														disabled={isProcessing}
														className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
															isProcessing
																? 'text-gray-400 cursor-not-allowed'
																: 'text-gray-700 hover:bg-red-50'
														}`}
													>
														<Trash2 className="w-4 h-4" />
														Delete Partner
													</button>
												</div>
											</PopoverContent>
										</Popover>
									</div>

									{/* Partner Details */}
									<div className="space-y-2 mt-7 ">
										<div className="text-xs text-gray-400 pt-4 border-t flex items-center justify-between">
											Added {formatDate(partner.createdAt)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					emptyComponentToRender()
				)}

				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
					onPageChange={setCurrentPage}
					itemName="partner"
				/>
			</div>

			{/* Edit Partner Modal */}
			<AddPartnerModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setSelectedPartner(null);
				}}
				onSuccess={() => {
					fetchPartnersData();
					if (onStatsUpdate) onStatsUpdate();
				}}
				partner={selectedPartner}
			/>
		</div>
	);
};

export default PartnersTable;
