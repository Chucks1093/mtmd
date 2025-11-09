// components/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import authService from '@/services/auth.service';

const LoginPage: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [inviteToken, setInviteToken] = useState<string | null>(null);
	const [isInviteFlow, setIsInviteFlow] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		// Check for invite token in URL
		const urlParams = new URLSearchParams(location.search);
		const invite = urlParams.get('invite');

		if (invite) {
			console.log(invite);
			setInviteToken(invite);
			setIsInviteFlow(true);
			// Store the invite token in the auth service
			authService.extractAndStoreInviteToken(location.search);
		}

		// Check for error messages in URL params (from OAuth callback)
		const success = urlParams.get('success');
		const message = urlParams.get('message');

		if (success === 'false' && message) {
			setError(decodeURIComponent(message));
		}

		// Clear URL params after processing but keep invite token if it exists
		if (success || message) {
			const newUrl = invite ? `/admin/auth?invite=${invite}` : '/admin/auth';
			navigate(newUrl, { replace: true });
		}
	}, [location, navigate]);

	const handleGoogleLogin = () => {
		try {
			setLoading(true);
			setError(null);
			// Pass invite token if this is an invite flow
			authService.loginWithGoogle(inviteToken || undefined);
		} catch (error) {
			setLoading(false);
			console.log(error);
			setError(
				isInviteFlow
					? 'Failed to process invitation'
					: 'Failed to initiate Google login'
			);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						{isInviteFlow ? 'Accept Admin Invitation' : 'Admin Login'}
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						{isInviteFlow
							? 'You have been invited to join the National Toilet Campaign admin team'
							: 'National Toilet Campaign Admin Panel'}
					</p>
				</div>

				<div className="mt-8 space-y-6">
					{isInviteFlow && (
						<div className="bg-blue-50 border border-blue-200 rounded-md p-4">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-blue-400"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<h3 className="text-sm font-medium text-blue-800">
										Admin Invitation
									</h3>
									<div className="mt-2 text-sm text-blue-700">
										You need to authenticate with your Google account
										to accept this invitation and join the admin team.
									</div>
								</div>
							</div>
						</div>
					)}

					{error && (
						<div className="bg-red-50 border border-red-200 rounded-md p-4">
							<div className="flex">
								<div className="ml-3">
									<h3 className="text-sm font-medium text-red-800">
										{isInviteFlow
											? 'Invitation Error'
											: 'Authentication Error'}
									</h3>
									<div className="mt-2 text-sm text-red-700">
										{error}
									</div>
								</div>
							</div>
						</div>
					)}

					<div>
						<button
							onClick={handleGoogleLogin}
							disabled={loading}
							className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<span className="absolute left-0 inset-y-0 flex items-center pl-3">
								{loading ? (
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
								) : (
									<svg className="h-5 w-5" viewBox="0 0 24 24">
										<path
											fill="currentColor"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="currentColor"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="currentColor"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="currentColor"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
								)}
							</span>
							{loading
								? isInviteFlow
									? 'Processing invitation...'
									: 'Signing in...'
								: isInviteFlow
								? 'Continue with Google to Accept Invitation'
								: 'Continue with Google'}
						</button>
					</div>

					<div className="text-center">
						<p className="mt-2 text-xs text-gray-500">
							{isInviteFlow
								? 'By continuing, you accept the invitation to join as an administrator. You must use a Google account that the system administrator has authorized.'
								: 'Only authorized administrators can access this panel. Contact your system administrator for access.'}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
