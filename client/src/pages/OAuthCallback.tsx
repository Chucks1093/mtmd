import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import authService from '@/services/auth.service';

const OAuthCallback: React.FC = () => {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
		'loading'
	);
	const [message, setMessage] = useState('Processing authentication...');
	const [isInviteFlow, setIsInviteFlow] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const handleCallback = async () => {
			try {
				const params = new URLSearchParams(location.search);
				const result = await authService.handleOAuthCallback(params);

				if (result.success) {
					setStatus('success');
					setMessage(result.message);
					setIsInviteFlow(result.isInviteFlow || false);

					if (result.isInviteFlow) {
						setTimeout(() => {
							navigate('/admin/dashboard', {
								replace: true,
								state: {
									justAcceptedInvite: true,
									message:
										'Welcome! Your invitation has been accepted.',
								},
							});
						}, 2000);
					} else {
						setTimeout(() => {
							navigate('/admin/dashboard', { replace: true });
						}, 2000);
					}
				} else {
					setStatus('error');
					setMessage(result.message);
					setIsInviteFlow(result.isInviteFlow || false);

					if (result.isInviteFlow) {
						const inviteToken = authService.getInviteToken();
						setTimeout(() => {
							const redirectUrl = inviteToken
								? `/admin/auth?invite=${inviteToken}&error=${encodeURIComponent(
										result.message
								  )}`
								: `/admin/auth?error=${encodeURIComponent(
										result.message
								  )}`;
							navigate(redirectUrl, { replace: true });
						}, 3000);
					} else {
						setTimeout(() => {
							navigate(
								`/admin/auth?error=${encodeURIComponent(
									result.message
								)}`,
								{ replace: true }
							);
						}, 3000);
					}
				}
			} catch (error) {
				setStatus('error');
				console.log(error);
				setMessage('Failed to process authentication response');
				setTimeout(() => {
					navigate('/admin/auth', { replace: true });
				}, 3000);
			}
		};

		handleCallback();
	}, [location, navigate]);

	return (
		<div className="min-h-screen relative flex items-center justify-center p-4">
			{/* Background Image */}
			<div className="absolute inset-0">
				<img
					src="/images/auth-image.jpg"
					alt=""
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-black/40"></div>
			</div>

			{/* Modal */}
			<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
				<div className="text-center">
					{/* Status Icon */}
					<div className="mb-6">
						{status === 'loading' && (
							<div className="w-16 h-16 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
						)}

						{status === 'success' && (
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
								<svg
									className="w-8 h-8 text-green-600"
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
						)}

						{status === 'error' && (
							<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
								<svg
									className="w-8 h-8 text-red-600"
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
						)}
					</div>

					{/* Title */}
					<h1 className="text-2xl font-medium text-gray-900 mb-3">
						{status === 'loading' &&
							(isInviteFlow ? 'Processing Invitation' : 'Signing In')}
						{status === 'success' &&
							(isInviteFlow ? 'Welcome to the Team!' : 'Success!')}
						{status === 'error' && 'Something Went Wrong'}
					</h1>

					{/* Message */}
					<p className="text-gray-600 mb-6">
						{status === 'loading' && 'Please wait a moment...'}
						{status === 'success' &&
							(isInviteFlow
								? 'Your invitation has been accepted.'
								: 'You have been signed in.')}
						{status === 'error' && message}
					</p>

					{/* Additional Info */}
					{isInviteFlow && status === 'success' && (
						<div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
							<p className="text-green-800 text-sm">
								You now have access to the admin dashboard and campaign
								management tools.
							</p>
						</div>
					)}

					{status === 'error' && (
						<div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
							<p className="text-red-800 text-sm">
								{isInviteFlow
									? "Please check that your invitation is valid and hasn't expired."
									: 'Please try signing in again or contact support.'}
							</p>
						</div>
					)}

					{/* Redirect Message */}
					<p className="text-xs text-gray-500">
						{status === 'success' && 'Redirecting to dashboard...'}
						{status === 'error' && 'Redirecting back...'}
					</p>
				</div>
			</div>
		</div>
	);
};

export default OAuthCallback;
