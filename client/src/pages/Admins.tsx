import AdminsTable from '@/components/dashboard/AdminsTable';
import FinancialMetricCard, {
	FinancialMetricCardSkeletons,
} from '@/components/dashboard/FinancialMetricsCard';
import { Tabs } from '@/components/ui/tabs';
import { numberWithCommas } from '@/lib/utils';
import { authService } from '@/services/auth.service';
import showToast from '@/utils/toast.util';

import { motion } from 'framer-motion';
import { UserPlus, Users, Shield, Clock, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useProfileStore } from '@/hooks/useProfileStore';

// Invite Modal Component
import InviteAdminModal from '@/components/dashboard/InviteAdminModal';

function Admins() {
	const [loadingStats, setLoadingStats] = useState(false);
	const [showInviteModal, setShowInviteModal] = useState(false);
	const { profile } = useProfileStore();
	const [adminStats, setAdminStats] = useState({
		totalAdmins: 0,
		activeAdmins: 0,
		systemAdmins: 0,
		pendingInvites: 0,
	});

	// Check if current user is System Admin
	const isSystemAdmin = profile?.role === 'SYSTEM_ADMIN';

	const handleInviteAdmin = () => {
		if (!isSystemAdmin) {
			showToast.error('Only System Admins can send invitations');
			return;
		}
		setShowInviteModal(true);
	};

	const fetchAdminStats = async () => {
		try {
			setLoadingStats(true);
			const result = await authService.getAdminStats();

			setAdminStats({
				totalAdmins: result.data.totalAdmins,
				activeAdmins: result.data.activeAdmins,
				systemAdmins: result.data.systemAdmins,
				pendingInvites: result.data.pendingInvites,
			});
		} catch (error) {
			console.error('Failed to fetch admin stats:', error);
			showToast.error('Failed to load admin statistics');
		} finally {
			setLoadingStats(false);
		}
	};

	useEffect(() => {
		fetchAdminStats();
	}, []);

	return (
		<motion.div
			className="max-w-7xl overflow-x-hidden mx-auto p-6 pt-10"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
		>
			<div className="flex gap-5 lg:items-center justify-between mb-6 flex-col lg:flex-row">
				<h1 className="text-2xl font-jakarta">Admin Management</h1>
				{isSystemAdmin && (
					<button
						onClick={handleInviteAdmin}
						className={`bg-green-600 w-fit hover:bg-green-700 active:bg-green-800
						disabled:bg-green-300 disabled:cursor-not-allowed
						text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 
						focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
						flex items-center gap-2 justify-center`}
					>
						<UserPlus />
						Invite Admin
					</button>
				)}
			</div>

			{loadingStats && <FinancialMetricCardSkeletons hideInfo count={4} />}

			{!loadingStats && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<FinancialMetricCard
						value={numberWithCommas(adminStats.totalAdmins)}
						title="Total Admins"
						status="verified"
						iconColor="bg-blue-100 border border-blue-400"
						hideInfo
						className="rounded-md"
						icon={<Users className="size-5 text-blue-400" />}
					/>
					<FinancialMetricCard
						value={numberWithCommas(adminStats.activeAdmins)}
						title="Active Admins"
						status="verified"
						iconColor="bg-green-100 border border-green-400"
						hideInfo
						className="rounded-md"
						icon={<CheckCircle className="size-5 text-green-400" />}
					/>
					<FinancialMetricCard
						value={numberWithCommas(adminStats.systemAdmins)}
						title="System Admins"
						status="verified"
						iconColor="bg-purple-100 border border-purple-400"
						hideInfo
						className="rounded-md"
						icon={<Shield className="size-5 text-purple-400" />}
					/>
					<FinancialMetricCard
						value={numberWithCommas(adminStats.pendingInvites)}
						title="Pending Invites"
						status="verified"
						iconColor="bg-orange-100 border border-orange-400"
						hideInfo
						className="rounded-md"
						icon={<Clock className="size-5 text-orange-400" />}
					/>
				</div>
			)}

			<Tabs defaultValue="admins">
				<AdminsTable onStatsUpdate={fetchAdminStats} />
			</Tabs>

			{/* Invite Modal */}
			<InviteAdminModal
				isOpen={showInviteModal}
				onClose={() => setShowInviteModal(false)}
				onSuccess={fetchAdminStats}
			/>
		</motion.div>
	);
}

export default Admins;
