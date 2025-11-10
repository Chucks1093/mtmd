import React, { useState, useEffect } from 'react';
import { BarChart3, Map as MapIcon, Filter, MapPin } from 'lucide-react';
import ToiletReportsMap from './ToiletReportsMap';
import {
	processToiletReportsForMap,
	filterReportsForMap,
	getStateStatistics,
	getTopStates,
	getConditionDistribution,
	type ToiletReport,
	type StateStatistics,
} from './mapDataUtils';
import reportService from '@/services/report.service';

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
	const topStates = getTopStates(filteredReports, 5);
	const conditionDistribution = getConditionDistribution(filteredReports);

	// Handle state click on map
	const handleStateClick = (stateName: string, reportCount: number) => {
		console.log(reportCount);
		setSelectedState(stateName);
		setActiveView('statistics');
	};

	// Handle filter changes
	const updateFilter = (key: string, value: string | number) => {
		setFilters(prev => ({
			...prev,
			[key]: value,
		}));
	};

	// Clear all filters
	const clearFilters = () => {
		setFilters({
			status: '',
			condition: '',
			facilityType: '',
			dateRange: { start: '', end: '' },
		});
		setSelectedState(null);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
				<span className="ml-3 text-gray-600">
					Loading toilet reports...
				</span>
			</div>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Toilet Reports Map View
					</h1>
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
								? 'bg-white shadow-sm text-blue-600'
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
								? 'bg-white shadow-sm text-blue-600'
								: 'text-gray-600 hover:text-gray-900'
						}`}
					>
						<BarChart3 className="w-4 h-4" />
						Statistics
					</button>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg border p-4">
				<div className="flex items-center gap-4 flex-wrap">
					<div className="flex items-center gap-2">
						<Filter className="w-4 h-4 text-gray-500" />
						<span className="text-sm font-medium text-gray-700">
							Filters:
						</span>
					</div>

					{/* Status Filter */}
					<select
						value={filters.status}
						onChange={e => updateFilter('status', e.target.value)}
						className="border border-gray-300 rounded-md px-3 py-1 text-sm"
					>
						<option value="">All Status</option>
						<option value="APPROVED">Approved</option>
						<option value="PENDING">Pending</option>
						<option value="REJECTED">Rejected</option>
					</select>

					{/* Condition Filter */}
					<select
						value={filters.condition}
						onChange={e => updateFilter('condition', e.target.value)}
						className="border border-gray-300 rounded-md px-3 py-1 text-sm"
					>
						<option value="">All Conditions</option>
						<option value="EXCELLENT">Excellent</option>
						<option value="GOOD">Good</option>
						<option value="FAIR">Fair</option>
						<option value="POOR">Poor</option>
						<option value="VERY_POOR">Very Poor</option>
					</select>

					{/* Facility Type Filter */}
					<select
						value={filters.facilityType}
						onChange={e => updateFilter('facilityType', e.target.value)}
						className="border border-gray-300 rounded-md px-3 py-1 text-sm"
					>
						<option value="">All Facilities</option>
						<option value="PUBLIC">Public</option>
						<option value="PRIVATE">Private</option>
						<option value="SCHOOL">School</option>
						<option value="HOSPITAL">Hospital</option>
						<option value="MARKET">Market</option>
						<option value="OFFICE">Office</option>
						<option value="RESIDENTIAL">Residential</option>
						<option value="OTHER">Other</option>
					</select>

					{/* Date Range */}
					{/* <div className="flex items-center gap-2">
						<Calendar className="w-4 h-4 text-gray-500" />
						<input
							type="date"
							value={filters.dateRange.start}
							onChange={e =>
								updateFilter('dateRange', {
									...filters.dateRange,
									start: e.target.value,
								})
							}
							className="border border-gray-300 rounded-md px-3 py-1 text-sm"
						/>
						<span className="text-gray-500">to</span>
						<input
							type="date"
							value={filters.dateRange.end}
							onChange={e =>
								updateFilter('dateRange', {
									...filters.dateRange,
									end: e.target.value,
								})
							}
							className="border border-gray-300 rounded-md px-3 py-1 text-sm"
						/>
					</div> */}

					{/* Clear Filters */}
					<button
						onClick={clearFilters}
						className="text-sm text-blue-600 hover:text-blue-800"
					>
						Clear All
					</button>
				</div>

				{/* Summary */}
				<div className="mt-3 pt-3 border-t border-gray-200">
					<p className="text-sm text-gray-600">
						Showing{' '}
						<span className="font-medium">{filteredReports.length}</span>{' '}
						reports
						{selectedState && (
							<span>
								{' '}
								in <span className="font-medium">{selectedState}</span>
							</span>
						)}
					</p>
				</div>
			</div>

			{/* Main Content */}
			{activeView === 'map' ? (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Map */}
					<div className="lg:col-span-2">
						<ToiletReportsMap
							data={mapData}
							colorScheme="green"
							onStateClick={handleStateClick}
							geoDataUrl="https://mtmd.t3.storage.dev/data/nigeria_state_boundaries.json"
							className="h-full"
						/>
					</div>

					{/* Summary Stats */}
					<div className="space-y-6">
						{/* Quick Stats */}
						<div className="bg-white rounded-lg border p-4">
							<h3 className="font-semibold text-gray-900 mb-4">
								Quick Statistics
							</h3>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-600">Total Reports:</span>
									<span className="font-medium">
										{filteredReports.length}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Approved:</span>
									<span className="font-medium text-green-600">
										{
											filteredReports.filter(
												r => r.status === 'APPROVED'
											).length
										}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Pending:</span>
									<span className="font-medium text-yellow-600">
										{
											filteredReports.filter(
												r => r.status === 'PENDING'
											).length
										}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Rejected:</span>
									<span className="font-medium text-red-600">
										{
											filteredReports.filter(
												r => r.status === 'REJECTED'
											).length
										}
									</span>
								</div>
							</div>
						</div>

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
											<span className="text-sm">{state.state}</span>
										</div>
										<span className="text-sm font-medium">
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
							<div className="space-y-2">
								{conditionDistribution.map(item => (
									<div
										key={item.condition}
										className="flex items-center justify-between"
									>
										<span className="text-sm capitalize">
											{item.condition.toLowerCase()}
										</span>
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium">
												{item.count}
											</span>
											<span className="text-xs text-gray-500">
												({item.percentage}%)
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
							<div className="bg-white rounded-lg border p-6">
								<div className="flex items-center gap-2 mb-4">
									<MapPin className="w-5 h-5 text-blue-600" />
									<h3 className="text-lg font-semibold text-gray-900">
										{selectedState}
									</h3>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="bg-blue-50 rounded-lg p-3">
										<div className="text-2xl font-bold text-blue-600">
											{stateStats.total}
										</div>
										<div className="text-sm text-blue-700">
											Total Reports
										</div>
									</div>
									<div className="bg-green-50 rounded-lg p-3">
										<div className="text-2xl font-bold text-green-600">
											{stateStats.approved}
										</div>
										<div className="text-sm text-green-700">
											Approved
										</div>
									</div>
									<div className="bg-yellow-50 rounded-lg p-3">
										<div className="text-2xl font-bold text-yellow-600">
											{stateStats.pending}
										</div>
										<div className="text-sm text-yellow-700">
											Pending
										</div>
									</div>
									<div className="bg-red-50 rounded-lg p-3">
										<div className="text-2xl font-bold text-red-600">
											{stateStats.rejected}
										</div>
										<div className="text-sm text-red-700">
											Rejected
										</div>
									</div>
								</div>

								<div className="mt-6 pt-4 border-t border-gray-200">
									<h4 className="font-medium text-gray-900 mb-3">
										Facility Types
									</h4>
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div className="flex justify-between">
											<span>Public:</span>
											<span>{stateStats.facilities.public}</span>
										</div>
										<div className="flex justify-between">
											<span>Private:</span>
											<span>{stateStats.facilities.private}</span>
										</div>
										<div className="flex justify-between">
											<span>Schools:</span>
											<span>{stateStats.facilities.school}</span>
										</div>
										<div className="flex justify-between">
											<span>Hospitals:</span>
											<span>{stateStats.facilities.hospital}</span>
										</div>
										<div className="flex justify-between">
											<span>Markets:</span>
											<span>{stateStats.facilities.market}</span>
										</div>
										<div className="flex justify-between">
											<span>Offices:</span>
											<span>{stateStats.facilities.office}</span>
										</div>
									</div>
								</div>
							</div>

							{/* Condition Breakdown */}
							<div className="bg-white rounded-lg border p-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Toilet Conditions in {selectedState}
								</h3>

								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-green-600">Excellent:</span>
										<span className="font-medium">
											{stateStats.excellent}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-blue-600">Good:</span>
										<span className="font-medium">
											{stateStats.good}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-yellow-600">Fair:</span>
										<span className="font-medium">
											{stateStats.fair}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-orange-600">Poor:</span>
										<span className="font-medium">
											{stateStats.poor}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-red-600">Very Poor:</span>
										<span className="font-medium">
											{stateStats.veryPoor}
										</span>
									</div>
								</div>
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
		</div>
	);
};

export default DashboardMapView;
