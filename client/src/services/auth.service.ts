import axios, { type AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';

// Admin interfaces based on your backend
export interface AdminProfile {
	id: string;
	email: string;
	name: string;
	role: 'SYSTEM_ADMIN' | 'ADMIN';
	profilePicture?: string;
	lastLoginAt?: string;
	createdAt: string;
	status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
}

export interface LoginResponse {
	admin: AdminProfile;
	token: string;
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

export interface GoogleLoginData {
	googleToken: string;
}

export interface SetupFirstAdminData {
	setupKey: string;
	googleId: string;
	name?: string;
	email?: string;
}

export interface AcceptInviteData {
	inviteToken: string;
	googleId: string;
}

export interface InviteAdminData {
	email: string;
	name: string;
	role?: 'SYSTEM_ADMIN' | 'ADMIN';
}

export interface PaginatedAdminsResponse {
	admins: AdminProfile[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface AdminStatsResponse {
	totalAdmins: number;
	activeAdmins: number;
	pendingInvites: number;
	systemAdmins: number;
	recentLogins: Array<{
		id: string;
		name: string;
		email: string;
		lastLoginAt: string;
	}>;
}

export interface InviteAdminResponse {
	id: string;
	email: string;
	name: string;
	role: string;
	status: string;
	inviteUrl: string;
}

export interface GetAdminsParams {
	page?: number;
	limit?: number;
	role?: 'SYSTEM_ADMIN' | 'ADMIN';
	status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
	search?: string;
}

// Custom error class for API errors
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

class AuthService {
	private API_URL: string;
	private ACCESS_TOKEN: string = 'ntc_admin_token';
	private ADMIN_PROFILE: string = 'ntc_admin_profile';

	constructor() {
		this.API_URL = import.meta.env.VITE_BACKEND_URL;

		// Setup axios defaults
		axios.defaults.baseURL = `${this.API_URL}/api/v1`;

		// Add token to all requests if available
		const token = this.getToken();
		if (token) {
			axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
		}
	}

	// NEW: Initiate Google OAuth login (server-side flow)
	loginWithGoogle(): void {
		console.log('Redirecting to Google OAuth...', this.API_URL);
		window.location.href = `${this.API_URL}/api/v1/admin/auth/google`;
	}

	// NEW: Handle OAuth callback response
	handleOAuthCallback(params: URLSearchParams): {
		success: boolean;
		message: string;
		admin?: AdminProfile;
	} {
		try {
			const success = params.get('success') === 'true';
			const message = params.get('message') || '';
			const token = params.get('token');
			const adminStr = params.get('admin');

			if (success && token && adminStr) {
				const admin: AdminProfile = JSON.parse(adminStr);

				// Set authentication data
				this.setToken(token);
				this.setAdminProfile(admin);
				this.setAuthHeader(token);

				return {
					success: true,
					message: message || 'Login successful',
					admin,
				};
			} else {
				return {
					success: false,
					message: message || 'Authentication failed',
				};
			}
		} catch (error) {
			console.error('Error handling OAuth callback:', error);
			return {
				success: false,
				message: 'Failed to process authentication response',
			};
		}
	}

	// NEW: Setup first admin with OAuth
	async setupFirstAdminWithOAuth(
		setupKey: string
	): Promise<{ success: boolean; redirectUrl?: string; message: string }> {
		try {
			const response: AxiosResponse<APIResponse<{ redirectUrl: string }>> =
				await axios.post('/admin/setup/first-admin-oauth', { setupKey });

			if (response.data.success && response.data.data?.redirectUrl) {
				return {
					success: true,
					redirectUrl: response.data.data.redirectUrl,
					message: response.data.message,
				};
			}

			return {
				success: false,
				message: response.data.message || 'Setup failed',
			};
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// Keep existing methods for backward compatibility
	async setupFirstAdmin(
		adminData: SetupFirstAdminData
	): Promise<APIResponse<LoginResponse>> {
		try {
			const response: AxiosResponse<APIResponse<LoginResponse>> =
				await axios.post('/admin/setup/first-admin', adminData);

			if (response.data.success && response.data.data) {
				this.setToken(response.data.data.token);
				this.setAdminProfile(response.data.data.admin);
				this.setAuthHeader(response.data.data.token);
			}

			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// Keep existing Google login for backward compatibility
	async googleLogin(
		googleData: GoogleLoginData
	): Promise<APIResponse<LoginResponse>> {
		try {
			const response: AxiosResponse<APIResponse<LoginResponse>> =
				await axios.post('/admin/login/google', googleData);

			if (response.data.success && response.data.data) {
				this.setToken(response.data.data.token);
				this.setAdminProfile(response.data.data.admin);
				this.setAuthHeader(response.data.data.token);
			}

			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// Accept invitation
	async acceptInvite(
		inviteData: AcceptInviteData
	): Promise<APIResponse<LoginResponse>> {
		try {
			const response: AxiosResponse<APIResponse<LoginResponse>> =
				await axios.post('/admin/accept-invite', inviteData);

			if (response.data.success && response.data.data) {
				this.setToken(response.data.data.token);
				this.setAdminProfile(response.data.data.admin);
				this.setAuthHeader(response.data.data.token);
			}

			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// Logout
	async logout(): Promise<void> {
		try {
			await axios.post('/admin/logout');
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			this.clearAuth();
		}
	}

	// Get current admin profile
	async getProfile(): Promise<APIResponse<AdminProfile>> {
		try {
			const response: AxiosResponse<APIResponse<AdminProfile>> =
				await axios.get('/admin/profile');

			if (response.data.success && response.data.data) {
				this.setAdminProfile(response.data.data);
			}

			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// Invite new admin (System Admin only)
	async inviteAdmin(
		inviteData: InviteAdminData
	): Promise<APIResponse<InviteAdminResponse>> {
		try {
			const response: AxiosResponse<APIResponse<InviteAdminResponse>> =
				await axios.post('/admin/invite', inviteData);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// Get all admins (System Admin only)
	async getAllAdmins(
		params?: GetAdminsParams
	): Promise<APIResponse<PaginatedAdminsResponse>> {
		try {
			const response: AxiosResponse<APIResponse<PaginatedAdminsResponse>> =
				await axios.get('/admin', {
					params,
				});
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// Update admin (System Admin only)
	async updateAdmin(
		adminId: string,
		updateData: Partial<AdminProfile>
	): Promise<APIResponse<AdminProfile>> {
		try {
			const response: AxiosResponse<APIResponse<AdminProfile>> =
				await axios.patch(`/admin/${adminId}`, updateData);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// Delete admin (System Admin only)
	async deleteAdmin(adminId: string): Promise<APIResponse<null>> {
		try {
			const response: AxiosResponse<APIResponse<null>> = await axios.delete(
				`/admin/${adminId}`
			);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// Get admin statistics
	async getAdminStats(): Promise<APIResponse<AdminStatsResponse>> {
		try {
			const response: AxiosResponse<APIResponse<AdminStatsResponse>> =
				await axios.get('/admin/stats');
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	// Token management
	setToken(token: string): void {
		Cookies.set(this.ACCESS_TOKEN, token, {
			expires: 30,
			secure: true,
			sameSite: 'lax',
		});
	}

	getToken(): string | undefined {
		return Cookies.get(this.ACCESS_TOKEN);
	}

	removeToken(): void {
		Cookies.remove(this.ACCESS_TOKEN);
	}

	// Admin profile management
	setAdminProfile(admin: AdminProfile): void {
		localStorage.setItem(this.ADMIN_PROFILE, JSON.stringify(admin));
	}

	getAdminProfile(): AdminProfile | null {
		const adminStr = localStorage.getItem(this.ADMIN_PROFILE);
		return adminStr ? JSON.parse(adminStr) : null;
	}

	removeAdminProfile(): void {
		localStorage.removeItem(this.ADMIN_PROFILE);
	}

	// Check if user is authenticated
	isAuthenticated(): boolean {
		const token = this.getToken();
		const admin = this.getAdminProfile();
		return !!(token && admin);
	}

	// Check if user is system admin
	isSystemAdmin(): boolean {
		const admin = this.getAdminProfile();
		return admin?.role === 'SYSTEM_ADMIN';
	}

	// Check if user has admin privileges
	isAdmin(): boolean {
		const admin = this.getAdminProfile();
		return admin?.role === 'SYSTEM_ADMIN' || admin?.role === 'ADMIN';
	}

	// Clear all authentication data
	clearAuth(): void {
		this.removeToken();
		this.removeAdminProfile();
		delete axios.defaults.headers.common['Authorization'];
	}

	// Set authorization header
	private setAuthHeader(token: string): void {
		axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	}

	// Handle API errors with proper typing
	private handleError(error: unknown): ApiError {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<APIErrorResponse>;

			if (axiosError.response) {
				// Server responded with error status
				const status = axiosError.response.status;
				const data = axiosError.response.data;
				const message = data?.message || 'An error occurred';

				return new ApiError(message, status, data);
			} else if (axiosError.request) {
				// Request was made but no response received
				return new ApiError(
					'Network error - please check your connection',
					0
				);
			}
		}

		// Handle non-axios errors
		if (error instanceof Error) {
			return new ApiError(error.message, 500);
		}

		// Fallback for unknown error types
		return new ApiError('An unexpected error occurred', 500);
	}

	// Initialize auth state from stored tokens
	initializeAuth(): boolean {
		const token = this.getToken();
		const admin = this.getAdminProfile();

		if (token && admin) {
			this.setAuthHeader(token);
			return true;
		}

		this.clearAuth();
		return false;
	}

	// Refresh admin profile from server
	async refreshProfile(): Promise<AdminProfile | null> {
		try {
			const response = await this.getProfile();
			return response.data;
		} catch (error) {
			console.error('Failed to refresh profile:', error);
			return null;
		}
	}
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
