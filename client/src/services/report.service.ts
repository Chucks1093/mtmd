import axios, { type AxiosResponse, AxiosError } from 'axios';

// Types and interfaces for report-related API calls
export interface Report {
	id: string;
	submitterName: string;
	submitterEmail?: string;
	submitterPhone?: string;
	state: string;
	lga: string;
	ward?: string;
	specificAddress: string;
	coordinates?: string;
	images: string[];
	description?: string;
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
	status: 'PENDING' | 'APPROVED' | 'REJECTED';
	adminNotes?: string;
	reviewedAt?: string;
	reviewedBy?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateReportData {
	submitterName: string;
	submitterEmail?: string;
	submitterPhone?: string;
	state: string;
	lga: string;
	ward?: string;
	specificAddress: string;
	coordinates?: string;
	images: string[];
	description?: string;
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
}

export interface UpdateReportStatusData {
	status: 'PENDING' | 'APPROVED' | 'REJECTED';
	adminNotes?: string;
	reviewedBy?: string;
}

export interface GetReportsParams {
	page?: number;
	limit?: number;
	status?: 'PENDING' | 'APPROVED' | 'REJECTED';
	state?: string;
	lga?: string;
	facilityType?:
		| 'PUBLIC'
		| 'PRIVATE'
		| 'SCHOOL'
		| 'HOSPITAL'
		| 'MARKET'
		| 'OFFICE'
		| 'RESIDENTIAL'
		| 'OTHER';
	toiletCondition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'VERY_POOR';
}

export interface GetReportsByLocationParams {
	state: string;
	lga?: string;
}

export interface PaginatedReportsResponse {
	reports: Report[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface LocationReport {
	id: string;
	state: string;
	lga: string;
	ward?: string;
	specificAddress: string;
	coordinates?: string;
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
	images: string[];
	createdAt: string;
}

export interface RecentReport {
	id: string;
	submitterName: string;
	state: string;
	lga: string;
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

export interface ReportStats {
	totalReports: number;
	approvedReports: number;
	pendingReports: number;
	rejectedReports: number;
	reportsByState: Array<{
		state: string;
		_count: {
			id: number;
		};
	}>;
	reportsByCondition: Array<{
		toiletCondition: string;
		_count: {
			id: number;
		};
	}>;
}

export interface APIResponse<T = null> {
	success: boolean;
	data: T;
	message: string;
}

export interface APIErrorResponse {
	success: false;
	message: string;
	errors?: Array<{
		field?: string;
		message: string;
	}>;
}

export class ApiError extends Error {
	public status: number;
	public response?: APIErrorResponse;

	constructor(
		message: string,
		status: number = 500,
		response?: APIErrorResponse
	) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.response = response;
	}
}

class ReportService {
	private API_URL: string;

	constructor() {
		this.API_URL = import.meta.env.VITE_BACKEND_URL;
		axios.defaults.baseURL = `${this.API_URL}`;
	}

	/**
	 * Create a new toilet report submission (Public)
	 */
	async createReport(
		reportData: CreateReportData
	): Promise<APIResponse<Report>> {
		try {
			const response: AxiosResponse<APIResponse<Report>> = await axios.post(
				'/report',
				reportData
			);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get all reports with filtering and pagination (Admin only)
	 */
	async getAllReports(
		params?: GetReportsParams
	): Promise<APIResponse<PaginatedReportsResponse>> {
		try {
			const response: AxiosResponse<APIResponse<PaginatedReportsResponse>> =
				await axios.get('/report', {
					params,
				});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get a specific report by ID (Admin only)
	 */
	async getReportById(reportId: string): Promise<APIResponse<Report>> {
		try {
			const response: AxiosResponse<APIResponse<Report>> = await axios.get(
				`/report/${reportId}`
			);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Update report status (Admin only)
	 */
	async updateReportStatus(
		reportId: string,
		updateData: UpdateReportStatusData
	): Promise<APIResponse<Report>> {
		try {
			const response: AxiosResponse<APIResponse<Report>> = await axios.patch(
				`/report/${reportId}/status`,
				updateData
			);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Delete a report (Admin only)
	 */
	async deleteReport(reportId: string): Promise<APIResponse<null>> {
		try {
			const response: AxiosResponse<APIResponse<null>> = await axios.delete(
				`/report/${reportId}`
			);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get reports by location for map visualization (Public)
	 */
	async getReportsByLocation(
		params: GetReportsByLocationParams
	): Promise<APIResponse<LocationReport[]>> {
		try {
			const response: AxiosResponse<APIResponse<LocationReport[]>> =
				await axios.get('/report/location', {
					params,
				});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get campaign statistics and analytics (Public)
	 */
	async getReportStats(): Promise<APIResponse<ReportStats>> {
		try {
			const response: AxiosResponse<APIResponse<ReportStats>> =
				await axios.get('/report/stats');
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get recent approved reports for dashboard (Public)
	 */
	async getRecentReports(
		limit: number = 10
	): Promise<APIResponse<RecentReport[]>> {
		try {
			const response: AxiosResponse<APIResponse<RecentReport[]>> =
				await axios.get('/report/recent', {
					params: { limit },
				});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Approve multiple reports (Admin only)
	 */
	async approveMultipleReports(
		reportIds: string[],
		adminNotes?: string
	): Promise<APIResponse<{ successCount: number; errors: string[] }>> {
		try {
			const results = await Promise.allSettled(
				reportIds.map(id =>
					this.updateReportStatus(id, {
						status: 'APPROVED',
						adminNotes,
					})
				)
			);

			const successCount = results.filter(
				r => r.status === 'fulfilled'
			).length;
			const errors = results
				.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
				.map(r => r.reason?.message || 'Unknown error');

			return {
				success: true,
				message: `Successfully approved ${successCount} reports`,
				data: { successCount, errors },
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Reject multiple reports (Admin only)
	 */
	async rejectMultipleReports(
		reportIds: string[],
		adminNotes?: string
	): Promise<APIResponse<{ successCount: number; errors: string[] }>> {
		try {
			const results = await Promise.allSettled(
				reportIds.map(id =>
					this.updateReportStatus(id, {
						status: 'REJECTED',
						adminNotes,
					})
				)
			);

			const successCount = results.filter(
				r => r.status === 'fulfilled'
			).length;
			const errors = results
				.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
				.map(r => r.reason?.message || 'Unknown error');

			return {
				success: true,
				message: `Successfully rejected ${successCount} reports`,
				data: { successCount, errors },
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Delete multiple reports (Admin only)
	 */
	async deleteMultipleReports(
		reportIds: string[]
	): Promise<APIResponse<{ successCount: number; errors: string[] }>> {
		try {
			const results = await Promise.allSettled(
				reportIds.map(id => this.deleteReport(id))
			);

			const successCount = results.filter(
				r => r.status === 'fulfilled'
			).length;
			const errors = results
				.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
				.map(r => r.reason?.message || 'Unknown error');

			return {
				success: true,
				message: `Successfully deleted ${successCount} reports`,
				data: { successCount, errors },
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get reports by state for analytics
	 */
	async getReportsByState(
		state: string,
		params?: Omit<GetReportsParams, 'state'>
	): Promise<APIResponse<PaginatedReportsResponse>> {
		try {
			const response: AxiosResponse<APIResponse<PaginatedReportsResponse>> =
				await axios.get('/report', {
					params: { ...params, state },
				});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get reports by LGA for analytics
	 */
	async getReportsByLGA(
		state: string,
		lga: string,
		params?: Omit<GetReportsParams, 'state' | 'lga'>
	): Promise<APIResponse<PaginatedReportsResponse>> {
		try {
			const response: AxiosResponse<APIResponse<PaginatedReportsResponse>> =
				await axios.get('/report', {
					params: { ...params, state, lga },
				});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Search reports by keywords
	 */
	async searchReports(
		query: string,
		params?: GetReportsParams
	): Promise<APIResponse<PaginatedReportsResponse>> {
		try {
			const response: AxiosResponse<APIResponse<PaginatedReportsResponse>> =
				await axios.get('/report', {
					params: { ...params, search: query },
				});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Get report statistics by date range
	 */
	async getReportStatsByDateRange(
		startDate: string,
		endDate: string
	): Promise<
		APIResponse<ReportStats & { dateRange: { start: string; end: string } }>
	> {
		try {
			const response: AxiosResponse<
				APIResponse<
					ReportStats & { dateRange: { start: string; end: string } }
				>
			> = await axios.get('/report/stats', {
				params: { startDate, endDate },
			});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Export reports data (Admin only)
	 */
	async exportReports(
		format: 'csv' | 'excel' | 'pdf',
		params?: GetReportsParams
	): Promise<Blob> {
		try {
			const response = await axios.get('/report/export', {
				params: { ...params, format },
				responseType: 'blob',
			});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Private method to handle errors consistently
	 */
	private handleError(error: unknown): ApiError {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<APIErrorResponse>;

			if (axiosError.response) {
				const status = axiosError.response.status;
				const data = axiosError.response.data;
				const message = data?.message || 'An error occurred';
				return new ApiError(message, status, data);
			} else if (axiosError.request) {
				return new ApiError(
					'Network error - please check your connection',
					0
				);
			}
		}

		if (error instanceof Error) {
			return new ApiError(error.message, 500);
		}

		return new ApiError('An unexpected error occurred', 500);
	}
}

// Create and export a singleton instance
export const reportService = new ReportService();
export default reportService;
