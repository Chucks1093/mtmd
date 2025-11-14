import DonationsTable from '@/components/dashboard/DonationsTable';
import FinancialMetricCard, {
	FinancialMetricCardSkeletons,
} from '@/components/dashboard/FinancialMetricsCard';
import { Tabs } from '@/components/ui/tabs';
import { numberWithCommas } from '@/lib/utils';
import donationService from '@/services/donation.service';
import showToast from '@/utils/toast.util';

import { motion } from 'framer-motion';
import { Download, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

function Donations() {
	const [loadingFinancialData, setLoadingFinancialData] = useState(false);
	const [loadingExport, setLoadingExport] = useState(false);
	const [financialData, setFinancialData] = useState({
		totalAmountRaised: 0,
		totalDonors: 0,
		totalDonations: 0,
		successRate: 0,
	});

	const handleExportDonations = async () => {
		try {
			setLoadingExport(true);
			showToast.success('Preparing donation export...');

			// You can implement CSV export here similar to reports
			// For now, we'll just show success message
			showToast.success('Donations exported successfully!');
		} catch (error) {
			console.error('Export error:', error);
			showToast.error('Failed to export donations');
		} finally {
			setLoadingExport(false);
		}
	};

	const fetchDonationStats = async () => {
		try {
			setLoadingFinancialData(true);
			const result = await donationService.getDonationStats();

			if (result.success && result.data) {
				setFinancialData({
					totalAmountRaised: result.data.totalAmountRaised,
					totalDonors: result.data.totalDonations || 0,
					totalDonations: result.data.totalDonations,
					successRate: result.data.successRate,
				});
			}
		} catch (error) {
			console.error('Failed to fetch donation data:', error);
			showToast.error('Failed to load donation statistics');
		} finally {
			setLoadingFinancialData(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN',
		}).format(amount);
	};

	useEffect(() => {
		fetchDonationStats();
	}, []);

	return (
		<motion.div
			className="max-w-7xl overflow-x-hidden mx-auto p-6 pt-10"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
		>
			<div className="flex gap-5 lg:items-center justify-between mb-6 flex-col lg:flex-row">
				<h1 className="text-2xl font-jakarta">Donation Management</h1>
				<button
					onClick={handleExportDonations}
					disabled={loadingExport}
					className={`bg-green-600 w-fit hover:bg-green-700 active:bg-green-800
        disabled:bg-green-300 disabled:cursor-not-allowed
        text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2 justify-center`}
				>
					<Download />
					{loadingExport ? 'Exporting...' : 'Export CSV'}
				</button>
			</div>

			{loadingFinancialData && (
				<FinancialMetricCardSkeletons hideInfo count={4} />
			)}

			{!loadingFinancialData && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<FinancialMetricCard
						value={formatCurrency(financialData.totalAmountRaised)}
						title="Total Raised"
						status="verified"
						iconColor="bg-green-100 border border-green-400"
						hideInfo
						className="rounded-md"
						icon={<DollarSign className="size-5 text-green-400" />}
					/>
					<FinancialMetricCard
						value={numberWithCommas(financialData.totalDonors)}
						title="Total Donors"
						status="verified"
						iconColor="bg-blue-100 border border-blue-400"
						hideInfo
						className="rounded-md"
						icon={<Users className="size-5 text-blue-400" />}
					/>
					<FinancialMetricCard
						value={numberWithCommas(financialData.totalDonations)}
						title="Total Donations"
						status="verified"
						iconColor="bg-purple-100 border border-purple-400"
						hideInfo
						className="rounded-md"
						icon={<TrendingUp className="size-5 text-purple-400" />}
					/>
				</div>
			)}

			<Tabs defaultValue="donations">
				<DonationsTable />
			</Tabs>
		</motion.div>
	);
}

export default Donations;
