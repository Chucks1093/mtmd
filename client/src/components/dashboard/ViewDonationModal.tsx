import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import showToast from '@/utils/toast.util';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import StepSummary from './StepSummary';
import { type Donation } from '@/services/donation.service';
import { formatDate } from '@/utils/date.utils';

interface ViewDonationModalProps {
	isOpen: boolean;
	onClose: () => void;
	donation: Donation;
}

const ViewDonationModal: React.FC<ViewDonationModalProps> = ({
	isOpen,
	onClose,
	donation,
}) => {
	const [copied, setCopied] = useState(false);

	const formatCurrency = (amount: number, currency: string = 'NGN') => {
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: currency,
		}).format(amount);
	};

	const getDonationTypeLabel = (type: Donation['type']) => {
		switch (type) {
			case 'ONE_TIME':
				return 'One Time';
			case 'MONTHLY':
				return 'Monthly';
			case 'ANNUAL':
				return 'Annual';
			default:
				return type;
		}
	};

	const getStatusColor = (status: Donation['status']) => {
		switch (status) {
			case 'SUCCESS':
				return 'text-green-600';
			case 'PENDING':
				return 'text-yellow-600';
			case 'FAILED':
				return 'text-red-600';
			case 'CANCELLED':
				return 'text-gray-600';
			default:
				return 'text-gray-600';
		}
	};

	const handleCopyReference = async () => {
		if (!donation.paystackReference) return;
		try {
			await navigator.clipboard.writeText(donation.paystackReference);
			setCopied(true);
			showToast.success('Reference copied to clipboard');
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.log(error);
			showToast.error('Failed to copy reference');
		}
	};

	// Custom component for reference with copy functionality
	const ReferenceWithCopy = () => (
		<div className="flex items-center gap-2">
			<span className="text-gray-600 font-mono text-sm break-all">
				{donation.paystackReference}
			</span>
			<button
				onClick={handleCopyReference}
				className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
				title="Copy reference"
			>
				{copied ? (
					<Check className="w-4 h-4 text-green-600" />
				) : (
					<Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
				)}
			</button>
		</div>
	);

	// Custom component for amount display
	const AmountDisplay = () => (
		<div className={`text-lg font-bold ${getStatusColor(donation.status)}`}>
			{formatCurrency(donation.amount, donation.currency)}
		</div>
	);

	// Custom component for status display
	const StatusDisplay = () => (
		<span
			className={`font-medium capitalize ${getStatusColor(donation.status)}`}
		>
			{donation.status.toLowerCase()}
		</span>
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-xl p-0 gap-0 bg-white flex flex-col max-h-[90vh]">
				{/* Fixed Header */}
				<DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div>
								<DialogTitle className="text-xl font-medium text-gray-900 font-jakarta">
									Donation Details
								</DialogTitle>
							</div>
						</div>
						<button
							onClick={onClose}
							className="w-8 h-8 hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors rounded-full"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>
				</DialogHeader>

				{/* Scrollable Content */}
				<ScrollArea className="h-[52vh] max-h-[30rem]">
					<div className="p-6 space-y-6 h-full flex flex-col">
						{/* Donor Information */}
						<StepSummary
							title="Donor Information"
							data={[
								{
									name: 'Donor Name',
									value: donation.isAnonymous
										? 'Anonymous Donor'
										: donation.donorName,
									type: 'string',
								},
								{
									name: 'Email Address',
									value: donation.isAnonymous
										? 'Hidden for privacy'
										: donation.donorEmail,
									type: 'string',
								},
								{
									name: 'Anonymous Donation',
									value: donation.isAnonymous ? 'Yes' : 'No',
									type: 'string',
								},
							]}
						/>

						{/* Transaction Details */}
						<StepSummary
							title="Transaction Details"
							data={[
								{
									name: 'Amount',
									value: <AmountDisplay />,
									type: 'custom',
								},
								{
									name: 'Currency',
									value: donation.currency,
									type: 'string',
								},
								{
									name: 'Donation Type',
									value: getDonationTypeLabel(donation.type),
									type: 'string',
								},
								{
									name: 'Status',
									value: <StatusDisplay />,
									type: 'custom',
								},
								{
									name: 'Paystack Reference',
									value: <ReferenceWithCopy />,
									type: 'custom',
								},
								{
									name: 'Date Created',
									value: formatDate(donation.createdAt),
									type: 'string',
								},
							]}
						/>

						{/* Location Details */}
						{(donation.state || donation.lga) && (
							<StepSummary
								title="Location Details"
								data={[
									{
										name: 'State',
										value: donation.state || 'Not specified',
										type: 'string',
									},
									{
										name: 'Local Government Area',
										value: donation.lga || 'Not specified',
										type: 'string',
									},
								]}
							/>
						)}

						{/* Additional Information */}
						{donation.message && (
							<StepSummary
								title="Additional Information"
								data={[
									{
										name: 'Donor Message',
										value: donation.message || 'No message provided',
										type: 'string',
									},
								]}
							/>
						)}

						{/* Transaction Metadata */}
						<StepSummary
							title="System Information"
							data={[
								{
									name: 'Transaction ID',
									value: donation.id,
									type: 'string',
								},
								{
									name: 'Created At',
									value: new Date(donation.createdAt).toLocaleString(
										'en-NG',
										{
											weekday: 'long',
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
											second: '2-digit',
										}
									),
									type: 'string',
								},
							]}
						/>
					</div>
				</ScrollArea>

				{/* Fixed Footer */}
				<div className="p-6 pt-4 flex-shrink-0 border-t">
					<button
						onClick={onClose}
						className="w-full px-6 py-3 h-12 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
					>
						Close
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ViewDonationModal;
