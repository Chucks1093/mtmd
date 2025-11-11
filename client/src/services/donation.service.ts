import axios, { type AxiosResponse, AxiosError } from 'axios';

// ----------------------------
// Shared API types & error class
// ----------------------------
export interface APIResponse<T = null> {
	success: boolean;
	data: T;
	message: string;
}

export interface APIErrorResponse {
	success: false;
	message: string;
	errors?: Array<{ field?: string; message: string }>;
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
export interface DonationSummary {
	id: string;
	status: 'SUCCESS' | 'FAILED' | 'PENDING';
	amount: number;
	reference: string;
}

// ----------------------------
// Donation-related types
// ----------------------------
export interface Donation {
	id: string;
	donorName: string;
	donorEmail: string;
	donorPhone?: string;
	amount: number;
	currency: string;
	type: 'ONE_TIME' | 'MONTHLY' | 'ANNUAL';
	message?: string;
	isAnonymous: boolean;
	state?: string;
	lga?: string;
	status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
	paystackReference?: string;
	createdAt: string;
	updatedAt: string;
}

export interface PaginatedResponse<T> {
	donations: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CreateDonationRequest {
	donorName: string;
	donorEmail: string;
	donorPhone?: string;
	amount: number;
	currency?: string;
	type?: 'ONE_TIME' | 'MONTHLY' | 'ANNUAL';
	message?: string;
	isAnonymous?: boolean;
	state?: string;
	lga?: string;
	callbackUrl?: string;
}

export interface PaymentInitializationResponse {
	authorization_url: string;
	access_code: string;
	reference: string;
}

export interface CreateDonationResponse {
	donation: {
		id: string;
		amount: number;
		currency: string;
		type: string;
		donorName: string;
		donorEmail: string;
	};
	payment: PaymentInitializationResponse;
}

export interface VerifyPaymentRequest {
	reference: string;
}

export interface DonationStats {
	totalDonations: number;
	totalAmountRaised: number;
	successRate: number;
	donationsByStatus: Array<{
		status: string;
		count: number;
		totalAmount: number;
	}>;
	donationsByType: Array<{
		type: string;
		count: number;
		totalAmount: number;
	}>;
	recentDonations: Array<{
		id: string;
		donorName: string;
		amount: number;
		type: string;
		createdAt: string;
	}>;
	topDonors: Array<{
		donorName: string;
		donorEmail: string;
		donationCount: number;
		totalAmount: number;
	}>;
}

export interface PublicDonationStats {
	totalAmountRaised: number;
	totalDonors: number;
	totalDonations: number;
}

export interface DonationFilters {
	page?: number;
	limit?: number;
	status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
	type?: 'ONE_TIME' | 'MONTHLY' | 'ANNUAL';
	minAmount?: number;
	maxAmount?: number;
	startDate?: string;
	endDate?: string;
	state?: string;
	search?: string;
}

// ----------------------------
// DonationService
// ----------------------------
class DonationService {
	private API_URL: string;

	constructor() {
		this.API_URL = import.meta.env.VITE_BACKEND_URL;
		axios.defaults.baseURL = this.API_URL;
	}

	// ✅ Create a new donation (public)
	async createDonation(
		data: CreateDonationRequest
	): Promise<APIResponse<CreateDonationResponse>> {
		try {
			const res: AxiosResponse<APIResponse<CreateDonationResponse>> =
				await axios.post('/donation', data);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Verify payment (public)
	async verifyPayment(
		data: VerifyPaymentRequest
	): Promise<APIResponse<{ donation: DonationSummary }>> {
		try {
			const res: AxiosResponse<APIResponse<{ donation: DonationSummary }>> =
				await axios.post('/donation/verify', data);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Get all donations (admin)
	async getAllDonations(
		filters?: DonationFilters
	): Promise<APIResponse<PaginatedResponse<Donation>>> {
		try {
			const res: AxiosResponse<APIResponse<PaginatedResponse<Donation>>> =
				await axios.get('/donation', {
					params: filters,
				});
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Get donation stats (admin)
	async getDonationStats(
		period?: 'week' | 'month' | 'quarter' | 'year',
		year?: number
	): Promise<APIResponse<DonationStats>> {
		try {
			const params: Record<string, unknown> = {};
			if (period) params.period = period;
			if (year) params.year = year;

			const res: AxiosResponse<APIResponse<DonationStats>> = await axios.get(
				'/donation/stats',
				{ params }
			);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Get public donation stats
	async getPublicDonationStats(): Promise<APIResponse<PublicDonationStats>> {
		try {
			const res: AxiosResponse<APIResponse<PublicDonationStats>> =
				await axios.get('/donation/stats/public');
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Get single donation (admin)
	async getDonation(id: string): Promise<APIResponse<Donation>> {
		try {
			const res: AxiosResponse<APIResponse<Donation>> = await axios.get(
				`/donation/${id}`
			);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Cleanup expired donations (admin)
	async cleanupExpiredDonations(): Promise<
		APIResponse<{ cleanedCount: number }>
	> {
		try {
			const res: AxiosResponse<APIResponse<{ cleanedCount: number }>> =
				await axios.post('/donation/cleanup');
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ----------------------------
	// Shared error handler
	// ----------------------------
	private handleError(error: unknown): ApiError {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<APIErrorResponse>;
			if (axiosError.response) {
				const status = axiosError.response.status;
				const data = axiosError.response.data;
				const message = data?.message || 'An error occurred';
				return new ApiError(message, status, data);
			}
			if (axiosError.request) {
				return new ApiError(
					'Network error - please check your connection',
					0
				);
			}
		}

		if (error instanceof Error) return new ApiError(error.message, 500);
		return new ApiError('An unexpected error occurred', 500);
	}
}

export const donationService = new DonationService();

export default donationService;
