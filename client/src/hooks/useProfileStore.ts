import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminProfile {
	id: string;
	email: string;
	name: string;
	role: 'SYSTEM_ADMIN' | 'ADMIN';
	profilePicture?: string;
	lastLoginAt?: string;
	createdAt: string;
	status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
}

interface ProfileState {
	profile: AdminProfile | null;
	isAuthenticated: boolean;
	isSystemAdmin: boolean;
	isAdmin: boolean;

	// Actions
	setProfile: (profile: AdminProfile) => void;
	clearProfile: () => void;
	updateProfile: (updates: Partial<AdminProfile>) => void;
	initializeAuth: () => void;
}

export const useProfileStore = create<ProfileState>()(
	persist(
		(set, get) => ({
			profile: null,
			isAuthenticated: false,
			isSystemAdmin: false,
			isAdmin: false,

			setProfile: (profile: AdminProfile) => {
				set({
					profile,
					isAuthenticated: true,
					isSystemAdmin: profile.role === 'SYSTEM_ADMIN',
					isAdmin:
						profile.role === 'SYSTEM_ADMIN' || profile.role === 'ADMIN',
				});
			},

			clearProfile: () => {
				set({
					profile: null,
					isAuthenticated: false,
					isSystemAdmin: false,
					isAdmin: false,
				});
			},

			updateProfile: (updates: Partial<AdminProfile>) => {
				const currentProfile = get().profile;
				if (currentProfile) {
					const updatedProfile = { ...currentProfile, ...updates };
					set({
						profile: updatedProfile,
						isSystemAdmin: updatedProfile.role === 'SYSTEM_ADMIN',
						isAdmin:
							updatedProfile.role === 'SYSTEM_ADMIN' ||
							updatedProfile.role === 'ADMIN',
					});
				}
			},

			initializeAuth: () => {
				// This will be called on app startup to sync with localStorage
				const profile = get().profile;
				if (profile) {
					set({
						isAuthenticated: true,
						isSystemAdmin: profile.role === 'SYSTEM_ADMIN',
						isAdmin:
							profile.role === 'SYSTEM_ADMIN' ||
							profile.role === 'ADMIN',
					});
				}
			},
		}),
		{
			name: 'ntc-admin-profile', // localStorage key
			partialize: state => ({ profile: state.profile }), // Only persist profile
			onRehydrateStorage: state => {
				// Re-calculate computed values after rehydration
				if (state?.profile) {
					state.initializeAuth();
				}
			},
		}
	)
);
