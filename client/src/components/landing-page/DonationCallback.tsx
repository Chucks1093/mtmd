import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import donationService, {
	type DonationSummary,
} from '@/services/donation.service';
import showToast from '@/utils/toast.util';

const DonationCallback: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState<
		'loading' | 'success' | 'failed' | 'cancelled'
	>('loading');
	const [donationDetails, setDonationDetails] =
		useState<DonationSummary | null>(null);

	useEffect(() => {
		const verifyPayment = async () => {
			const reference = searchParams.get('reference');
			const paystackStatus = searchParams.get('trxref');

			// Check if payment was cancelled
			if (searchParams.get('cancelled') === 'true') {
				setStatus('cancelled');
				return;
			}

			if (!reference && !paystackStatus) {
				setStatus('failed');
				showToast.error('No payment reference found');
				return;
			}

			try {
				const paymentRef = reference || paystackStatus;
				const result = await donationService.verifyPayment({
					reference: paymentRef!,
				});
				console.log(result);

				if (result.success) {
					setStatus('success');
					setDonationDetails(result.data.donation);
					showToast.success('Thank you! Your donation was successful.');
				} else {
					setStatus('failed');
					showToast.error('Payment verification failed');
				}
			} catch (error) {
				console.error('Payment verification error:', error);
				setStatus('failed');
				showToast.error('Failed to verify payment');
			}
		};

		verifyPayment();
	}, [searchParams]);

	const handleContinue = () => {
		navigate('/'); // Redirect to home page or wherever appropriate
	};

	const renderContent = () => {
		switch (status) {
			case 'loading':
				return (
					<div className="text-center">
						<RefreshCw className="w-16 h-16 text-blue-600 mx-auto mb-6 animate-spin" />
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							Verifying Your Payment
						</h1>
						<p className="text-gray-600">
							Please wait while we confirm your donation...
						</p>
					</div>
				);

			case 'success':
				return (
					<div className="text-center">
						<CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							Donation Successful!
						</h1>
						<p className="text-gray-600 mb-6">
							Thank you for supporting the National Toilet Campaign. Your
							contribution will make a real difference in improving
							sanitation across Nigeria.
						</p>

						{donationDetails && (
							<div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
								<h3 className="font-semibold text-green-900 mb-3">
									Donation Details
								</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-green-700">Amount:</span>
										<span className="font-medium">
											₦{donationDetails.amount.toLocaleString()}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-green-700">Reference:</span>
										<span className="font-medium">
											{donationDetails.reference.substring(0, 17)}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-green-700">Date:</span>
										<span className="font-medium">
											{new Date().toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>
						)}

						<div className="space-y-3">
							<button
								onClick={handleContinue}
								className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
							>
								Continue to Homepage
							</button>
							<p className="text-sm text-gray-500">
								A receipt has been sent to your email address.
							</p>
						</div>
					</div>
				);

			case 'failed':
				return (
					<div className="text-center">
						<XCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							Payment Failed
						</h1>
						<p className="text-gray-600 mb-6">
							Unfortunately, your payment could not be processed. Please
							try again or contact support if the problem persists.
						</p>

						<div className="space-y-3">
							<button
								onClick={() => navigate('/donation')}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
							>
								Try Again
							</button>
							<button
								onClick={handleContinue}
								className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
							>
								Back to Homepage
							</button>
						</div>
					</div>
				);

			case 'cancelled':
				return (
					<div className="text-center">
						<XCircle className="w-16 h-16 text-yellow-600 mx-auto mb-6" />
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							Payment Cancelled
						</h1>
						<p className="text-gray-600 mb-6">
							You cancelled the payment process. No charges have been
							made to your account.
						</p>

						<div className="space-y-3">
							<button
								onClick={() => navigate('/donation')}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
							>
								Try Again
							</button>
							<button
								onClick={handleContinue}
								className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
							>
								Back to Homepage
							</button>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full">
				<div className="bg-white rounded-xl shadow-lg p-8">
					{renderContent()}
				</div>
			</div>
		</div>
	);
};

export default DonationCallback;
