// utils/mapDataUtils.ts

export interface ToiletReport {
	id: string;
	state: string;
	lga: string;
	ward?: string;
	status: 'PENDING' | 'APPROVED' | 'REJECTED';
	toiletCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
	facilityType:
		| 'PUBLIC'
		| 'PRIVATE'
		| 'SCHOOL'
		| 'HOSPITAL'
		| 'MARKET'
		| 'OFFICE'
		| 'RESIDENTIAL'
		| 'OTHER';
	createdAt: string;
}

export interface MapDataPoint {
	state: string;
	lga?: string;
	count: number;
	status?: 'APPROVED' | 'PENDING' | 'REJECTED';
	condition?: string;
	facilityType?: string;
}

export interface StateStatistics {
	total: number;
	approved: number;
	pending: number;
	rejected: number;
	excellent: number;
	good: number;
	fair: number;
	poor: number;
	veryPoor: number;
	facilities: {
		public: number;
		private: number;
		school: number;
		hospital: number;
		market: number;
		office: number;
		residential: number;
		other: number;
	};
}

/**
 * Process raw toilet reports data for map visualization
 */
export const processToiletReportsForMap = (
	reports: ToiletReport[]
): MapDataPoint[] => {
	const stateData: { [key: string]: StateStatistics } = {};

	// Aggregate data by state
	reports.forEach(report => {
		const stateName = report.state;

		if (!stateData[stateName]) {
			stateData[stateName] = {
				total: 0,
				approved: 0,
				pending: 0,
				rejected: 0,
				excellent: 0,
				good: 0,
				fair: 0,
				poor: 0,
				veryPoor: 0,
				facilities: {
					public: 0,
					private: 0,
					school: 0,
					hospital: 0,
					market: 0,
					office: 0,
					residential: 0,
					other: 0,
				},
			};
		}

		// Count totals
		stateData[stateName].total += 1;

		// Count by status
		if (report.status === 'APPROVED') stateData[stateName].approved += 1;
		else if (report.status === 'PENDING') stateData[stateName].pending += 1;
		else if (report.status === 'REJECTED') stateData[stateName].rejected += 1;

		// Count by toilet condition
		if (report.toiletCondition === 'EXCELLENT')
			stateData[stateName].excellent += 1;
		else if (report.toiletCondition === 'GOOD')
			stateData[stateName].good += 1;
		else if (report.toiletCondition === 'FAIR')
			stateData[stateName].fair += 1;
		else if (report.toiletCondition === 'POOR')
			stateData[stateName].poor += 1;
		else if (report.toiletCondition === 'VERY_POOR')
			stateData[stateName].veryPoor += 1;

		// Count by facility type
		const facilityKey =
			report.facilityType.toLowerCase() as keyof (typeof stateData)[number]['facilities'];
		if (stateData[stateName].facilities[facilityKey] !== undefined) {
			stateData[stateName].facilities[facilityKey] += 1;
		}
	});

	// Convert to array format for map component
	return Object.entries(stateData).map(([state, stats]) => ({
		state,
		count: stats.total,
		status: undefined, // Will be used for filtering
	}));
};

/**
 * Process LGA-level data for detailed view
 */
export const processLGADataForMap = (
	reports: ToiletReport[],
	selectedState?: string
): MapDataPoint[] => {
	const filteredReports = selectedState
		? reports.filter(report => report.state === selectedState)
		: reports;

	const lgaData: {
		[key: string]: {
			state: string;
			count: number;
			approved: number;
			pending: number;
			rejected: number;
		};
	} = {};

	filteredReports.forEach(report => {
		const lgaKey = `${report.state}-${report.lga}`;

		if (!lgaData[lgaKey]) {
			lgaData[lgaKey] = {
				state: report.state,
				count: 0,
				approved: 0,
				pending: 0,
				rejected: 0,
			};
		}

		lgaData[lgaKey].count += 1;

		if (report.status === 'APPROVED') lgaData[lgaKey].approved += 1;
		else if (report.status === 'PENDING') lgaData[lgaKey].pending += 1;
		else if (report.status === 'REJECTED') lgaData[lgaKey].rejected += 1;
	});

	return Object.entries(lgaData).map(([lgaKey, data]) => {
		const [state, lga] = lgaKey.split('-');
		return {
			state,
			lga,
			count: data.count,
		};
	});
};

/**
 * Get state statistics for detailed view
 */
export const getStateStatistics = (
	reports: ToiletReport[],
	stateName: string
): StateStatistics | null => {
	const stateReports = reports.filter(report => report.state === stateName);

	if (stateReports.length === 0) return null;

	const stats: StateStatistics = {
		total: stateReports.length,
		approved: 0,
		pending: 0,
		rejected: 0,
		excellent: 0,
		good: 0,
		fair: 0,
		poor: 0,
		veryPoor: 0,
		facilities: {
			public: 0,
			private: 0,
			school: 0,
			hospital: 0,
			market: 0,
			office: 0,
			residential: 0,
			other: 0,
		},
	};

	stateReports.forEach(report => {
		// Status counts
		if (report.status === 'APPROVED') stats.approved += 1;
		else if (report.status === 'PENDING') stats.pending += 1;
		else if (report.status === 'REJECTED') stats.rejected += 1;

		// Condition counts
		if (report.toiletCondition === 'EXCELLENT') stats.excellent += 1;
		else if (report.toiletCondition === 'GOOD') stats.good += 1;
		else if (report.toiletCondition === 'FAIR') stats.fair += 1;
		else if (report.toiletCondition === 'POOR') stats.poor += 1;
		else if (report.toiletCondition === 'VERY_POOR') stats.veryPoor += 1;

		// Facility type counts
		const facilityKey =
			report.facilityType.toLowerCase() as keyof typeof stats.facilities;
		if (stats.facilities[facilityKey] !== undefined) {
			stats.facilities[facilityKey] += 1;
		}
	});

	return stats;
};

/**
 * Filter reports data by various criteria
 */
export const filterReportsForMap = (
	reports: ToiletReport[],
	filters: {
		status?: 'APPROVED' | 'PENDING' | 'REJECTED';
		condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
		facilityType?:
			| 'PUBLIC'
			| 'PRIVATE'
			| 'SCHOOL'
			| 'HOSPITAL'
			| 'MARKET'
			| 'OFFICE'
			| 'RESIDENTIAL'
			| 'OTHER';
		state?: string;
		lga?: string;
		dateRange?: { start: string; end: string };
	}
): ToiletReport[] => {
	return reports.filter(report => {
		if (filters.status && report.status !== filters.status) return false;
		if (filters.condition && report.toiletCondition !== filters.condition)
			return false;
		if (filters.facilityType && report.facilityType !== filters.facilityType)
			return false;
		if (filters.state && report.state !== filters.state) return false;
		if (filters.lga && report.lga !== filters.lga) return false;

		if (filters.dateRange) {
			const reportDate = new Date(report.createdAt);
			const startDate = new Date(filters.dateRange.start);
			const endDate = new Date(filters.dateRange.end);
			if (reportDate < startDate || reportDate > endDate) return false;
		}

		return true;
	});
};

/**
 * Get top states by report count
 */
export const getTopStates = (
	reports: ToiletReport[],
	limit: number = 10
): Array<{ state: string; count: number }> => {
	const stateCounts: { [key: string]: number } = {};

	reports.forEach(report => {
		stateCounts[report.state] = (stateCounts[report.state] || 0) + 1;
	});

	return Object.entries(stateCounts)
		.map(([state, count]) => ({ state, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, limit);
};

/**
 * Calculate condition distribution for visualization
 */
export const getConditionDistribution = (
	reports: ToiletReport[]
): Array<{ condition: string; count: number; percentage: number }> => {
	const conditions: { [key: string]: number } = {
		EXCELLENT: 0,
		GOOD: 0,
		FAIR: 0,
		POOR: 0,
		VERY_POOR: 0,
	};

	reports.forEach(report => {
		conditions[report.toiletCondition] += 1;
	});

	const total = reports.length;

	return Object.entries(conditions).map(([condition, count]) => ({
		condition: condition.replace('_', ' '),
		count,
		percentage: total > 0 ? Math.round((count / total) * 100) : 0,
	}));
};

/**
 * Nigerian states list for validation and dropdown components
 */
export const NIGERIAN_STATES = [
	'Abia',
	'Adamawa',
	'Akwa Ibom',
	'Anambra',
	'Bauchi',
	'Bayelsa',
	'Benue',
	'Borno',
	'Cross River',
	'Delta',
	'Ebonyi',
	'Edo',
	'Ekiti',
	'Enugu',
	'Federal Capital Territory',
	'Gombe',
	'Imo',
	'Jigawa',
	'Kaduna',
	'Kano',
	'Katsina',
	'Kebbi',
	'Kogi',
	'Kwara',
	'Lagos',
	'Nasarawa',
	'Niger',
	'Ogun',
	'Ondo',
	'Osun',
	'Oyo',
	'Plateau',
	'Rivers',
	'Sokoto',
	'Taraba',
	'Yobe',
	'Zamfara',
];

/**
 * Normalize state name for consistent mapping
 */
export const normalizeStateName = (stateName: string): string => {
	return stateName
		.toLowerCase()
		.replace(/\s+/g, '_')
		.replace(/[^a-z0-9_]/g, '');
};
