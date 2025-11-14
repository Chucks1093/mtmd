import React, { useState, useEffect } from 'react';
import { BarChart3, Map as MapIcon, MapPin } from 'lucide-react';
import ToiletReportsMap from './ToiletReportsMap';
import FormSelector from './FormSelector';
import FinancialMetricCard, {
	FinancialMetricCardSkeletons,
} from '@/components/dashboard/FinancialMetricsCard';
import StepSummary from '../dashboard/StepSummary';
import { numberWithCommas } from '@/lib/utils';
import {
	processToiletReportsForMap,
	filterReportsForMap,
	getStateStatistics,
	getTopStates,
	getConditionDistribution,
	type ToiletReport,
	type StateStatistics,
	NIGERIAN_STATES,
} from './mapDataUtils';
import reportService from '@/services/report.service';
import { motion } from 'framer-motion';

interface DashboardMapViewProps {
	className?: string;
}

const DashboardMapView: React.FC<DashboardMapViewProps> = ({
	className = '',
}) => {
	const [reports, setReports] = useState<ToiletReport[]>([]);
	const [filteredReports, setFilteredReports] = useState<ToiletReport[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedState, setSelectedState] = useState<string | null>(null);
	const [stateStats, setStateStats] = useState<StateStatistics | null>(null);
	const [activeView, setActiveView] = useState<'map' | 'statistics'>('map');

	// Filter states
	const [filters, setFilters] = useState({
		status: '',
		condition: '',
		facilityType: '',
		state: '',
	});

	// Dropdown options
	const statusOptions = [
		{ value: '', label: 'All Status' },
		{ value: 'APPROVED', label: 'Approved' },
		{ value: 'PENDING', label: 'Pending' },
		{ value: 'REJECTED', label: 'Rejected' },
	];

	const conditionOptions = [
		{ value: '', label: 'All Conditions' },
		{ value: 'EXCELLENT', label: 'Excellent' },
		{ value: 'GOOD', label: 'Good' },
		{ value: 'FAIR', label: 'Fair' },
		{ value: 'POOR', label: 'Poor' },
		{ value: 'VERY_POOR', label: 'Very Poor' },
	];

	const facilityTypeOptions = [
		{ value: '', label: 'All Facilities' },
		{ value: 'PUBLIC', label: 'Public' },
		{ value: 'PRIVATE', label: 'Private' },
		{ value: 'SCHOOL', label: 'School' },
		{ value: 'HOSPITAL', label: 'Hospital' },
		{ value: 'MARKET', label: 'Market' },
		{ value: 'OFFICE', label: 'Office' },
		{ value: 'RESIDENTIAL', label: 'Residential' },
		{ value: 'OTHER', label: 'Other' },
	];

	const stateOptions = [
		{ value: '', label: 'All States' },
		...NIGERIAN_STATES.map(state => ({
			value: state,
			label: state,
		})),
	];

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
			status: filters.status as
				| 'APPROVED'
				| 'PENDING'
				| 'REJECTED'
				| undefined,
			condition: filters.condition as
				| 'EXCELLENT'
				| 'GOOD'
				| 'FAIR'
				| 'POOR'
				| 'VERY_POOR'
				| undefined,
			facilityType: filters.facilityType as
				| 'PUBLIC'
				| 'PRIVATE'
				| 'SCHOOL'
				| 'HOSPITAL'
				| 'MARKET'
				| 'OFFICE'
				| 'RESIDENTIAL'
				| 'OTHER'
				| undefined,
			state: filters.state || undefined,
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
	const topStates = getTopStates(filteredReports, 5);
	const conditionDistribution = getConditionDistribution(filteredReports);

	// Handle state click on map
	const handleStateClick = (stateName: string, reportCount: number) => {
		console.log(reportCount);
		setSelectedState(stateName);
		setActiveView('statistics');
	};

	// Handle filter changes
	const updateFilter = (key: string, value: string) => {
		setFilters(prev => ({
			...prev,
			[key]: value,
		}));
	};

	// Calculate metrics
	const totalReports = filteredReports.length;
	const approvedReports = filteredReports.filter(
		r => r.status === 'APPROVED'
	).length;
	const pendingReports = filteredReports.filter(
		r => r.status === 'PENDING'
	).length;
	const rejectedReports = filteredReports.filter(
		r => r.status === 'REJECTED'
	).length;

	return (
		<motion.div
			className={`max-w-7xl overflow-x-hidden mx-auto p-4 pt-5 space-y-6 ${className}`}
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-jakarta">Toilet Reports Map</h1>
					<p className="text-gray-600 mt-1">
						Visualizing toilet condition reports across Nigeria
					</p>
				</div>

				{/* View Toggle */}
				<div className="flex bg-gray-100 rounded-lg p-1">
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
			</div>

			{/* Metrics Cards */}
			{loading && <FinancialMetricCardSkeletons hideInfo count={4} />}

			{!loading && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<FinancialMetricCard
						value={numberWithCommas(totalReports)}
						title="Total Reports"
						status="verified"
						iconColor="bg-green-100 border border-green-400"
						hideInfo
						className="rounded-md "
						icon={<MapIcon className="size-5 text-green-400" />}
					/>
					<FinancialMetricCard
						value={numberWithCommas(pendingReports)}
						title="Pending Review"
						status="verified"
						iconColor="bg-orange-100 border border-orange-400"
						hideInfo
						className="rounded-md"
						icon={<BarChart3 className="size-5 text-orange-400" />}
					/>
					<FinancialMetricCard
						value={numberWithCommas(approvedReports)}
						title="Approved Reports"
						status="verified"
						iconColor="bg-green-100 border border-green-400"
						hideInfo
						className="rounded-md"
						icon={<BarChart3 className="size-5 text-green-400" />}
					/>
					<FinancialMetricCard
						value={numberWithCommas(rejectedReports)}
						title="Rejected Reports"
						status="verified"
						iconColor="bg-red-100 border border-red-400"
						hideInfo
						className="rounded-md"
						icon={<BarChart3 className="size-5 text-red-400" />}
					/>
				</div>
			)}

			{/* Filters */}
			<div className="bg-white rounded-lg border p-6 hidden">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<FormSelector
						label="Status"
						value={filters.status}
						onChange={value => updateFilter('status', value)}
						options={statusOptions}
						placeholder="Select status"
						searchable={false}
					/>

					<FormSelector
						label="Condition"
						value={filters.condition}
						onChange={value => updateFilter('condition', value)}
						options={conditionOptions}
						placeholder="Select condition"
						searchable={false}
					/>

					<FormSelector
						label="Facility Type"
						value={filters.facilityType}
						onChange={value => updateFilter('facilityType', value)}
						options={facilityTypeOptions}
						placeholder="Select facility"
						searchable={false}
					/>

					<FormSelector
						label="State"
						value={filters.state}
						onChange={value => updateFilter('state', value)}
						options={stateOptions}
						placeholder="Select state"
						searchable={true}
					/>
				</div>
			</div>

			{/* Main Content */}
			{activeView === 'map' ? (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Map */}
					<div className="lg:col-span-2">
						{loading ? (
							<div className="flex items-center justify-center h-96 bg-white rounded-lg border">
								<div className="text-center">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
									<span className="text-gray-600">
										Loading map data...
									</span>
								</div>
							</div>
						) : (
							<ToiletReportsMap
								data={mapData}
								colorScheme="green"
								onStateClick={handleStateClick}
								geoDataUrl="https://mtmd.t3.storage.dev/data/nigeria_state_boundaries.json"
								className="h-full"
							/>
						)}
					</div>

					{/* Summary Stats */}
					<div className="space-y-6">
						{/* Top States */}
						<div className="bg-white rounded-lg border p-4">
							<h3 className="font-semibold text-gray-900 mb-4">
								Top States
							</h3>
							<div className="space-y-2">
								{topStates.map((state, index) => (
									<div
										key={state.state}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<span className="text-sm text-gray-500">
												#{index + 1}
											</span>
											<span className="text-sm font-medium">
												{state.state}
											</span>
										</div>
										<span className="text-sm font-bold text-green-600">
											{state.count}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Condition Distribution */}
						<div className="bg-white rounded-lg border p-4">
							<h3 className="font-semibold text-gray-900 mb-4">
								Condition Distribution
							</h3>
							<div className="space-y-3">
								{conditionDistribution.map(item => (
									<div
										key={item.condition}
										className="flex items-center justify-between"
									>
										<span className="text-sm capitalize">
											{item.condition.toLowerCase()}
										</span>
										<div className="flex items-center gap-2">
											<span className="text-sm font-bold text-gray-900">
												{item.count}
											</span>
											<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
												{item.percentage}%
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			) : (
				/* Statistics View */
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{selectedState && stateStats ? (
						<>
							{/* Selected State Details */}
							<div className="bg-white rounded-lg border p-6 h-fit">
								<div className="flex items-center gap-2 mb-6">
									<MapPin className="w-5 h-5 text-green-600" />
									<h3 className="text-lg font-semibold text-gray-900">
										{selectedState}
									</h3>
								</div>

								<div className="grid grid-cols-2 gap-4 mb-6">
									<div className="bg-green-50 rounded-lg p-4 text-center">
										<div className="text-3xl font-bold text-green-600 mb-1">
											{stateStats.total}
										</div>
										<div className="text-sm text-green-700 font-medium">
											Total Reports
										</div>
									</div>
									<div className="bg-green-50 rounded-lg p-4 text-center">
										<div className="text-3xl font-bold text-green-600 mb-1">
											{stateStats.approved}
										</div>
										<div className="text-sm text-green-700 font-medium">
											Approved
										</div>
									</div>
									<div className="bg-yellow-50 rounded-lg p-4 text-center">
										<div className="text-3xl font-bold text-yellow-600 mb-1">
											{stateStats.pending}
										</div>
										<div className="text-sm text-yellow-700 font-medium">
											Pending
										</div>
									</div>
									<div className="bg-red-50 rounded-lg p-4 text-center">
										<div className="text-3xl font-bold text-red-600 mb-1">
											{stateStats.rejected}
										</div>
										<div className="text-sm text-red-700 font-medium">
											Rejected
										</div>
									</div>
								</div>
								<StepSummary
									title="Toilet Conditions Breakdown"
									data={[
										{
											name: 'Excellent Condition',
											value: `${stateStats.excellent} reports`,
											type: 'string',
										},
										{
											name: 'Good Condition',
											value: `${stateStats.good} reports`,
											type: 'string',
										},
										{
											name: 'Fair Condition',
											value: `${stateStats.fair} reports`,
											type: 'string',
										},
										{
											name: 'Poor Condition',
											value: `${stateStats.poor} reports`,
											type: 'string',
										},
										{
											name: 'Very Poor Condition',
											value: `${stateStats.veryPoor} reports`,
											type: 'string',
										},
									]}
								/>
							</div>

							{/* Condition Breakdown */}
							<div className="bg-white rounded-lg border p-6 h-fit">
								{/* Facility Types Summary */}
								<StepSummary
									title="Facility Types Breakdown"
									data={[
										{
											name: 'Public Facilities',
											value: `${stateStats.facilities.public} reports`,
											type: 'string',
										},
										{
											name: 'Private Facilities',
											value: `${stateStats.facilities.private} reports`,
											type: 'string',
										},
										{
											name: 'School Facilities',
											value: `${stateStats.facilities.school} reports`,
											type: 'string',
										},
										{
											name: 'Hospital Facilities',
											value: `${stateStats.facilities.hospital} reports`,
											type: 'string',
										},
										{
											name: 'Market Facilities',
											value: `${stateStats.facilities.market} reports`,
											type: 'string',
										},
										{
											name: 'Office Facilities',
											value: `${stateStats.facilities.office} reports`,
											type: 'string',
										},
										{
											name: 'Residential Facilities',
											value: `${stateStats.facilities.residential} reports`,
											type: 'string',
										},
										{
											name: 'Other Facilities',
											value: `${stateStats.facilities.other} reports`,
											type: 'string',
										},
									]}
								/>
							</div>
						</>
					) : (
						<div className="lg:col-span-2 flex items-center justify-center h-64 bg-gray-50 rounded-lg">
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
		</motion.div>
	);
};

export default DashboardMapView;
