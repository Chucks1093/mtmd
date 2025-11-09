import React, { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
	label: string;
	images: string[];
	onChange: (images: string[]) => void;
	error?: string;
	touched?: boolean;
	required?: boolean;
	description?: string;
	maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
	label,
	images,
	onChange,
	error,
	touched,
	required,
	description,
	maxImages = 5,
}) => {
	const [uploading, setUploading] = useState(false);
	const hasError = touched && error;

	const handleImageUpload = useCallback(
		async (files: FileList | null) => {
			if (!files || files.length === 0) return;

			setUploading(true);
			const newImages: string[] = [];

			try {
				for (
					let i = 0;
					i < Math.min(files.length, maxImages - images.length);
					i++
				) {
					const file = files[i];

					// Validate file type
					if (!file.type.startsWith('image/')) {
						console.warn(`File ${file.name} is not an image`);
						continue;
					}

					// Validate file size (max 5MB)
					if (file.size > 5 * 1024 * 1024) {
						console.warn(`File ${file.name} is too large (max 5MB)`);
						continue;
					}

					// Convert to base64 or upload to service
					// For now, creating object URL for preview
					const imageUrl = URL.createObjectURL(file);
					newImages.push(imageUrl);
				}

				onChange([...images, ...newImages]);
			} catch (error) {
				console.error('Error uploading images:', error);
			} finally {
				setUploading(false);
			}
		},
		[images, onChange, maxImages]
	);

	const removeImage = useCallback(
		(indexToRemove: number) => {
			const updatedImages = images.filter(
				(_, index) => index !== indexToRemove
			);
			onChange(updatedImages);
		},
		[images, onChange]
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			const files = e.dataTransfer.files;
			handleImageUpload(files);
		},
		[handleImageUpload]
	);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	}, []);

	return (
		<div className="space-y-1">
			<label className="block text-sm font-medium text-gray-700">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</label>

			{description && <p className="text-xs text-gray-500">{description}</p>}

			{/* Upload Area */}
			<div
				className={cn(
					'border-2 border-dashed border-gray-300 rounded-lg p-6 text-center',
					'hover:border-gray-400 transition-colors',
					hasError && 'border-red-500',
					uploading && 'bg-gray-50'
				)}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			>
				<input
					type="file"
					multiple
					accept="image/*"
					onChange={e => handleImageUpload(e.target.files)}
					className="hidden"
					id="image-upload"
					disabled={uploading || images.length >= maxImages}
				/>

				{uploading ? (
					<div className="text-gray-500">
						<div className="animate-spin h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
						<p>Uploading images...</p>
					</div>
				) : (
					<div className="text-gray-500">
						<svg
							className="mx-auto h-12 w-12 text-gray-400"
							stroke="currentColor"
							fill="none"
							viewBox="0 0 48 48"
						>
							<path
								d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<label
							htmlFor="image-upload"
							className="cursor-pointer text-blue-600 hover:text-blue-500"
						>
							<span className="font-medium">Click to upload</span> or
							drag and drop
						</label>
						<p className="text-xs text-gray-500 mt-1">
							PNG, JPG, GIF up to 5MB each ({images.length}/{maxImages})
						</p>
					</div>
				)}
			</div>

			{/* Image Previews */}
			{images.length > 0 && (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
					{images.map((image, index) => (
						<div key={index} className="relative group">
							<img
								src={image}
								alt={`Upload ${index + 1}`}
								className="w-full h-24 object-cover rounded-lg border border-gray-200"
							/>
							<button
								type="button"
								onClick={() => removeImage(index)}
								className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								×
							</button>
						</div>
					))}
				</div>
			)}

			{hasError && (
				<p className="text-sm text-red-600" role="alert">
					{error}
				</p>
			)}
		</div>
	);
};
