import { authService } from '@/services/auth.service';
import showToast from '@/utils/toast.util';
import { redirect } from 'react-router';

export async function adminLoader() {
	try {
		const userProfile = await authService.getProfile();
		if (!userProfile) {
			return redirect('/auth/login');
		}

		return userProfile.data;
	} catch (error) {
		console.error('Auth check failed:', error);
		showToast.error('An authentication error occurred');
		return redirect('/auth/login');
	}
}
