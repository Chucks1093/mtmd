// store/notificationStore.ts
import { create } from 'zustand';

interface Notification {
	id: string;
	title: string;
	message: string;
	type: string;
	isRead: boolean;
	loanApplicationId: string;
	createdAt: string;
	updatedAt: string;
}

interface Pagination {
	currentPage: number;
	totalPages: number;
	totalDocuments: number;
	hasNextPage: boolean;
}

interface NotificationStore {
	notifications: Notification[];
	unreadCount: number;
	pagination: Pagination | null;
	setNotifications: (
		data: Notification[],
		unread: number,
		pagination: Pagination
	) => void;
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	deleteNotification: (id: string) => void;
	clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>(set => ({
	notifications: [],
	unreadCount: 0,
	pagination: null,

	setNotifications: (data, unread, pagination) =>
		set({
			notifications: data,
			unreadCount: unread,
			pagination,
		}),

	markAsRead: id =>
		set(state => ({
			notifications: state.notifications.map(n =>
				n.id === id ? { ...n, isRead: true } : n
			),
			unreadCount: Math.max(state.unreadCount - 1, 0),
		})),

	markAllAsRead: () =>
		set(state => ({
			notifications: state.notifications.map(n => ({ ...n, isRead: true })),
			unreadCount: 0,
		})),

	deleteNotification: id =>
		set(state => ({
			notifications: state.notifications.filter(n => n.id !== id),
			unreadCount: Math.max(state.unreadCount - 1, 0),
		})),

	clearNotifications: () =>
		set({
			notifications: [],
			unreadCount: 0,
			pagination: null,
		}),
}));
