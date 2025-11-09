import { Fragment, useEffect, useState } from 'react';
import StepSummary from '@/components/dashboard/StepSummary';
import { reportService, type Report } from '@/services/report.service';
import { useNavigate, useParams } from 'react-router';
import CircularSpinner from '@/components/common/CircularSpinnerProps';
import { Skeleton } from '@/components/ui/skeleton';
import {
	getReportStatusBadge,
	getToiletConditionBadge,
	getFacilityTypeBadge,
} from '@/components/dashboard/StatusBadge';
import ImageViewer from '@/components/dashboard/ImageViewer';
import { formatDate } from '@/utils/date.utils';
import { CheckCircle, XCircle, Eye, ArrowLeft } from 'lucide-react';
import showToast from '@/utils/toast.util';

// Main Component
export default function ReportDetails() {
	const { id } = useParams();
	const [reportDetails, setReportDetails] = useState<Report | null>(null);
	const [loading, setLoading] = useState(false);
	const [processingAction, setProcessingAction] = useState<string | null>(
		null
	);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchReportDetails = async () => {
			if (!id) return;
			try {
				setLoading(true);
				const result = await reportService.getReportById(id);
				console.log(result.data);
				setReportDetails(result.data);
			} catch (error) {
				console.log(error);
				showToast.error('Failed to fetch report details');
			} finally {
				setLoading(false);
			}
		};
		fetchReportDetails();
	}, [id]);

	const handleApproveReport = async () => {
		if (!id || !reportDetails) return;

		try {
			setProcessingAction('approve');
			const result = await reportService.updateReportStatus(id, {
				status: 'APPROVED',
				adminNotes: 'Report approved by admin',
			});

			if (result.success) {
				showToast.success('Report approved successfully');
				setReportDetails(prev =>
					prev ? { ...prev, status: 'APPROVED' } : null
				);
			} else {
				showToast.error('Failed to approve report');
			}
		} catch (error) {
			console.error('Error approving report:', error);
			showToast.error('Failed to approve report');
		} finally {
			setProcessingAction(null);
		}
	};

	const handleRejectReport = async () => {
		if (!id || !reportDetails) return;

		try {
			setProcessingAction('reject');
			const result = await reportService.updateReportStatus(id, {
				status: 'REJECTED',
				adminNotes: 'Report rejected by admin',
			});

			if (result.success) {
				showToast.success('Report rejected successfully');
				setReportDetails(prev =>
					prev ? { ...prev, status: 'REJECTED' } : null
				);
			} else {
				showToast.error('Failed to reject report');
			}
		} catch (error) {
			console.error('Error rejecting report:', error);
			showToast.error('Failed to reject report');
		} finally {
			setProcessingAction(null);
		}
	};

	const handleBackToReports = () => {
		navigate('/admin/dashboard/reports');
	};

	if (loading) {
		return (
			<Skeleton className="flex items-center justify-center min-h-screen overflow-y-hidden">
				<CircularSpinner size={60} color="#4C92F5FF" />
			</Skeleton>
		);
	}

	if (!reportDetails) {
		return (
			<div className="max-w-3xl mx-auto p-6">
				<div className="text-center py-12">
					<h2 className="text-2xl font-semibold text-gray-700 mb-2">
						Report Not Found
					</h2>
					<p className="text-gray-500 mb-6">
						The requested report could not be found.
					</p>
					<button
						onClick={handleBackToReports}
						className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
					>
						Back to Reports
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto p-6">
			{/* Header */}
			<button
				onClick={handleBackToReports}
				className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden"
			>
				<ArrowLeft className="w-5 h-5 text-gray-600" />
			</button>
			<div className="flex items-center gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-semibold text-gray-700 font-manrope">
						Report Details
					</h1>
					<p className="text-gray-500 mt-2 font-grotesque">
						Complete overview of the toilet condition report including
						location, images, and submission details.
					</p>
				</div>
			</div>

			<div className="space-y-8 max-w-2xl">
				{/* Images Section */}
				<div className="space-y-4">
					<h3 className="text-lg font-jakarta font-medium text-gray-800 mb-3">
						Submitted Images ({reportDetails.images.length})
					</h3>

					{reportDetails.images.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							{reportDetails.images.map((imageUrl, index) => (
								<ImageViewer
									key={index}
									src={imageUrl}
									alt={`Toilet condition image ${index + 1}`}
									className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
								/>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<Eye className="w-12 h-12 mx-auto mb-3 text-gray-400" />
							<p>No images were submitted with this report</p>
						</div>
					)}
				</div>
				{/* Report Overview */}
				<StepSummary
					title="Report Overview"
					data={[
						{
							name: 'Report ID',
							value: `#${reportDetails.id.slice(-8).toUpperCase()}`,
							type: 'string',
						},
						{
							name: 'Status',
							value: getReportStatusBadge(reportDetails.status),
							type: 'custom',
						},
						{
							name: 'Submission Date',
							value: formatDate(reportDetails.createdAt),
							type: 'string',
						},
						{
							name: 'Last Updated',
							value: formatDate(reportDetails.updatedAt),
							type: 'string',
						},
					]}
				/>

				{/* Submitter Information */}
				<StepSummary
					title="Submitter Information"
					data={[
						{
							name: 'Full Name',
							value: reportDetails.submitterName,
							type: 'string',
						},
						{
							name: 'Email Address',
							value: reportDetails.submitterEmail || 'Not provided',
							type: 'string',
						},
						{
							name: 'Phone Number',
							value: reportDetails.submitterPhone || 'Not provided',
							type: 'string',
						},
					]}
				/>

				{/* Location Details */}
				<StepSummary
					title="Location Information"
					data={[
						{
							name: 'State',
							value: reportDetails.state,
							type: 'string',
						},
						{
							name: 'Local Government Area (LGA)',
							value: reportDetails.lga,
							type: 'string',
						},
						{
							name: 'Ward',
							value: reportDetails.ward || 'Not specified',
							type: 'string',
						},
						{
							name: 'Specific Address',
							value: reportDetails.specificAddress,
							type: 'string',
						},
						{
							name: 'GPS Coordinates',
							value: reportDetails.coordinates || 'Not provided',
							type: 'string',
						},
					]}
				/>

				{/* Facility Information */}
				<StepSummary
					title="Facility Information"
					data={[
						{
							name: 'Toilet Condition',
							value: getToiletConditionBadge(
								reportDetails.toiletCondition
							),
							type: 'custom',
						},
						{
							name: 'Facility Type',
							value: getFacilityTypeBadge(reportDetails.facilityType),
							type: 'custom',
						},
						{
							name: 'Description',
							value:
								reportDetails.description || 'No description provided',
							type: 'string',
						},
					]}
				/>

				{/* Admin Review (if reviewed) */}
				{(reportDetails.reviewedAt || reportDetails.adminNotes) && (
					<StepSummary
						title="Admin Review"
						data={[
							{
								name: 'Reviewed Date',
								value: reportDetails.reviewedAt
									? formatDate(reportDetails.reviewedAt)
									: 'Not reviewed yet',
								type: 'string',
							},
							{
								name: 'Reviewed By',
								value: reportDetails.reviewedBy || 'Not specified',
								type: 'string',
							},
							{
								name: 'Admin Notes',
								value: reportDetails.adminNotes || 'No notes provided',
								type: 'string',
							},
						]}
					/>
				)}

				{/* Action Buttons (only for pending reports) */}
				{reportDetails.status === 'PENDING' && (
					<div className="flex gap-3 items-center mt-8 pt-8 border-t max-w-3xl">
						<button
							onClick={handleApproveReport}
							disabled={processingAction === 'approve'}
							className={`
								bg-green-600 hover:bg-green-700 active:bg-green-800
								disabled:bg-green-300 disabled:cursor-not-allowed
								text-white font-medium px-6 py-3 rounded-lg
								transition-colors duration-200 focus:outline-none 
								focus:ring-2 focus:ring-green-500 focus:ring-offset-2
								flex items-center gap-2 justify-center
							`}
						>
							{processingAction === 'approve' ? (
								<CircularSpinner size={20} />
							) : (
								<Fragment>
									<CheckCircle className="w-5 h-5" />
									Approve Report
								</Fragment>
							)}
						</button>

						<button
							onClick={handleRejectReport}
							disabled={processingAction === 'reject'}
							className={`
								bg-red-600 hover:bg-red-700 active:bg-red-800
								disabled:bg-red-300 disabled:cursor-not-allowed
								text-white font-medium px-6 py-3 rounded-lg
								transition-colors duration-200 focus:outline-none 
								focus:ring-2 focus:ring-red-500 focus:ring-offset-2
								flex items-center gap-2 justify-center
							`}
						>
							{processingAction === 'reject' ? (
								<CircularSpinner size={20} />
							) : (
								<Fragment>
									<XCircle className="w-5 h-5" />
									Reject Report
								</Fragment>
							)}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
