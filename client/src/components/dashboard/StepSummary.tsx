import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataItem {
	name: string;
	value: string | React.ReactNode;
	type: 'string' | 'number' | 'file' | 'custom';
}

interface StepSummaryProps {
	title: string;
	data: DataItem[];
	onStepChange?: () => void;
	edittable?: boolean;
	editText?: string;
	className?: string;
}

// Component for string type items
const StringItem: React.FC<{ item: DataItem }> = ({ item }) => (
	<div className="">
		<span className="block text-sm text-gray-500 mb-1 font-jakarta">
			{item.name}:
		</span>
		<span className="text-gray-600 text-lg font-medium">
			{item.value &&
			typeof item.value === 'string' &&
			item.value.trim() !== ''
				? item.value
				: '--'}
		</span>
	</div>
);

// Component for number type items (masked)
const NumberItem: React.FC<{ item: DataItem }> = ({ item }) => {
	const formatNumber = (value: string): string => {
		if (!value || value === '') return '--';
		const str = value.toString();
		return str.length > 3 ? '*'.repeat(str.length - 3) + str.slice(-3) : str;
	};

	return (
		<div className="">
			<span className="block text-sm text-gray-500 mb-1 font-jakarta">
				{item.name}:
			</span>
			<span className="text-gray-700 font-medium">
				{formatNumber(item.value as string)}
			</span>
		</div>
	);
};

// Component for file type items
const FileItem: React.FC<{ item: DataItem }> = ({ item }) => {
	const isUploaded = item.value === 'true';
	const isEmpty =
		!item.value ||
		(typeof item.value === 'string' && item.value.trim() === '');

	return (
		<div className="flex items-center space-x-3 py-2">
			{isEmpty ? (
				<Circle className="w-5 h-5 text-gray-400" />
			) : isUploaded ? (
				<Check className="w-5 h-5 text-white stroke-3 rounded-full bg-green-500 p-1" />
			) : (
				<Circle className="w-5 h-5 text-gray-400" />
			)}
			<span
				className={`text-sm font-jakarta font-medium ${
					isEmpty
						? 'text-gray-400'
						: isUploaded
						? 'text-gray-700'
						: 'text-gray-400'
				}`}
			>
				{item.name}
			</span>
		</div>
	);
};

// Component for custom type items (ReactNode)
const CustomItem: React.FC<{ item: DataItem }> = ({ item }) => (
	<div className="">
		<span className="block text-sm text-gray-500 mb-1 font-jakarta">
			{item.name}:
		</span>
		<div className="text-gray-600">{item.value}</div>
	</div>
);

const StepSummary: React.FC<StepSummaryProps> = ({
	title,
	data,
	onStepChange,
	edittable = false,
	editText = 'Edit',
	className,
}) => {
	// Check if step is complete - all items must have values
	const isComplete = data.every(item => {
		if (item.type === 'file') {
			return (
				!!item.value &&
				typeof item.value === 'string' &&
				item.value.trim() !== '' &&
				item.value !== 'false'
			);
		}
		if (item.type === 'custom') {
			return !!item.value;
		}
		return (
			!!item.value &&
			typeof item.value === 'string' &&
			item.value.trim() !== ''
		);
	});

	const StatusBadge = ({ isComplete }: { isComplete: boolean }) => (
		<span
			className={`inline-flex items-center px-3 py-1 rounded-sm border text-sm font-light font-jakarta ${
				isComplete
					? 'bg-green-50 text-green-700 border-green-200'
					: 'bg-red-50 text-red-800 border-red-200'
			}`}
		>
			{isComplete ? 'Completed' : 'Incomplete'}
		</span>
	);

	const renderItem = (item: DataItem, index: number) => {
		switch (item.type) {
			case 'string':
				return <StringItem key={index} item={item} />;
			case 'number':
				return <NumberItem key={index} item={item} />;
			case 'file':
				return <FileItem key={index} item={item} />;
			case 'custom':
				return <CustomItem key={index} item={item} />;
			default:
				return <StringItem key={index} item={item} />;
		}
	};

	// Separate file items from regular data items
	const regularItems = data.filter(item => item.type !== 'file');
	const fileItems = data.filter(item => item.type === 'file');

	return (
		<div className={'rounded-lg border-gray-200 mb-6'}>
			<h3 className="text-lg font-jakarta font-medium text-gray-800 mb-3">
				{title}
			</h3>
			{/* Header */}
			<div
				className={cn(
					'border relative p-6 bg-white border-dashed border-gray-300 rounded-xl',
					className
				)}
			>
				<div className="flex items-center gap-3 absolute top-6 right-6">
					<StatusBadge isComplete={isComplete} />
					{edittable && (
						<button
							onClick={onStepChange}
							className="cursor-pointer text-blue-500 hover:text-blue-800 font-medium text-md font-jakarta underline"
						>
							{editText}
						</button>
					)}
				</div>

				{/* Regular Data Items */}
				{regularItems.length > 0 && (
					<div className="space-y-4 mb-4">
						{regularItems.map(renderItem)}
					</div>
				)}

				{/* File Items */}
				{fileItems.length > 0 && (
					<div className="space-y-2">{fileItems.map(renderItem)}</div>
				)}
			</div>
		</div>
	);
};

export default StepSummary;
