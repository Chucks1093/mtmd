import ReportsTable from '@/components/dashboard/ReportsTable';
import FinancialMetricCard, {
	FinancialMetricCardSkeletons,
} from '@/components/dashboard/FinancialMetricsCard';
import { Tabs } from '@/components/ui/tabs';
import { numberWithCommas } from '@/lib/utils';
import { reportService } from '@/services/report.service';
import showToast from '@/utils/toast.util';

import { motion } from 'framer-motion';
import { Download, Clipboard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

function Reports() {
	const [loadingFinancialData, setLoadingFinancialData] = useState(false);
	const [loadingExport, setLoadingExport] = useState(false);
	const [financialData, setFinancialData] = useState({
		totalReports: 0,
		pendingReports: 0,
		approvedReports: 0,
		rejectedReports: 0,
	});

	const handleExportReports = async () => {
		try {
			setLoadingExport(true);
			showToast.success('Preparing CSV export...');

			await reportService.exportReports('pdf');

			showToast.success('Reports exported successfully!');
		} catch (error) {
			console.error('Export error:', error);
			showToast.error('Failed to export reports');
		} finally {
			setLoadingExport(false);
		}
	};

	useEffect(() => {
		const fetchReportData = async () => {
			try {
				setLoadingFinancialData(true);
				const result = await reportService.getReportStats();

				setFinancialData({
					totalReports: result.data.totalReports,
					pendingReports: result.data.pendingReports,
					approvedReports: result.data.approvedReports,
					rejectedReports: result.data.rejectedReports,
				});
			} catch (error) {
				console.error('Failed to fetch report data:', error);
			} finally {
				setLoadingFinancialData(false);
			}
		};

		fetchReportData();
	}, []);

	return (
		<motion.div
			className="max-w-7xl overflow-x-hidden mx-auto p-6 pt-10"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
		>
			<div className="flex gap-5  lg:items-center justify-between mb-6 flex-col lg:flex-row">
				<h1 className="text-2xl font-jakarta">Toilet Reports</h1>
				<button
					onClick={handleExportReports}
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
						value={numberWithCommas(financialData.totalReports)}
						title="Total Reports"
						status="verified"
						iconColor="bg-blue-100 border border-blue-400"
						hideInfo
						className=" rounded-md"
						icon={<Clipboard className="size-5 text-blue-400" />}
					/>
					<FinancialMetricCard
						value={numberWithCommas(financialData.pendingReports)}
						title="Pending Review"
						status="verified"
						iconColor="bg-orange-100 border border-orange-400"
						hideInfo
						className=" rounded-md"
						icon={<Clock className="size-5 text-orange-400" />}
					/>
					<FinancialMetricCard
						value={numberWithCommas(financialData.approvedReports)}
						title="Approved Reports"
						status="verified"
						iconColor="bg-green-100 border border-green-400"
						hideInfo
						className=" rounded-md"
						icon={<CheckCircle className="size-5 text-green-400" />}
					/>
					<FinancialMetricCard
						value={numberWithCommas(financialData.rejectedReports)}
						title="Rejected Reports"
						status="verified"
						iconColor="bg-red-100 border border-red-400"
						hideInfo
						className=" rounded-md"
						icon={<XCircle className="size-5 text-red-400" />}
					/>
				</div>
			)}
			<Tabs defaultValue="reports">
				<ReportsTable />
			</Tabs>
		</motion.div>
	);
}

export default Reports;
