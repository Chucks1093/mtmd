import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
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
			localStorage.setItem('pendingInviteToken', inviteToken);
			authService.loginWithGoogle();
		} catch (error) {
			console.log(error);
			setLoading(false);
			setError('Failed to initiate Google authentication');
		}
	};

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
				{/* Header */}
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							></path>
						</svg>
					</div>

					<h1 className="text-2xl font-medium text-gray-900 mb-2">
						Join Our Team
					</h1>
					<p className="text-gray-600 text-sm">
						You've been invited to the National Toilet Campaign admin team
					</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
						<p className="text-red-800 text-sm">{error}</p>
					</div>
				)}

				{/* Invitation Info */}
				{!error && inviteToken && (
					<div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
						<h3 className="font-medium text-green-800 mb-2">
							Admin Invitation
						</h3>
						<p className="text-green-700 text-sm">
							Accept this invitation to gain access to the admin
							dashboard and campaign management tools.
						</p>
					</div>
				)}

				{/* Accept Button */}
				<button
					onClick={handleAcceptInvite}
					disabled={loading || !inviteToken}
					className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
				>
					{loading ? (
						<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
					) : (
						<svg className="w-5 h-5" viewBox="0 0 24 24">
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
					{loading ? 'Accepting Invitation...' : 'Accept with Google'}
				</button>

				{/* Back Button */}
				<button
					onClick={() => navigate('/admin/auth')}
					className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Login
				</button>

				{/* Footer */}
				<p className="text-center text-xs text-gray-500 mt-6">
					Use the Google account authorized by your administrator
				</p>
			</div>
		</div>
	);
};

export default AcceptInvite;
