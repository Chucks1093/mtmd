import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
	label?: string;
	files: File[];
	onChange: (files: File[]) => void;
	maxImages?: number;
	maxSizeInMB?: number;
	acceptedFormats?: string[];
	error?: string;
	touched?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
	label = 'Images',
	files,
	onChange,
	maxImages = 5,
	maxSizeInMB = 20,
	acceptedFormats = ['JPG', 'JPEG', 'PNG', 'WEBP'],
	error,
	touched,
}) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Keep a list of preview URLs derived from files so we can revoke them
	const [previews, setPreviews] = useState<string[]>([]);

	// Helper: normalized accepted formats (uppercased, trimmed)
	const normalizedFormats = acceptedFormats.map(f => f.trim().toUpperCase());

	const validateFile = (file: File): string | null => {
		// Check file type by extension
		const fileExtension = file.name.split('.').pop()?.toUpperCase();
		if (!fileExtension || !normalizedFormats.includes(fileExtension)) {
			return `Please upload ${normalizedFormats.join(', ')} files only.`;
		}

		// Check file size
		const fileSizeInMB = file.size / (1024 * 1024);
		if (fileSizeInMB > maxSizeInMB) {
			return `File size must be less than ${maxSizeInMB}MB.`;
		}

		return null;
	};

	const handleFiles = useCallback(
		async (fileList: FileList) => {
			// If we're already at or above limit, ignore
			if (files.length >= maxImages) {
				return;
			}

			const validFiles: File[] = [];
			for (let i = 0; i < fileList.length; i++) {
				const file = fileList[i];
				const validationError = validateFile(file);

				if (
					!validationError &&
					files.length + validFiles.length < maxImages
				) {
					validFiles.push(file);
				}
			}

			if (validFiles.length > 0) {
				onChange([...files, ...validFiles]);
			}
		},
		[files, maxImages, onChange] // deps kept correct
	);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const fileList = e.target.files;
		if (fileList) {
			handleFiles(fileList);
		}
		// Reset input value to allow re-uploading same file
		e.target.value = '';
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);

		const fileList = e.dataTransfer.files;
		if (fileList) {
			handleFiles(fileList);
		}
	};

	const removeImage = (index: number) => {
		const newFiles = files.filter((_, i) => i !== index);
		onChange(newFiles);
	};

	const openFileDialog = () => {
		if (files.length >= maxImages) return;
		fileInputRef.current?.click();
	};

	// Build accept attribute (lowercase, with leading dots)
	const acceptAttr = normalizedFormats
		.map(f => '.' + f.toLowerCase())
		.join(',');

	// Build human readable formats text (avoid duplication)
	const acceptedText = normalizedFormats.join(', ');

	// Manage previews (create object URLs and revoke old ones)
	useEffect(() => {
		// create urls for new files
		const urls = files.map(f => URL.createObjectURL(f));
		// set them
		setPreviews(urls);

		// cleanup: revoke urls when files change or component unmounts
		return () => {
			urls.forEach(u => URL.revokeObjectURL(u));
		};
	}, [files]);

	return (
		<div className="space-y-4">
			<label className="block text-sm font-medium text-gray-700">
				{label}
			</label>

			{/* Upload Area */}
			<div
				className={`
					border-2 border-dashed rounded-lg p-8 text-center transition-colors
					${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
					${error && touched ? 'border-red-300 bg-red-50' : ''}
					${
						files.length >= maxImages
							? 'opacity-50 cursor-not-allowed'
							: 'cursor-pointer hover:border-gray-400'
					}
				`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={files.length < maxImages ? openFileDialog : undefined}
			>
				<div className="space-y-3">
					{/* stopPropagation on the button so we don't trigger div's onClick twice */}
					<button
						type="button"
						onClick={e => {
							e.stopPropagation();
							openFileDialog();
						}}
						disabled={files.length >= maxImages}
						className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Upload className="w-4 h-4 mr-2" />
						Upload
					</button>

					<p className="text-sm text-gray-500">
						Choose images or drag & drop it here.
					</p>

					<p className="text-xs text-gray-400">
						{acceptedText}. Max {maxSizeInMB} MB.
					</p>

					{maxImages > 1 && (
						<p className="text-xs text-gray-400">
							{files.length} of {maxImages} images uploaded
						</p>
					)}
				</div>
			</div>

			{/* Error Message */}
			{error && touched && <p className="text-sm text-red-600">{error}</p>}

			{/* Image Previews */}
			{files.length > 0 && (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{files.map((file, index) => (
						<div key={file.name + '-' + index} className="relative group">
							{/* use preview url */}
							<img
								src={previews[index]}
								alt={file.name}
								className="w-full h-24 object-cover rounded-lg border"
							/>
							<button
								type="button"
								onClick={() => removeImage(index)}
								className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
							>
								<X className="w-4 h-4" />
							</button>
							<div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded truncate max-w-full">
								{file.name}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Hidden File Input */}
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept={acceptAttr}
				onChange={handleFileSelect}
				className="hidden"
			/>
		</div>
	);
};

export default ImageUpload;
