import React, { useEffect, useState } from 'react';
import {
	ComposableMap,
	Geographies,
	Geography,
	ZoomableGroup,
} from 'react-simple-maps';

interface ReportData {
	state: string;
	lga?: string;
	count: number;
	status?: 'APPROVED' | 'PENDING' | 'REJECTED';
}

interface StateReportData {
	total: number;
	approved: number;
	pending: number;
	rejected: number;
}

interface GeographyProperties {
	admin1Name?: string;
	state?: string;
	name?: string;
	NAME_1?: string;
	admin1Pcod?: string;
	admin1RefN?: string;
}

interface GeographyFeature {
	rsmKey: string;
	properties: GeographyProperties;
	geometry: {
		type: string;
		coordinates: number[][][];
	};
}

interface GeoJSONData {
	type: 'FeatureCollection';
	features: GeographyFeature[];
}

interface ToiletReportsMapProps {
	data: ReportData[];
	colorScheme?: 'blue' | 'green' | 'orange';
	showTooltip?: boolean;
	onStateClick?: (stateName: string, reportCount: number) => void;
	className?: string;
	geoDataUrl?: string; // Allow custom URL
}

// Color schemes for different visualizations
const COLOR_SCHEMES = {
	blue: {
		light: '#E3F2FD',
		medium: '#42A5F5',
		dark: '#1976D2',
		darkest: '#0D47A1',
	},
	green: {
		light: '#E8F5E8',
		medium: '#66BB6A',
		dark: '#388E3C',
		darkest: '#1B5E20',
	},
	orange: {
		light: '#FFF3E0',
		medium: '#FF9800',
		dark: '#F57C00',
		darkest: '#E65100',
	},
};

const ToiletReportsMap: React.FC<ToiletReportsMapProps> = ({
	data = [],
	colorScheme = 'green',
	showTooltip = true,
	onStateClick,
	className = '',
	geoDataUrl = '/data/nigeria-geo.json', // Default to public folder
}) => {
	// Map loading state
	const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
	const [mapLoading, setMapLoading] = useState(true);
	const [mapError, setMapError] = useState<string | null>(null);

	// Tooltip state
	const [tooltipContent, setTooltipContent] = useState<string>('');
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
	const [showTooltipEl, setShowTooltipEl] = useState(false);
	const [maxReports, setMaxReports] = useState(0);

	// Load GeoJSON data
	useEffect(() => {
		const loadGeoData = async () => {
			try {
				setMapLoading(true);
				setMapError(null);

				console.log('Loading map data from:', geoDataUrl);
				const response = await fetch(geoDataUrl);
				if (!response.ok) {
					throw new Error(
						`Failed to load map data: ${response.status} ${response.statusText}`
					);
				}

				const data: GeoJSONData = await response.json();
				console.log(
					'Map data loaded successfully, features:',
					data.features?.length
				);
				setGeoData(data);
			} catch (error) {
				console.error('Error loading map data:', error);
				setMapError(
					error instanceof Error
						? error.message
						: 'Failed to load map data'
				);
			} finally {
				setMapLoading(false);
			}
		};

		loadGeoData();
	}, [geoDataUrl]);

	// Process data to get state-wise report counts
	const processedData = React.useMemo(() => {
		const stateData: { [key: string]: StateReportData } = {};

		data.forEach(item => {
			const stateName = item.state.toLowerCase().replace(/\s+/g, '_');

			if (!stateData[stateName]) {
				stateData[stateName] = {
					total: 0,
					approved: 0,
					pending: 0,
					rejected: 0,
				};
			}

			stateData[stateName].total += item.count;

			if (item.status) {
				if (item.status === 'APPROVED')
					stateData[stateName].approved += item.count;
				else if (item.status === 'PENDING')
					stateData[stateName].pending += item.count;
				else if (item.status === 'REJECTED')
					stateData[stateName].rejected += item.count;
			}
		});

		return stateData;
	}, [data]);

	// Calculate max reports for color scaling
	useEffect(() => {
		const max = Math.max(
			...Object.values(processedData).map(d => d.total),
			1
		);
		setMaxReports(max);
	}, [processedData]);

	// Get state name from geography properties
	const getStateName = (properties: GeographyProperties): string => {
		return (
			properties.admin1Name ||
			properties.state ||
			properties.name ||
			properties.NAME_1 ||
			'Unknown State'
		);
	};

	// Get color based on report count
	const getStateColor = (stateName: string): string => {
		const stateKey = stateName.toLowerCase().replace(/\s+/g, '_');
		const stateReports = processedData[stateKey];

		if (!stateReports || stateReports.total === 0) {
			return '#F5F5F5'; // Light gray for no data
		}

		const colors = COLOR_SCHEMES[colorScheme];
		const intensity = stateReports.total / maxReports;

		if (intensity < 0.25) return colors.light;
		if (intensity < 0.5) return colors.medium;
		if (intensity < 0.75) return colors.dark;
		return colors.darkest;
	};

	// Handle mouse events for tooltip
	const handleMouseEnter = (
		geo: GeographyFeature,
		evt: React.MouseEvent
	): void => {
		const stateName = getStateName(geo.properties);
		const stateKey = stateName.toLowerCase().replace(/\s+/g, '_');
		const stateData = processedData[stateKey];

		if (stateData && stateData.total > 0) {
			setTooltipContent(`
				<div class="bg-white p-3 rounded-lg shadow-lg border max-w-xs">
					<h3 class="font-semibold text-gray-900">${stateName}</h3>
					<div class="mt-2 space-y-1 text-sm">
						<div class="flex justify-between">
							<span>Total Reports:</span>
							<span class="font-medium">${stateData.total}</span>
						</div>
						<div class="flex justify-between text-green-600">
							<span>Approved:</span>
							<span class="font-medium">${stateData.approved}</span>
						</div>
						<div class="flex justify-between text-yellow-600">
							<span>Pending:</span>
							<span class="font-medium">${stateData.pending}</span>
						</div>
						<div class="flex justify-between text-red-600">
							<span>Rejected:</span>
							<span class="font-medium">${stateData.rejected}</span>
						</div>
					</div>
				</div>
			`);
		} else {
			setTooltipContent(`
				<div class="bg-white p-3 rounded-lg shadow-lg border">
					<h3 class="font-semibold text-gray-900">${stateName}</h3>
					<p class="text-sm text-gray-500 mt-1">No reports yet</p>
				</div>
			`);
		}

		setTooltipPosition({ x: evt.clientX, y: evt.clientY });
		setShowTooltipEl(true);
	};

	const handleMouseMove = (evt: React.MouseEvent): void => {
		setTooltipPosition({ x: evt.clientX, y: evt.clientY });
	};

	const handleMouseLeave = (): void => {
		setShowTooltipEl(false);
	};

	const handleStateClick = (geo: GeographyFeature): void => {
		if (onStateClick) {
			const stateName = getStateName(geo.properties);
			const stateKey = stateName.toLowerCase().replace(/\s+/g, '_');
			const stateData = processedData[stateKey];
			onStateClick(stateName, stateData?.total || 0);
		}
	};

	// Loading state
	if (mapLoading) {
		return (
			<div className={`relative ${className}`}>
				<div className="w-full bg-white rounded-lg shadow-sm border h-96 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
						<p className="text-gray-600">Loading Nigerian map data...</p>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (mapError || !geoData) {
		return (
			<div className={`relative ${className}`}>
				<div className="w-full bg-white rounded-lg shadow-sm border h-96 flex items-center justify-center">
					<div className="text-center">
						<div className="text-red-500 mb-4">⚠️</div>
						<p className="text-red-600 font-medium">
							Failed to load map data
						</p>
						<p className="text-gray-500 text-sm mt-2">{mapError}</p>
						<button
							onClick={() => window.location.reload()}
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`relative ${className}`}>
			{/* Map Container */}
			<div className="w-full bg-white rounded-lg shadow-sm border">
				<ComposableMap
					projection="geoMercator"
					projectionConfig={{
						scale: 2800,
						center: [8, 9.5], // Centered on Nigeria
					}}
					width={800}
					height={600}
					style={{ width: '100%', height: 'auto' }}
				>
					<ZoomableGroup>
						<Geographies geography={geoData}>
							{({ geographies }: { geographies: GeographyFeature[] }) =>
								geographies.map((geo: GeographyFeature) => {
									const stateName = getStateName(geo.properties);

									return (
										<Geography
											key={geo.rsmKey}
											geography={geo}
											fill={getStateColor(stateName)}
											stroke="#FFFFFF"
											strokeWidth={1}
											onMouseEnter={(evt: React.MouseEvent) =>
												showTooltip && handleMouseEnter(geo, evt)
											}
											onMouseMove={handleMouseMove}
											onMouseLeave={handleMouseLeave}
											onClick={() => handleStateClick(geo)}
											style={{
												default: { outline: 'none' },
												hover: {
													outline: 'none',
													fill: COLOR_SCHEMES[colorScheme].dark,
													cursor: onStateClick
														? 'pointer'
														: 'default',
												},
												pressed: { outline: 'none' },
											}}
										/>
									);
								})
							}
						</Geographies>
					</ZoomableGroup>
				</ComposableMap>
			</div>

			{/* Tooltip */}
			{showTooltip && showTooltipEl && (
				<div
					className="fixed z-50 pointer-events-none"
					style={{
						left: tooltipPosition.x + 10,
						top: tooltipPosition.y - 10,
						transform: 'translateY(-100%)',
					}}
					dangerouslySetInnerHTML={{ __html: tooltipContent }}
				/>
			)}

			{/* Legend */}
			<div className="mt-4 flex items-center justify-center">
				<div className="flex items-center space-x-4 text-sm">
					<span className="text-gray-600">Reports:</span>
					<div className="flex items-center space-x-2">
						<div
							className="w-4 h-4 rounded"
							style={{
								backgroundColor: COLOR_SCHEMES[colorScheme].light,
							}}
						></div>
						<span className="text-xs">Low</span>
					</div>
					<div className="flex items-center space-x-2">
						<div
							className="w-4 h-4 rounded"
							style={{
								backgroundColor: COLOR_SCHEMES[colorScheme].medium,
							}}
						></div>
						<span className="text-xs">Medium</span>
					</div>
					<div className="flex items-center space-x-2">
						<div
							className="w-4 h-4 rounded"
							style={{
								backgroundColor: COLOR_SCHEMES[colorScheme].dark,
							}}
						></div>
						<span className="text-xs">High</span>
					</div>
					<div className="flex items-center space-x-2">
						<div
							className="w-4 h-4 rounded"
							style={{
								backgroundColor: COLOR_SCHEMES[colorScheme].darkest,
							}}
						></div>
						<span className="text-xs">Very High</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ToiletReportsMap;
