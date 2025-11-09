// components/auth/OAuthCallback.tsx
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

					// Different redirect messages based on flow type
					if (result.isInviteFlow) {
						// For invite flow, redirect to dashboard with a different message
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
						// Regular login flow
						setTimeout(() => {
							navigate('/admin/dashboard', { replace: true });
						}, 2000);
					}
				} else {
					setStatus('error');
					setMessage(result.message);
					setIsInviteFlow(result.isInviteFlow || false);

					// For invite flow errors, redirect to login with invite token
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
						// Regular login error
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

	const getStatusIcon = () => {
		if (status === 'loading') {
			return (
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
			);
		}

		if (status === 'success') {
			return (
				<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
					<svg
						className="h-6 w-6 text-green-600"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={2}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
			);
		}

		return (
			<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
				<svg
					className="h-6 w-6 text-red-600"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={2}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</div>
		);
	};

	const getTitle = () => {
		if (status === 'loading') {
			return isInviteFlow
				? 'Processing Invitation'
				: 'Processing Authentication';
		}

		if (status === 'success') {
			return isInviteFlow ? 'Invitation Accepted!' : 'Login Successful!';
		}

		return isInviteFlow ? 'Invitation Failed' : 'Authentication Failed';
	};

	const getDescription = () => {
		if (status === 'loading') {
			return isInviteFlow
				? 'Please wait while we complete your invitation acceptance...'
				: 'Please wait while we complete your login...';
		}

		if (status === 'success') {
			return message;
		}

		return message;
	};

	const getRedirectMessage = () => {
		if (status === 'success') {
			return 'Redirecting to admin dashboard...';
		}

		if (status === 'error') {
			return isInviteFlow
				? 'Redirecting back to invitation page...'
				: 'Redirecting to login page...';
		}

		return '';
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
				<div className="text-center">
					{getStatusIcon()}

					<h2 className="mt-4 text-lg font-semibold text-gray-900">
						{getTitle()}
					</h2>

					<p className="mt-2 text-sm text-gray-600">{getDescription()}</p>

					{status !== 'loading' && (
						<p className="mt-1 text-xs text-gray-500">
							{getRedirectMessage()}
						</p>
					)}

					{/* Additional information for invite flow */}
					{isInviteFlow && status === 'success' && (
						<div className="mt-4 p-3 bg-blue-50 rounded-md">
							<p className="text-xs text-blue-700">
								You are now part of the National Toilet Campaign admin
								team. You'll have access to the admin dashboard and
								tools based on your assigned role.
							</p>
						</div>
					)}

					{isInviteFlow && status === 'error' && (
						<div className="mt-4 p-3 bg-yellow-50 rounded-md">
							<p className="text-xs text-yellow-700">
								There was an issue processing your invitation. This
								could be because:
							</p>
							<ul className="mt-1 text-xs text-yellow-700 list-disc list-inside">
								<li>The invitation may have expired</li>
								<li>Your Google account may not be authorized</li>
								<li>The invitation may have already been used</li>
							</ul>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default OAuthCallback;
