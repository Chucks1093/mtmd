// pages/AcceptInvite.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import authService from '@/services/auth.service';

const AcceptInvite: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [inviteToken, setInviteToken] = useState<string | null>(null);
	const { token } = useParams<{ token: string }>();
	const navigate = useNavigate();

	useEffect(() => {
		if (token) {
			setInviteToken(token);
		} else {
			setError('Invalid or missing invitation token');
		}
	}, [token]);

	const handleAcceptInvite = () => {
		if (!inviteToken) {
			setError('No invitation token found');
			return;
		}

		try {
			setLoading(true);
			setError(null);

			// Store the invite token in localStorage for the OAuth callback to use
			localStorage.setItem('pendingInviteToken', inviteToken);

			// Initiate Google OAuth - this will redirect to Google
			authService.loginWithGoogle();
		} catch (error) {
			setLoading(false);
			console.error('Error accepting invite:', error);
			setError('Failed to initiate Google authentication');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Accept Admin Invitation
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						National Toilet Campaign Admin Panel
					</p>
				</div>

				<div className="mt-8 space-y-6">
					{error && (
						<div className="bg-red-50 border border-red-200 rounded-md p-4">
							<div className="flex">
								<div className="ml-3">
									<h3 className="text-sm font-medium text-red-800">
										Error
									</h3>
									<div className="mt-2 text-sm text-red-700">
										{error}
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="bg-blue-50 border border-blue-200 rounded-md p-4">
						<div className="flex">
							<div className="ml-3">
								<h3 className="text-sm font-medium text-blue-800">
									Administrator Invitation
								</h3>
								<div className="mt-2 text-sm text-blue-700">
									You've been invited to join as an administrator.
									Click below to accept this invitation using your
									Google account.
								</div>
							</div>
						</div>
					</div>

					<div>
						<button
							onClick={handleAcceptInvite}
							disabled={loading || !inviteToken}
							className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
								? 'Accepting Invitation...'
								: 'Accept Invitation with Google'}
						</button>
					</div>

					<div className="text-center">
						<button
							onClick={() => navigate('/admin/auth')}
							className="text-sm text-gray-500 hover:text-gray-700"
						>
							← Back to Login
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AcceptInvite;
