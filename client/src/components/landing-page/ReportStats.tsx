import { useState, useEffect } from 'react';
import {
	BarChart3,
	Map as MapIcon,
	MapPin,
	Building2,
	Brain,
	Folder,
	FolderCheck,
	ClipboardList,
	GraduationCap,
	Home,
	Cross,
	ShoppingCart,
	Building,
	Users,
	MoreHorizontal,
} from 'lucide-react';
import ToiletReportsMap from '../shared/ToiletReportsMap';
import {
	processToiletReportsForMap,
	filterReportsForMap,
	getStateStatistics,
	type ToiletReport,
	type StateStatistics,
} from '../shared/mapDataUtils';
import reportService from '@/services/report.service';
import FinancialMetricCard from '../dashboard/FinancialMetricsCard';
import { cn, numberWithCommas } from '@/lib/utils';
import CircularSpinner from '../common/CircularSpinnerProps';

type SelectedStateStatsProps = {
	selectedState: string;
	stateStats: StateStatistics;
};

const SelectedStateStats = ({
	selectedState,
	stateStats,
}: SelectedStateStatsProps) => {
	const toiletAnalysis = [
		{
			id: 'state-overview',
			icon: <MapPin className="w-5 h-5 text-blue-500" />,
			title: `${selectedState} State Report`,
			details: (
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<FinancialMetricCard
							value={numberWithCommas(stateStats.total)}
							title="TOTAL"
							icon={<Folder className="w-5 h-5 text-blue-600" />}
							iconColor="bg-blue-50 border border-blue-300"
							hideInfo
							className="rounded-md"
						/>
						<FinancialMetricCard
							value={numberWithCommas(stateStats.approved)}
							title="APPROVED"
							icon={<FolderCheck className="w-5 h-5 text-green-600" />}
							iconColor="bg-green-50 border border-green-300"
							hideInfo
							className="rounded-md"
						/>
					</div>
				</div>
			),
		},
		{
			id: 'ai-insights',
			icon: <Brain className="w-5 h-5" />,
			title: 'Total Summary',
			details: (
				<div className="p-5 bg-white  rounded-lg">
					<p className="text-gray-600 text-sm leading-relaxed">
						{selectedState} shows a sanitation performance of{' '}
						<strong>
							{(
								((stateStats.good + stateStats.excellent) /
									stateStats.total) *
								100
							).toFixed(1)}
							%
						</strong>{' '}
						good or better facilities across all reported toilet
						infrastructures. This indicates a{' '}
						<strong>
							{stateStats.excellent > stateStats.poor
								? 'relatively strong sanitation profile'
								: 'moderately concerning sanitation profile'}
						</strong>{' '}
						with varying levels of cleanliness and maintenance practices
						across public, private, and institutional facilities.
						<br />
						<br />
						Analysis suggests that{' '}
						{stateStats.excellent > stateStats.poor
							? 'most local authorities and facility managers demonstrate consistent efforts in maintaining hygiene standards, with a noticeable emphasis on regular upkeep and proper waste disposal.'
							: 'a considerable number of toilets, particularly in high-traffic areas such as markets and public schools, require immediate attention to cleaning, plumbing, and general facility management.'}
						<br />
						<br />
						The current data reveals that while{' '}
						<strong className="text-green-700">
							{stateStats.approved}
						</strong>{' '}
						reports have met the required sanitation benchmarks, there
						remains a significant portion marked as{' '}
						<strong className="text-yellow-700">
							{stateStats.pending}
						</strong>{' '}
						pending and{' '}
						<strong className="text-red-700">
							{stateStats.rejected}
						</strong>{' '}
						rejected, suggesting gaps in either reporting accuracy,
						follow-up inspection, or facility documentation.
						<br />
						<br />
						Overall, {selectedState} demonstrates{' '}
						{stateStats.excellent > stateStats.poor
							? 'positive progress toward improving toilet hygiene and accessibility, reflecting gradual adoption of sanitation best practices.'
							: 'persistent challenges that highlight the need for increased government oversight, better resource allocation, and stronger collaboration with local communities to ensure sustainable sanitation improvements.'}
					</p>
				</div>
			),
		},
		{
			id: 'facility-breakdown',
			icon: <ClipboardList className="w-5 h-5" />,
			title: 'FACILITY BREAKDOWN',
			details: (
				<div className="grid grid-cols-2 gap-4">
					<FinancialMetricCard
						value={numberWithCommas(stateStats.facilities.public)}
						title="PUBLIC"
						iconColor="bg-blue-50 border border-blue-400"
						icon={<Building2 className="w-5 h-5 text-blue-700" />}
						hideInfo
					/>
					<FinancialMetricCard
						value={numberWithCommas(stateStats.facilities.private)}
						title="PRIVATE"
						iconColor="bg-purple-50 border border-purple-400"
						icon={<Home className="w-5 h-5 text-purple-700" />}
						hideInfo
					/>
					<FinancialMetricCard
						value={numberWithCommas(stateStats.facilities.school)}
						title="SCHOOL"
						iconColor="bg-green-50 border border-green-400"
						icon={<GraduationCap className="w-5 h-5 text-green-700" />}
						hideInfo
					/>
					<FinancialMetricCard
						value={numberWithCommas(stateStats.facilities.hospital)}
						title="HOSPITAL"
						iconColor="bg-red-50 border border-red-400"
						icon={<Cross className="w-5 h-5 text-red-700" />}
						hideInfo
					/>
					<FinancialMetricCard
						value={numberWithCommas(stateStats.facilities.market)}
						title="MARKET"
						iconColor="bg-yellow-50 border border-yellow-400"
						icon={<ShoppingCart className="w-5 h-5 text-yellow-700" />}
						hideInfo
					/>
					<FinancialMetricCard
						value={numberWithCommas(stateStats.facilities.office)}
						title="OFFICE"
						iconColor="bg-cyan-50 border border-cyan-400"
						icon={<Building className="w-5 h-5 text-cyan-700" />}
						hideInfo
					/>
					<FinancialMetricCard
						value={numberWithCommas(stateStats.facilities.residential)}
						title="RESIDENTIAL"
						iconColor="bg-indigo-50 border border-indigo-400"
						icon={<Users className="w-5 h-5 text-indigo-700" />}
						hideInfo
					/>
					<FinancialMetricCard
						value={numberWithCommas(stateStats.facilities.other)}
						title="OTHER"
						iconColor="bg-gray-50 border border-gray-400"
						icon={<MoreHorizontal className="w-5 h-5 text-gray-700" />}
						hideInfo
					/>
				</div>
			),
		},
	];
	return (
		<div className="space-y-10 mt-8 ">
			{toiletAnalysis.map((step, index) => (
				<div
					key={step.id}
					className="relative flex space-x-3 w-full mx-auto max-w-2xl"
				>
					<div>
						<div
							className={cn(
								'z-10 size-10 rounded-full flex items-center justify-center p-2 border border-gray-300 bg-white text-gray-500',
								index == 0 && 'border-blue-500'
							)}
						>
							{step.icon}
						</div>
						{index < toiletAnalysis.length - 1 && (
							<div className="w-0.5 h-full mx-auto  bg-gray-200" />
						)}
					</div>

					<div className="flex-1 min-w-0 pt-1 space-y-5">
						<h1 className="text-lg font-medium text-gray-600 uppercase">
							{step.title}
						</h1>
						<div className="bg-white p-4 rounded-lg border-dashed border border-gray-300">
							{step.details}
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

const ReportStats = () => {
	const [reports, setReports] = useState<ToiletReport[]>([]);
	const [filteredReports, setFilteredReports] = useState<ToiletReport[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedState, setSelectedState] = useState<string | null>(null);
	const [stateStats, setStateStats] = useState<StateStatistics | null>(null);
	const [activeView, setActiveView] = useState<'map' | 'statistics'>('map');

	// Filter states
	const [filters] = useState({
		status: '' as 'APPROVED' | 'PENDING' | 'REJECTED' | '',
		condition: '' as
			| 'EXCELLENT'
			| 'GOOD'
			| 'FAIR'
			| 'POOR'
			| 'VERY_POOR'
			| '',
		facilityType: '' as
			| 'PUBLIC'
			| 'PRIVATE'
			| 'SCHOOL'
			| 'HOSPITAL'
			| 'MARKET'
			| 'OFFICE'
			| 'RESIDENTIAL'
			| 'OTHER'
			| '',
		dateRange: { start: '', end: '' },
	});

	// Load reports data
	useEffect(() => {
		const loadReports = async () => {
			try {
				setLoading(true);
				const { data } = await reportService.getAllReports();
				setReports(data.reports);
				setFilteredReports(data.reports);
			} catch (error) {
				console.error('Error loading toilet reports:', error);
			} finally {
				setLoading(false);
			}
		};

		loadReports();
	}, []);

	// Apply filters
	useEffect(() => {
		const filtered = filterReportsForMap(reports, {
			status: filters.status || undefined,
			condition: filters.condition || undefined,
			facilityType: filters.facilityType || undefined,
			dateRange:
				filters.dateRange.start && filters.dateRange.end
					? filters.dateRange
					: undefined,
		});
		setFilteredReports(filtered);
	}, [reports, filters]);

	// Update state statistics when state is selected
	useEffect(() => {
		if (selectedState && filteredReports.length > 0) {
			const stats = getStateStatistics(filteredReports, selectedState);
			setStateStats(stats);
		} else {
			setStateStats(null);
		}
	}, [selectedState, filteredReports]);

	// Process data for map visualization
	const mapData = processToiletReportsForMap(filteredReports);

	// Handle state click on map
	const handleStateClick = (stateName: string, reportCount: number) => {
		console.log(reportCount);
		setSelectedState(stateName);
		setActiveView('statistics');
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center maw-w-7xl h-96">
				<div className="text-center">
					<CircularSpinner
						className="mx-auto mb-2 "
						color="oklch(72.3% 0.219 149.579)"
					/>
					<p className="text-gray-600">Loading Report ...</p>
				</div>
			</div>
		);
	}

	return (
		<section className="max-w-7xl mx-auto flex flex-col items-center my-[4rem] px-4">
			{/* Header */}
			<p className="px-4 py-2 rounded-lg bg-green-50 text-green-500">
				Report Stats
			</p>
			<h1 className="text-gray-700 tracking-tight font-space-grotesk text-[1.8rem] md:text-[3rem] font-semibold mt-3 text-center">
				Toilet Reports Map View
			</h1>
			<p className="text-gray-600 text-md md:text-lg mt-2 text-center max-w-2xl">
				Visualizing toilet condition reports across Nigeria to understand
				sanitation quality, maintenance trends, and regional disparities.
			</p>
			{/* View Toggle */}
			<div className="flex bg-gray-100 w-fit rounded-lg p-1 mt-3">
				<button
					onClick={() => setActiveView('map')}
					className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
						activeView === 'map'
							? 'bg-white shadow-sm text-green-600'
							: 'text-gray-600 hover:text-gray-900'
					}`}
				>
					<MapIcon className="w-4 h-4" />
					Map View
				</button>
				<button
					onClick={() => setActiveView('statistics')}
					className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
						activeView === 'statistics'
							? 'bg-white shadow-sm text-green-600'
							: 'text-gray-600 hover:text-gray-900'
					}`}
				>
					<BarChart3 className="w-4 h-4" />
					Statistics
				</button>
			</div>

			{/* Main Content */}
			{activeView === 'map' ? (
				<div className="w-full max-w-5xl">
					<ToiletReportsMap
						data={mapData}
						colorScheme="green"
						onStateClick={handleStateClick}
						geoDataUrl="https://mtmd.t3.storage.dev/data/nigeria_state_boundaries.json"
						className="w-full mt-4"
					/>
				</div>
			) : (
				/* Statistics View */
				<div className="w-full max-w-5xl">
					{selectedState && stateStats ? (
						<SelectedStateStats
							selectedState={selectedState}
							stateStats={stateStats}
						/>
					) : (
						<div className="lg:col-span-2 flex items-center justify-center h-64 bg-gray-50 border-2 mt-6 border-gray-100 rounded-xl">
							<div className="text-center">
								<MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p className="text-gray-600">
									Click on a state in the map view to see detailed
									statistics
								</p>
							</div>
						</div>
					)}
				</div>
			)}
		</section>
	);
};

export default ReportStats;
