import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import donationService, {
	type DonationSummary,
} from '@/services/donation.service';

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

			if (searchParams.get('cancelled') === 'true') {
				setStatus('cancelled');
				return;
			}

			if (!reference && !paystackStatus) {
				setStatus('failed');
				return;
			}

			try {
				const paymentRef = reference || paystackStatus;
				const result = await donationService.verifyPayment({
					reference: paymentRef!,
				});

				if (result.success) {
					setStatus('success');
					setDonationDetails(result.data.donation);
				} else {
					setStatus('failed');
				}
			} catch (error) {
				console.error('Payment verification error:', error);
				setStatus('failed');
			}
		};

		verifyPayment();
	}, [searchParams]);

	if (status === 'loading') {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center max-w-sm">
					{/* Custom loading animation */}
					<div className="relative mb-8">
						<div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
						<div
							className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-300 rounded-full animate-spin mx-auto"
							style={{
								animationDirection: 'reverse',
								animationDuration: '1.5s',
							}}
						></div>
					</div>
					<p className="text-gray-600 text-lg">
						Confirming your donation...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-16">
			<div className="max-w-2xl mx-auto px-4">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-3xl font-light font-grotesque text-gray-900 mb-2">
						National Toilet Campaign
					</h1>
				</div>

				{/* Success State */}
				{status === 'success' && (
					<div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
						{/* Success indicator */}
						<div className="bg-gradient-to-r from-green-500 to-emerald-600 h-1"></div>

						<div className="p-12 text-center">
							{/* Custom success icon */}
							<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
								<svg
									className="w-10 h-10 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M5 13l4 4L19 7"
									></path>
								</svg>
							</div>

							<h2 className="text-2xl font-light text-gray-900 mb-4">
								Thank you for your donation
							</h2>

							<p className="text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
								Your contribution will help improve sanitation
								facilities across Nigeria. Together, we're building
								healthier communities.
							</p>

							{/* Donation details - minimal card */}
							{donationDetails && (
								<div className="bg-gray-50 rounded-md p-6 mb-8 max-w-sm mx-auto">
									<div className="space-y-3 text-sm">
										<div className="flex justify-between items-center">
											<span className="text-gray-500">Amount</span>
											<span className="font-medium text-gray-900">
												₦{donationDetails.amount.toLocaleString()}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-gray-500">
												Reference
											</span>
											<span className="font-mono text-xs text-gray-700">
												{donationDetails.reference.slice(-12)}
											</span>
										</div>
									</div>
								</div>
							)}

							{/* Actions */}
							<div className="space-y-4">
								<button
									onClick={() => navigate('/')}
									className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-sm font-medium transition-colors"
								>
									Return to Campaign
								</button>

								<p className="text-xs text-gray-500">
									Receipt sent to your email • Tax deductible
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Failed State */}
				{status === 'failed' && (
					<div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
						<div className="bg-gradient-to-r from-red-500 to-rose-600 h-1"></div>

						<div className="p-12 text-center">
							<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
								<svg
									className="w-10 h-10 text-red-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M6 18L18 6M6 6l12 12"
									></path>
								</svg>
							</div>

							<h2 className="text-2xl font-light text-gray-900 mb-4">
								Payment unsuccessful
							</h2>

							<p className="text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
								We couldn't process your donation. Please try again or
								contact us if you continue having issues.
							</p>

							<div className="space-y-3">
								<button
									onClick={() => navigate('/#donate')}
									className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-sm font-medium transition-colors"
								>
									Try Again
								</button>
								<div>
									<button
										onClick={() => navigate('/')}
										className="text-gray-500 hover:text-gray-700 text-sm underline"
									>
										Back to Homepage
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Cancelled State */}
				{status === 'cancelled' && (
					<div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
						<div className="bg-gradient-to-r from-gray-400 to-gray-500 h-1"></div>

						<div className="p-12 text-center">
							<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
								<svg
									className="w-10 h-10 text-gray-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
							</div>

							<h2 className="text-2xl font-light text-gray-900 mb-4">
								Donation cancelled
							</h2>

							<p className="text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
								No payment was processed. You can try again anytime to
								support our mission.
							</p>

							<div className="space-y-3">
								<button
									onClick={() => navigate('/#donate')}
									className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-sm font-medium transition-colors"
								>
									Donate Now
								</button>
								<div>
									<button
										onClick={() => navigate('/')}
										className="text-gray-500 hover:text-gray-700 text-sm underline"
									>
										Back to Homepage
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Footer note */}
				<div className="text-center mt-12">
					<p className="text-gray-400 text-sm">
						Payments secured by Paystack • Questions? Contact support
					</p>
				</div>
			</div>
		</div>
	);
};

export default DonationCallback;
