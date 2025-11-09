import { cn } from '@/lib/utils';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
	itemName?: string;
	showResultsInfo?: boolean;
	className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
	itemName = 'item',
	showResultsInfo = true,
	className,
}) => {
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

	const handlePrevious = () => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNext = () => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	};

	// Don't render pagination if there are no items
	if (totalItems === 0) {
		return null;
	}

	return (
		<div
			className={cn(
				'bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between',
				className
			)}
		>
			{/* Results info */}
			{showResultsInfo && (
				<>
					<div className="text-sm text-gray-700 hidden md:block">
						Showing <span className="font-medium">{startIndex + 1}</span>{' '}
						to <span className="font-medium">{endIndex}</span> of{' '}
						<span className="font-medium">{totalItems}</span>{' '}
						{totalItems === 1 ? itemName : `${itemName}(s)`}
					</div>
					<span className="font-medium text-sm block md:hidden">
						Page {currentPage} / {totalPages}
					</span>
				</>
			)}

			{/* Pagination controls */}
			<div className="flex items-center gap-2">
				<button
					onClick={handlePrevious}
					disabled={currentPage === 1}
					className={`px-4 py-2 border border-gray-200 rounded-md text-sm ${
						currentPage === 1
							? 'text-gray-400 bg-gray-50 cursor-not-allowed'
							: 'text-gray-700 bg-white hover:bg-gray-50'
					}`}
				>
					Previous
				</button>
				<span className="text-sm text-gray-700 hidden md:block">
					Page {currentPage} of {totalPages}
				</span>
				<button
					onClick={handleNext}
					disabled={currentPage === totalPages}
					className={`px-4 py-2 border border-gray-200 rounded-md text-sm ${
						currentPage === totalPages
							? 'text-gray-400 bg-gray-50 cursor-not-allowed'
							: 'text-gray-700 bg-white hover:bg-gray-50'
					}`}
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default Pagination;
