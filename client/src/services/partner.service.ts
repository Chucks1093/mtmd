import axios, { type AxiosResponse, AxiosError } from 'axios';

// Shared response types
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

// -----------------------------------
// Partner-related interfaces
// -----------------------------------
export interface Partner {
	id: string;
	name: string;
	description?: string;
	type:
		| 'CORPORATE'
		| 'NGO'
		| 'GOVERNMENT'
		| 'INTERNATIONAL'
		| 'COMMUNITY'
		| 'ACADEMIC'
		| 'MEDIA';
	logo: string;
	website?: string;
	email?: string;
	phone?: string;
	contactPerson?: string;
	contactPersonRole?: string;
	state?: string;
	lga?: string;
	address?: string;
	socialMedia?: {
		facebook?: string;
		twitter?: string;
		linkedin?: string;
		instagram?: string;
	};
	partnershipDetails?: {
		startDate?: string;
		endDate?: string;
		partnershipType?: string;
		contributions?: string[];
		benefits?: string[];
	};
	featured: boolean;
	displayOrder: number;
	status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
	createdAt: string;
	updatedAt: string;
}

export interface PaginatedResponse<T> {
	partners: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface PartnerStats {
	totalPartners: number;
	activePartners: number;
	featuredPartners: number;
	pendingPartners: number;
	partnersByType: Array<{ type: string; count: number }>;
	partnersByState: Array<{ state: string; count: number }>;
	recentPartners: Array<{
		id: string;
		name: string;
		type: string;
		logo?: string;
		createdAt: string;
	}>;
}

export type CreatePartnerRequest = Partial<Partner>;

export type UpdatePartnerRequest = Partial<Partner>;

export interface PartnerFilters {
	page?: number;
	limit?: number;
	type?: Partner['type'];
	status?: Partner['status'];
	featured?: boolean;
	state?: string;
	search?: string;
}

export interface PublicPartnerFilters {
	page?: number;
	limit?: number;
	type?: Partner['type'];
	featured?: boolean;
	state?: string;
}

export interface BulkUpdateStatusRequest {
	partnerIds: string[];
	status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

// -----------------------------------
// Partner Service
// -----------------------------------
class PartnerService {
	private API_URL: string;

	constructor() {
		this.API_URL = import.meta.env.VITE_BACKEND_URL;
		axios.defaults.baseURL = `${this.API_URL}`;
	}

	// ✅ Create partner
	async createPartner(
		data: CreatePartnerRequest
	): Promise<APIResponse<Partner>> {
		try {
			const res: AxiosResponse<APIResponse<Partner>> = await axios.post(
				'/partner',
				data
			);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Get all partners (Admin)
	async getAllPartners(
		filters?: PartnerFilters
	): Promise<APIResponse<PaginatedResponse<Partner>>> {
		try {
			const res: AxiosResponse<APIResponse<PaginatedResponse<Partner>>> =
				await axios.get('/partner', { params: filters });
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Get public partners
	async getPublicPartners(
		filters?: PublicPartnerFilters
	): Promise<APIResponse<PaginatedResponse<Partner>>> {
		try {
			const res: AxiosResponse<APIResponse<PaginatedResponse<Partner>>> =
				await axios.get('/partner/public', { params: filters });
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Get one partner
	async getPartner(id: string): Promise<APIResponse<Partner>> {
		try {
			const res: AxiosResponse<APIResponse<Partner>> = await axios.get(
				`/partner/${id}`
			);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Update partner
	async updatePartner(
		id: string,
		data: UpdatePartnerRequest
	): Promise<APIResponse<Partner>> {
		try {
			const res: AxiosResponse<APIResponse<Partner>> = await axios.patch(
				`/partner/${id}`,
				data
			);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Delete partner
	async deletePartner(id: string): Promise<APIResponse<null>> {
		try {
			const res: AxiosResponse<APIResponse<null>> = await axios.delete(
				`/partner/${id}`
			);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Partner stats
	async getPartnerStats(): Promise<APIResponse<PartnerStats>> {
		try {
			const res: AxiosResponse<APIResponse<PartnerStats>> = await axios.get(
				'/partner/stats/analytics'
			);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Featured partners
	async getFeaturedPartners(limit?: number): Promise<APIResponse<Partner[]>> {
		try {
			const res: AxiosResponse<APIResponse<Partner[]>> = await axios.get(
				'/partner/featured',
				{ params: { limit } }
			);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Partners by type
	async getPartnersByType(
		type: Partner['type'],
		limit?: number
	): Promise<APIResponse<Partner[]>> {
		try {
			const res: AxiosResponse<APIResponse<Partner[]>> = await axios.get(
				`/partner/type/${type}`,
				{ params: { limit } }
			);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Update display order
	async updatePartnerDisplayOrder(
		id: string,
		displayOrder: number
	): Promise<APIResponse<Partner>> {
		try {
			const res: AxiosResponse<APIResponse<Partner>> = await axios.patch(
				`/partner/${id}/display-order`,
				{ displayOrder }
			);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// ✅ Bulk status update
	async bulkUpdatePartnerStatus(
		data: BulkUpdateStatusRequest
	): Promise<APIResponse<{ updatedCount: number }>> {
		try {
			const res: AxiosResponse<APIResponse<{ updatedCount: number }>> =
				await axios.patch('/partner/bulk/status', data);
			return res.data;
		} catch (err) {
			throw this.handleError(err);
		}
	}

	// -----------------------------------
	// Shared error handler (same pattern)
	// -----------------------------------
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
		if (error instanceof Error) return new ApiError(error.message, 500);
		return new ApiError('An unexpected error occurred', 500);
	}
}

export const partnerService = new PartnerService();
export default partnerService;
