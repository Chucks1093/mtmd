import { authService } from '@/services/auth.service';
import showToast from '@/utils/toast.util';
import { redirect } from 'react-router';

export async function adminLoader({ request }: { request: Request }) {
	try {
		const userProfile = await authService.getProfile();

		// if not logged in, always go to /admin/auth
		if (!userProfile) {
			return redirect('/admin/auth');
		}

		// if logged in but currently on /admin/auth → redirect to dashboard
		const currentUrl = new URL(request.url);
		if (currentUrl.pathname === '/admin/auth') {
			return redirect('/admin/dashboard');
		}

		// otherwise, allow access
		return userProfile.data;
	} catch (error) {
		console.error('Auth check failed:', error);
		showToast.error('An authentication error occurred');
		return redirect('/admin/auth');
	}
}
