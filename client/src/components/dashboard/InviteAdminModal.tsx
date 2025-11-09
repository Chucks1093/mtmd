import React, { useState } from 'react';
import { X, Mail, User } from 'lucide-react';
import { ApiError, authService } from '@/services/auth.service';
import showToast from '@/utils/toast.util';
import CircularSpinner from '@/components/common/CircularSpinnerProps';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import FormInput from '@/components/shared/FormInput';
import FormSelector, {
	type SelectOption,
} from '@/components/shared/FormSelector';

interface InviteAdminModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

// Role options for the selector
const roleOptions: SelectOption[] = [
	{
		value: '0',
		label: 'Admin',
		description: 'Standard admin access for managing reports and content',
	},
	{
		value: '1',
		label: 'System Admin',
		description: 'Full access including user management and system settings',
	},
];

// Role values mapping
const roleValues = ['ADMIN', 'SYSTEM_ADMIN'] as const;

const InviteAdminModal: React.FC<InviteAdminModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
}) => {
	const [formData, setFormData] = useState({
		email: '',
		name: '',
		role: 'ADMIN' as 'ADMIN' | 'SYSTEM_ADMIN',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email address';
		}

		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		} else if (formData.name.trim().length < 2) {
			newErrors.name = 'Name must be at least 2 characters';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Mark field as touched
		setTouched(prev => ({ ...prev, [field]: true }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const getCurrentRoleIndex = () => {
		const index = roleValues.indexOf(formData.role);
		return index.toString();
	};

	const handleSubmit = async () => {
		// Mark all fields as touched
		setTouched({ email: true, name: true, role: true });

		if (!validateForm()) {
			return;
		}

		try {
			setIsSubmitting(true);

			const result = await authService.inviteAdmin({
				email: formData.email.trim(),
				name: formData.name.trim(),
				role: formData.role,
			});

			if (result.success) {
				showToast.success(`Invitation sent to ${formData.email}`);
				handleClose();
				onSuccess();
			} else {
				showToast.error(result.message || 'Failed to send invitation');
			}
		} catch (error) {
			console.error('Error inviting admin:', error);
			if (error instanceof ApiError) {
				const errorMessage = error.message;
				showToast.error(errorMessage);
			}
			showToast.error('Failed to send invitation');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setFormData({
			email: '',
			name: '',
			role: 'ADMIN',
		});
		setErrors({});
		setTouched({});
		setIsSubmitting(false);
		onClose();
	};

	// Icon components
	const MailIcon = () => (
		<div className="text-gray-400 pr-5 pl-2">
			<Mail />
		</div>
	);

	const UserIcon = () => (
		<div className="text-gray-400 pr-5 pl-2">
			<User />
		</div>
	);

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-xl p-0 gap-0 bg-white flex flex-col">
				{/* Fixed Header */}
				<DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<DialogTitle className="text-xl font-medium text-gray-700 font-jakarta">
								Invite Admin
							</DialogTitle>
						</div>
						<button
							onClick={handleClose}
							className="w-8 h-8 hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors rounded-full bg-gray-100"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>
				</DialogHeader>

				{/* Scrollable Content */}
				<ScrollArea className="h-[52vh]">
					<div className="p-6 space-y-6 h-full flex flex-col">
						{/* Email Input */}
						<FormInput
							label="Email Address"
							value={formData.email}
							onChange={value => handleInputChange('email', value)}
							placeholder="admin@example.com"
							required
							type="email"
							error={errors.email}
							touched={touched.email}
							disabled={isSubmitting}
							suffix={<MailIcon />}
						/>

						{/* Name Input */}
						<FormInput
							label="Full Name"
							value={formData.name}
							onChange={value => handleInputChange('name', value)}
							placeholder="John Doe"
							required
							type="text"
							error={errors.name}
							touched={touched.name}
							disabled={isSubmitting}
							suffix={<UserIcon />}
						/>

						{/* Role Selector */}
						<FormSelector
							label="Role"
							value={getCurrentRoleIndex()}
							onChange={value => {
								const actualValue = roleValues[Number(value)];
								if (actualValue) {
									handleInputChange('role', actualValue);
								}
							}}
							options={roleOptions}
							required
							placeholder="Select admin role"
							disabled={isSubmitting}
							searchable
						/>

						{/* Info Box */}
						<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<div>
									<p className="text-sm text-gray-600 font-inter">
										An invitation email will be sent to the provided
										email address. The recipient will need to click
										the invitation link and complete the setup process
										using Google OAuth.
									</p>
								</div>
							</div>
						</div>
					</div>
				</ScrollArea>

				{/* Fixed Action Buttons */}
				<div className="p-6 pt-4 flex-shrink-0 border-t flex gap-3 items-center">
					<button
						onClick={handleClose}
						disabled={isSubmitting}
						className="px-6 py-3 h-12 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={isSubmitting || !formData.email || !formData.name}
						className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-gray-50 font-medium px-6 py-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 justify-center"
					>
						{isSubmitting ? (
							<CircularSpinner size={22} className="mx-8" />
						) : (
							'Send Invitation'
						)}
						<Mail />
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default InviteAdminModal;
