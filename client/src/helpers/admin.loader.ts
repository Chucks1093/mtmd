import { authService } from '@/services/auth.service';
import showToast from '@/utils/toast.util';
import { redirect } from 'react-router';

export async function adminLoader({ request }: { request: Request }) {
	try {
		const currentUrl = new URL(request.url);
		console.log('Admin loader called for:', currentUrl.pathname);

		const userProfile = await authService.getProfile();

		// If we have a valid user profile
		if (userProfile?.data) {
			console.log('User authenticated:', userProfile.data);

			// If user is logged in but trying to access login page, redirect to dashboard
			if (currentUrl.pathname === '/admin/auth') {
				console.log(
					'Authenticated user accessing login page, redirecting to dashboard'
				);
				return redirect('/admin/dashboard');
			}

			// Otherwise allow access and return user data
			return userProfile.data;
		}

		// No valid user profile - user is not authenticated
		console.log('User not authenticated, redirecting to login');
		return redirect('/admin/auth');
	} catch (error) {
		console.error('Auth check failed:', error);

		// Check if it's an auth-related error (session expired, etc.)
		const isAuthError =
			error instanceof Error &&
			(error.message.includes('expired') ||
				error.message.includes('invalid') ||
				error.message.includes('unauthorized') ||
				error.message.includes('session'));

		if (isAuthError) {
			console.log(
				'Authentication error, clearing any stored tokens and redirecting'
			);
			// Optional: Clear any stored auth tokens
			// localStorage.removeItem('authToken');
			// sessionStorage.clear();
		} else {
			// Show error for non-auth related failures
			showToast.error('An error occurred while checking authentication');
		}

		return redirect('/admin/auth');
	}
}

// Optional: Create a separate loader for checking if user is already logged in
// Use this for login page if you want to redirect logged-in users away from login
export async function loginPageLoader() {
	try {
		const userProfile = await authService.getProfile();

		if (userProfile?.data) {
			// User is already logged in, redirect to dashboard
			return redirect('/admin/dashboard');
		}

		// User not logged in, can access login page
		return null;
	} catch (error) {
		console.log(error);
		// Auth failed, user can access login page
		console.log('Auth check failed, allowing access to login page');
		return null;
	}
}
