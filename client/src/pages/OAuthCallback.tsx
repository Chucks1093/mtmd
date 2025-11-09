// components/auth/OAuthCallback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import authService from '@/services/auth.service';

const OAuthCallback: React.FC = () => {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
		'loading'
	);
	const [message, setMessage] = useState('Processing authentication...');
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const handleCallback = () => {
			try {
				const params = new URLSearchParams(location.search);
				const result = authService.handleOAuthCallback(params);

				if (result.success) {
					setStatus('success');
					setMessage(result.message);

					// Redirect to dashboard after successful login
					setTimeout(() => {
						navigate('/admin/dashboard', { replace: true });
					}, 2000);
				} else {
					setStatus('error');
					setMessage(result.message);

					// Redirect back to login after error
					setTimeout(() => {
						navigate('/admin/auth', { replace: true });
					}, 3000);
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
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
				<div className="text-center">
					{status === 'loading' && (
						<>
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
							<h2 className="mt-4 text-lg font-semibold text-gray-900">
								Processing Authentication
							</h2>
							<p className="mt-2 text-sm text-gray-600">
								Please wait while we complete your login...
							</p>
						</>
					)}

					{status === 'success' && (
						<>
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
							<h2 className="mt-4 text-lg font-semibold text-gray-900">
								Login Successful!
							</h2>
							<p className="mt-2 text-sm text-gray-600">{message}</p>
							<p className="mt-1 text-xs text-gray-500">
								Redirecting to admin dashboard...
							</p>
						</>
					)}

					{status === 'error' && (
						<>
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
							<h2 className="mt-4 text-lg font-semibold text-gray-900">
								Authentication Failed
							</h2>
							<p className="mt-2 text-sm text-gray-600">{message}</p>
							<p className="mt-1 text-xs text-gray-500">
								Redirecting to login page...
							</p>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default OAuthCallback;
