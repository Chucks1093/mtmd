import React, { useState } from 'react';
import { X, ZoomIn, Download, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
	src: string;
	alt: string;
	className?: string;
	thumbnailClassName?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
	src,
	alt,
	className,
	thumbnailClassName,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [rotation, setRotation] = useState(0);

	const handleImageLoad = () => {
		setIsLoading(false);
	};

	const handleImageError = () => {
		setIsLoading(false);
		setImageError(true);
	};

	const openModal = () => {
		setIsModalOpen(true);
		setRotation(0); // Reset rotation when opening modal
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const handleDownload = async () => {
		try {
			const response = await fetch(src);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `toilet-report-image-${Date.now()}.jpg`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Download failed:', error);
		}
	};

	const handleRotate = () => {
		setRotation(prev => (prev + 90) % 360);
	};

	// Handle click outside modal to close
	const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			closeModal();
		}
	};

	if (imageError) {
		return (
			<div
				className={cn(
					'bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center',
					className
				)}
			>
				<div className="text-center p-4">
					<div className="w-8 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
					<p className="text-xs text-gray-500">Failed to load image</p>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* Thumbnail */}
			<div
				className={cn('relative group cursor-pointer', thumbnailClassName)}
				onClick={openModal}
			>
				{isLoading && (
					<div
						className={cn(
							'bg-gray-100 border border-gray-200 rounded-lg animate-pulse flex items-center justify-center',
							className
						)}
					>
						<div className="text-center p-4">
							<div className="w-8 h-8 bg-gray-300 rounded mx-auto"></div>
						</div>
					</div>
				)}

				<img
					src={src}
					alt={alt}
					className={cn(isLoading ? 'hidden' : 'block', className)}
					onLoad={handleImageLoad}
					onError={handleImageError}
				/>

				{/* Hover overlay */}
				<div
					className={cn(
						'absolute inset-0 bg-[#141414ad]  group-hover:bg-[#14141470] transition-all duration-200 rounded-lg flex items-center justify-center',
						className
					)}
				>
					<ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
				</div>
			</div>

			{/* Full-size Modal */}
			{isModalOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
					onClick={handleModalClick}
				>
					{/* Modal Header */}
					<div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
						<h3 className="text-white font-medium truncate">{alt}</h3>
						<div className="flex items-center gap-2">
							<button
								onClick={handleRotate}
								className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg transition-colors"
								title="Rotate image"
							>
								<RotateCw className="w-5 h-5" />
							</button>
							<button
								onClick={handleDownload}
								className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg transition-colors"
								title="Download image"
							>
								<Download className="w-5 h-5" />
							</button>
							<button
								onClick={closeModal}
								className="p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-lg transition-colors"
								title="Close"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
					</div>

					{/* Modal Content */}
					<div className="relative max-w-full max-h-full flex items-center justify-center">
						<img
							src={src}
							alt={alt}
							className="max-w-full max-h-full object-contain"
							style={{
								transform: `rotate(${rotation}deg)`,
								transition: 'transform 0.3s ease',
							}}
							onClick={e => e.stopPropagation()}
						/>
					</div>

					{/* Instructions */}
					<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
						<p className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
							Click outside image to close
						</p>
					</div>
				</div>
			)}
		</>
	);
};

export default ImageViewer;
