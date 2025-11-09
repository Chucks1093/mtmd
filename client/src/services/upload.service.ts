import axios, { AxiosError, type AxiosResponse } from 'axios';

export interface UploadedFile {
	url: string;
	publicId: string;
	width: number;
	height: number;
	format: string;
	bytes: number;
}

export interface MultipleUploadResponse {
	success: boolean;
	message: string;
	data: {
		images: UploadedFile[]; // ← Changed from "uploadedFiles" to "images"
		count: number;
	};
}

export class ApiError extends Error {
	public status: number;
	constructor(message: string, status: number = 500) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

class UploadService {
	private API_URL: string;

	constructor() {
		this.API_URL = import.meta.env.VITE_BACKEND_URL;
		axios.defaults.baseURL = this.API_URL;
	}

	/**
	 * Upload multiple files in a single request
	 */
	async uploadMultipleImages(
		files: File[],
		onProgress?: (filename: string, progress: number) => void
	): Promise<MultipleUploadResponse> {
		try {
			// Validate all files first
			files.forEach(file => this.validateFile(file));

			const formData = new FormData();

			// Append all files to the same FormData - try 'images' field name
			// Change this if your backend expects a different field name
			files.forEach(file => {
				formData.append('images', file);
			});

			const response: AxiosResponse<MultipleUploadResponse> =
				await axios.post('/upload/images', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
					onUploadProgress: progressEvent => {
						if (onProgress && progressEvent.total) {
							const progress = Math.round(
								(progressEvent.loaded * 100) / progressEvent.total
							);
							// Since it's one request for all files, we'll show progress for all
							files.forEach(file => {
								onProgress(file.name, progress);
							});
						}
					},
				});

			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	}

	/**
	 * Validate file before upload
	 */
	private validateFile(file: File): void {
		const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (!allowed.includes(file.type)) {
			throw new ApiError(`Unsupported file type: ${file.type}`, 400);
		}

		const maxSizeMB = 20;
		if (file.size > maxSizeMB * 1024 * 1024) {
			throw new ApiError(`File too large. Max size: ${maxSizeMB}MB`, 400);
		}
	}

	/**
	 * Handle errors gracefully
	 */
	private handleError(error: unknown): ApiError {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<{ message?: string }>;
			const status = axiosError.response?.status || 500;
			const message =
				axiosError.response?.data?.message ||
				axiosError.message ||
				'Upload failed';
			return new ApiError(message, status);
		}

		if (error instanceof Error) return new ApiError(error.message, 500);
		return new ApiError('Unexpected error occurred during upload', 500);
	}
}

export const uploadService = new UploadService();
export default uploadService;
