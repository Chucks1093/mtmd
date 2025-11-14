import PartnersTable from '@/components/dashboard/PartnersTable';
import FinancialMetricCard, {
	FinancialMetricCardSkeletons,
} from '@/components/dashboard/FinancialMetricsCard';
import { Tabs } from '@/components/ui/tabs';
import { numberWithCommas } from '@/lib/utils';
import partnerService from '@/services/partner.service';
import showToast from '@/utils/toast.util';

import { motion } from 'framer-motion';
import { Plus, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useProfileStore } from '@/hooks/useProfileStore';

// Add Partner Modal Component
import AddPartnerModal from '@/components/dashboard/AddPartnerModal';

function Partners() {
	const [loadingStats, setLoadingStats] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const { profile } = useProfileStore();
	const [partnerStats, setPartnerStats] = useState({
		totalPartners: 0,
		activePartners: 0,
		featuredPartners: 0,
		pendingPartners: 0,
	});

	// Check if current user is Admin (both SYSTEM_ADMIN and ADMIN can add partners)
	const isAdmin =
		profile?.role === 'SYSTEM_ADMIN' || profile?.role === 'ADMIN';

	const handleAddPartner = () => {
		if (!isAdmin) {
			showToast.error('Only Admins can add new partners');
			return;
		}
		setShowAddModal(true);
	};

	const fetchPartnerStats = async () => {
		try {
			setLoadingStats(true);
			const result = await partnerService.getPartnerStats();

			if (result.success && result.data) {
				setPartnerStats({
					totalPartners: result.data.totalPartners,
					activePartners: result.data.activePartners,
					featuredPartners: result.data.featuredPartners,
					pendingPartners: result.data.pendingPartners,
				});
			}
		} catch (error) {
			console.error('Failed to fetch partner stats:', error);
			showToast.error('Failed to load partner statistics');
		} finally {
			setLoadingStats(false);
		}
	};

	useEffect(() => {
		fetchPartnerStats();
	}, []);

	return (
		<motion.div
			className="max-w-7xl overflow-x-hidden mx-auto p-6 pt-10"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
		>
			<div className="flex gap-5 lg:items-center justify-between mb-6 flex-col lg:flex-row">
				<h1 className="text-2xl font-jakarta">Partner Management</h1>
				{isAdmin && (
					<button
						onClick={handleAddPartner}
						className={`bg-green-600 w-fit hover:bg-green-700 active:bg-green-800
						disabled:bg-green-300 disabled:cursor-not-allowed
						text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 
						focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
						flex items-center gap-2 justify-center`}
					>
						<Plus />
						Add Partner
					</button>
				)}
			</div>

			{loadingStats && <FinancialMetricCardSkeletons hideInfo count={2} />}

			{!loadingStats && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<FinancialMetricCard
						value={numberWithCommas(partnerStats.totalPartners)}
						title="Total Partners"
						status="verified"
						iconColor="bg-blue-100"
						hideInfo
						className="rounded-md"
						icon={<Building2 className="size-5 text-blue-400" />}
					/>
				</div>
			)}

			<Tabs defaultValue="partners">
				<PartnersTable onStatsUpdate={fetchPartnerStats} />
			</Tabs>

			{/* Add Partner Modal */}
			<AddPartnerModal
				partner={null}
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				onSuccess={fetchPartnerStats}
			/>
		</motion.div>
	);
}

export default Partners;
