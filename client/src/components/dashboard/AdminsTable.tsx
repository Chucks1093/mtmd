import { useEffect, useState } from 'react';
import {
	Search,
	ChevronDown,
	ListFilter,
	MoreVertical,
	Shield,
	UserX,
	UserCheck,
	Trash2,
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
import TableSkeleton from '@/components/dashboard/TableSkeleton';
import { authService, type AdminProfile } from '@/services/auth.service';
import Pagination from '@/components/dashboard/Pagination';
import { formatDate } from '@/utils/date.utils';
import showToast from '@/utils/toast.util';
import {
	getAdminStatusBadge,
	getAdminRoleBadge,
	renderUserAvatar,
} from '@/components/dashboard/StatusBadge';
import { useProfileStore } from '@/hooks/useProfileStore';

interface AdminsTableProps {
	onStatsUpdate: () => void;
}

const AdminsTable: React.FC<AdminsTableProps> = ({ onStatsUpdate }) => {
	const [adminsData, setAdminsData] = useState<AdminProfile[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [roleFilter, setRoleFilter] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 30;
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [processingRows, setProcessingRows] = useState<Set<string>>(new Set());
	const { profile } = useProfileStore();

	// Check if current user is System Admin
	const isSystemAdmin = profile?.role === 'SYSTEM_ADMIN';

	// Get display text for status filter
	const getStatusFilterDisplayText = () => {
		switch (statusFilter) {
			case 'ACTIVE':
				return 'Active';
			case 'PENDING':
				return 'Pending';
			case 'SUSPENDED':
				return 'Suspended';
			case 'DEACTIVATED':
				return 'Deactivated';
			default:
				return 'All Status';
		}
	};

	// Get display text for role filter
	const getRoleFilterDisplayText = () => {
		switch (roleFilter) {
			case 'SYSTEM_ADMIN':
				return 'System Admin';
			case 'ADMIN':
				return 'Admin';
			default:
				return 'All Roles';
		}
	};

	// Filter logic
	const filteredAdmins = adminsData.filter(admin => {
		const matchesSearch =
			admin.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			admin.email.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus =
			statusFilter === 'all' || admin.status === statusFilter;

		const matchesRole = roleFilter === 'all' || admin.role === roleFilter;

		return matchesSearch && matchesStatus && matchesRole;
	});

	const handleStatusFilterChange = (status: string) => {
		setStatusFilter(status);
		setCurrentPage(1);
	};

	const handleRoleFilterChange = (role: string) => {
		setRoleFilter(role);
		setCurrentPage(1);
	};

	// Admin actions
	const handleSuspendAdmin = async (adminId: string) => {
		setProcessingRows(prev => new Set(prev).add(adminId));

		try {
			const result = await authService.updateAdmin(adminId, {
				status: 'SUSPENDED',
			});

			if (result.success) {
				showToast.success('Admin suspended successfully');
				setAdminsData(prev =>
					prev.map(admin =>
						admin.id === adminId
							? { ...admin, status: 'SUSPENDED' }
							: admin
					)
				);
				onStatsUpdate();
			} else {
				showToast.error('Failed to suspend admin');
			}
		} catch (error) {
			showToast.error('Failed to suspend admin');
			console.error('Error suspending admin:', error);
		} finally {
			setProcessingRows(prev => {
				const newSet = new Set(prev);
				newSet.delete(adminId);
				return newSet;
			});
		}
	};

	const handleActivateAdmin = async (adminId: string) => {
		setProcessingRows(prev => new Set(prev).add(adminId));

		try {
			const result = await authService.updateAdmin(adminId, {
				status: 'ACTIVE',
			});

			if (result.success) {
				showToast.success('Admin activated successfully');
				setAdminsData(prev =>
					prev.map(admin =>
						admin.id === adminId ? { ...admin, status: 'ACTIVE' } : admin
					)
				);
				onStatsUpdate();
			} else {
				showToast.error('Failed to activate admin');
			}
		} catch (error) {
			showToast.error('Failed to activate admin');
			console.error('Error activating admin:', error);
		} finally {
			setProcessingRows(prev => {
				const newSet = new Set(prev);
				newSet.delete(adminId);
				return newSet;
			});
		}
	};

	const handleDeleteAdmin = async (adminId: string) => {
		if (
			window.confirm(
				'Are you sure you want to delete this admin? This action cannot be undone.'
			)
		) {
			setProcessingRows(prev => new Set(prev).add(adminId));

			try {
				const result = await authService.deleteAdmin(adminId);

				if (result.success) {
					showToast.success('Admin deleted successfully');
					setAdminsData(prev =>
						prev.filter(admin => admin.id !== adminId)
					);
					onStatsUpdate();
				} else {
					showToast.error('Failed to delete admin');
				}
			} catch (error) {
				showToast.error('Failed to delete admin');
				console.error('Error deleting admin:', error);
			} finally {
				setProcessingRows(prev => {
					const newSet = new Set(prev);
					newSet.delete(adminId);
					return newSet;
				});
			}
		}
	};

	const handlePromoteToSystemAdmin = async (adminId: string) => {
		setProcessingRows(prev => new Set(prev).add(adminId));

		try {
			const result = await authService.updateAdmin(adminId, {
				role: 'SYSTEM_ADMIN',
			});

			if (result.success) {
				showToast.success('Admin promoted to System Admin successfully');
				setAdminsData(prev =>
					prev.map(admin =>
						admin.id === adminId
							? { ...admin, role: 'SYSTEM_ADMIN' }
							: admin
					)
				);
				onStatsUpdate();
			} else {
				showToast.error('Failed to promote admin');
			}
		} catch (error) {
			showToast.error('Failed to promote admin');
			console.error('Error promoting admin:', error);
		} finally {
			setProcessingRows(prev => {
				const newSet = new Set(prev);
				newSet.delete(adminId);
				return newSet;
			});
		}
	};

	const getActionButtons = (admin: AdminProfile) => {
		const isProcessing = processingRows.has(admin.id);
		const isSelf = admin.id === profile?.id;
		const canModify = isSystemAdmin && !isSelf;

		return (
			<div className="flex flex-col gap-1">
				{/* Suspend/Activate */}
				{canModify && (
					<>
						{admin.status === 'ACTIVE' ? (
							<button
								onClick={() => handleSuspendAdmin(admin.id)}
								disabled={isProcessing}
								className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
									isProcessing
										? 'text-gray-400 cursor-not-allowed'
										: 'text-gray-700 hover:bg-orange-50'
								}`}
							>
								<UserX className="w-4 h-4" />
								{isProcessing ? 'Suspending...' : 'Suspend'}
							</button>
						) : (
							<button
								onClick={() => handleActivateAdmin(admin.id)}
								disabled={isProcessing}
								className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
									isProcessing
										? 'text-gray-400 cursor-not-allowed'
										: 'text-gray-700 hover:bg-green-50'
								}`}
							>
								<UserCheck className="w-4 h-4" />
								{isProcessing ? 'Activating...' : 'Activate'}
							</button>
						)}

						{/* Promote to System Admin */}
						{admin.role === 'ADMIN' && (
							<button
								onClick={() => handlePromoteToSystemAdmin(admin.id)}
								disabled={isProcessing}
								className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
									isProcessing
										? 'text-gray-400 cursor-not-allowed'
										: 'text-gray-700 hover:bg-blue-50'
								}`}
							>
								<Shield className="w-4 h-4" />
								{isProcessing
									? 'Promoting...'
									: 'Promote to System Admin'}
							</button>
						)}

						{/* Delete */}
						<button
							onClick={() => handleDeleteAdmin(admin.id)}
							disabled={isProcessing}
							className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-left transition-colors ${
								isProcessing
									? 'text-gray-400 cursor-not-allowed'
									: 'text-gray-700 hover:bg-red-50'
							}`}
						>
							<Trash2 className="w-4 h-4" />
							{isProcessing ? 'Deleting...' : 'Delete'}
						</button>
					</>
				)}

				{!canModify && (
					<div className="px-3 py-2 text-sm text-gray-500">
						{isSelf
							? 'Cannot modify own account'
							: 'No actions available'}
					</div>
				)}
			</div>
		);
	};

	const emptyComponentToRender = () => {
		if (error) {
			return (
				<EmptyState
					image="/icons/error.svg"
					title="Failed to fetch admins"
					description="An error occurred when fetching admins"
					className="rounded-none py-12 border-0"
				/>
			);
		}
		if (filteredAdmins.length === 0 && searchQuery) {
			return (
				<EmptyState
					image="/icons/search.svg"
					title="No admins matched your search"
					description="Try adjusting your search criteria."
					className="rounded-none py-12 border-0"
				/>
			);
		}

		if (filteredAdmins.length === 0) {
			return (
				<EmptyState
					image="/icons/no-users.svg"
					title="No admins found"
					description="Admins will appear here once invited."
					className="rounded-none py-12 border-0"
				/>
			);
		}
	};

	useEffect(() => {
		const fetchAdminsData = async () => {
			try {
				setLoading(true);
				const result = await authService.getAllAdmins({
					page: currentPage,
					limit: itemsPerPage,
				});

				setAdminsData(result.data.admins);
				setTotalItems(result.data.total);
				setTotalPages(result.data.totalPages);
				setCurrentPage(result.data.page);
			} catch (error) {
				console.error('Failed to fetch admins data:', error);
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchAdminsData();
	}, [currentPage]);

	if (loading) return <TableSkeleton />;

	return (
		<TabsContent value="admins" className="mt-6 bg-white rounded-xl border">
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
								placeholder="Search admins..."
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
									onClick={() => handleStatusFilterChange('PENDING')}
									className={`cursor-pointer ${
										statusFilter === 'PENDING'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Pending
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleStatusFilterChange('SUSPENDED')}
									className={`cursor-pointer ${
										statusFilter === 'SUSPENDED'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Suspended
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleStatusFilterChange('DEACTIVATED')
									}
									className={`cursor-pointer ${
										statusFilter === 'DEACTIVATED'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Deactivated
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Role Filter */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="lg:inline-flex hidden items-center px-4 py-2.5 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100">
									<ListFilter className="w-4 h-4 mr-2 -ml-1 text-gray-500" />
									{getRoleFilterDisplayText()}
									<ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-48">
								<DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase">
									Role
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => handleRoleFilterChange('all')}
									className={`cursor-pointer ${
										roleFilter === 'all'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									All Roles
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										handleRoleFilterChange('SYSTEM_ADMIN')
									}
									className={`cursor-pointer ${
										roleFilter === 'SYSTEM_ADMIN'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									System Admin
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleRoleFilterChange('ADMIN')}
									className={`cursor-pointer ${
										roleFilter === 'ADMIN'
											? 'bg-gray-100 text-gray-900'
											: 'text-gray-700'
									}`}
								>
									Admin
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
									<div className="flex items-center">Admin</div>
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									<div className="flex items-center">Role</div>
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
									<div className="flex items-center">Last Login</div>
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
							{filteredAdmins.map(admin => {
								const isProcessing = processingRows.has(admin.id);

								return (
									<tr
										key={admin.id}
										className={`transition-all duration-200 ${
											isProcessing
												? 'bg-gray-50 opacity-60'
												: 'hover:bg-gray-50'
										}`}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												{renderUserAvatar({
													image: admin.profilePicture,
													name: admin.name,
												})}
												<div className="ml-3">
													<div
														className={`text-sm font-medium font-jakarta ${
															isProcessing
																? 'text-gray-400'
																: 'text-gray-700'
														}`}
													>
														{admin.name}
													</div>
													<div className="text-sm text-gray-500">
														{admin.email}
													</div>
												</div>
											</div>
										</td>

										<td className="px-6 py-4 whitespace-nowrap">
											<div
												className={isProcessing ? 'opacity-50' : ''}
											>
												{getAdminRoleBadge(admin.role)}
											</div>
										</td>

										<td className="px-6 py-4 whitespace-nowrap">
											<div
												className={isProcessing ? 'opacity-50' : ''}
											>
												{getAdminStatusBadge(admin.status)}
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
												{admin.lastLoginAt
													? formatDate(admin.lastLoginAt)
													: 'Never'}
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
												{formatDate(admin.createdAt)}
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
													{getActionButtons(admin)}
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
					itemName="admin"
				/>
			</div>
		</TabsContent>
	);
};

export default AdminsTable;
