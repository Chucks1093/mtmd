import React, { useState, useEffect } from 'react';
import { X, Building2, Globe } from 'lucide-react';
import partnerService from '@/services/partner.service';
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
import FormFileUpload from '../shared/FormFileUpload';
import { z } from 'zod';
import { useZodValidation } from '@/hooks/useZodValidation';
import uploadService from '@/services/upload.service';
import ImageViewer from './ImageViewer';

interface AddPartnerModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	partner: {
		id: string;
		name: string;
		type: (typeof partnerTypeValues)[number];
		website?: string;
		logo: string;
	} | null;
}

const partnerTypeOptions: SelectOption[] = [
	{
		value: '0',
		label: 'Corporate',
		description: 'Business organizations and companies',
	},
	{ value: '1', label: 'NGO', description: 'Non-governmental organizations' },
	{
		value: '2',
		label: 'Government',
		description: 'Government agencies and departments',
	},
	{
		value: '3',
		label: 'International',
		description: 'International organizations',
	},
	{
		value: '4',
		label: 'Community',
		description: 'Community-based organizations',
	},
	{
		value: '5',
		label: 'Academic',
		description: 'Educational and research institutions',
	},
	{
		value: '6',
		label: 'Media',
		description: 'Media and communication organizations',
	},
];

const partnerTypeValues = [
	'CORPORATE',
	'NGO',
	'GOVERNMENT',
	'INTERNATIONAL',
	'COMMUNITY',
	'ACADEMIC',
	'MEDIA',
] as const;

export const PartnerSchema = z.object({
	name: z.string().min(2, 'Partner name is required'),
	website: z.url('Invalid website URL').optional().or(z.literal('')),
	type: z
		.enum([
			'CORPORATE',
			'NGO',
			'GOVERNMENT',
			'INTERNATIONAL',
			'COMMUNITY',
			'ACADEMIC',
			'MEDIA',
		])
		.default('GOVERNMENT'),
	logo: z.url('Invalid logo URL'),
});

type PartnerFormData = z.infer<typeof PartnerSchema>;

const initialPartnerData: PartnerFormData = {
	name: '',
	website: '',
	type: 'GOVERNMENT',
	logo: '',
};

const AddPartnerModal: React.FC<AddPartnerModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
	partner,
}) => {
	const [formData, setFormData] =
		useState<PartnerFormData>(initialPartnerData);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [logoFile, setLogoFile] = useState<File | null>(null);

	const {
		validate,
		errors,
		touched,
		markAllTouched,
		validateAndTouch,
		clearErrors,
	} = useZodValidation(initialPartnerData);

	// Initialize form with partner data for editing
	useEffect(() => {
		if (partner) {
			setFormData({
				name: partner.name,
				type: partner.type,
				website: partner.website || '',
				logo: partner.logo,
			});
		} else {
			setFormData(initialPartnerData);
		}
		setLogoFile(null);
		clearErrors();
	}, [partner]);

	const handleInputChange = (field: keyof typeof formData, value: string) => {
		setFormData(prev => {
			const newData = { ...prev, [field]: value };
			validateAndTouch(PartnerSchema, newData, field);
			return newData;
		});
	};

	const getCurrentTypeIndex = () => {
		const index = partnerTypeValues.indexOf(formData.type);
		return index.toString();
	};

	const handleSubmit = async () => {
		markAllTouched();
		const validatedData = validate(PartnerSchema, formData);

		if (!validatedData) {
			showToast.error('Please fix the errors in the form');
			return;
		}

		// For creating, require a logo if none exists
		if (!partner?.logo && !logoFile) {
			showToast.error('Upload A Logo to continue');
			return;
		}

		try {
			setIsSubmitting(true);

			let logoUrl = partner?.logo || '';
			if (logoFile) {
				const uploadResult = await uploadService.uploadMultipleImages(
					[logoFile],
					() => {
						showToast.loading(`Uploading logo..`);
					}
				);

				if (!uploadResult.success) {
					showToast.error('Failed to upload logo');
					return;
				}

				logoUrl = uploadResult.data.images[0].url;
			}

			let result;
			if (partner) {
				// Edit existing partner
				result = await partnerService.updatePartner(partner.id, {
					...validatedData,
					logo: logoUrl,
				});
			} else {
				// Create new partner
				result = await partnerService.createPartner({
					...validatedData,
					logo: logoUrl,
				});
			}

			if (result.success) {
				showToast.success(
					partner
						? `Partner "${formData.name}" updated successfully`
						: `Partner "${formData.name}" added successfully`
				);
				handleClose();
				onSuccess();
			} else {
				showToast.error(result.message || 'Operation failed');
			}
		} catch (error) {
			console.error('Error submitting partner:', error);
			showToast.error('Operation failed');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setFormData(initialPartnerData);
		setLogoFile(null);
		setIsSubmitting(false);
		clearErrors();
		onClose();
	};

	const BuildingIcon = () => (
		<div className="text-gray-400 pr-5 pl-2">
			<Building2 />
		</div>
	);
	const GlobeIcon = () => (
		<div className="text-gray-400 pr-5 pl-2">
			<Globe />
		</div>
	);

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-xl p-0 gap-0 bg-white flex flex-col max-h-[90vh]">
				<DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-xl font-medium text-gray-700 font-jakarta">
							{partner ? 'Edit Partner' : 'Add Partner'}
						</DialogTitle>
						<button
							onClick={handleClose}
							className="w-8 h-8 hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors rounded-full bg-gray-100"
						>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>
				</DialogHeader>

				<ScrollArea className="h-[52vh] max-h-[30rem]">
					<div className="p-6 space-y-6">
						<div className="space-y-7">
							<FormInput
								label="Partner Name"
								value={formData.name}
								onChange={value => handleInputChange('name', value)}
								placeholder="e.g., UNICEF Nigeria"
								required
								type="text"
								error={errors.name}
								touched={touched.name}
								disabled={isSubmitting}
								suffix={<BuildingIcon />}
							/>

							<FormFileUpload
								id="logo"
								label="Upload Partner Logo"
								acceptedFormats=".jpg,.jpeg,.svg,.png"
								required={!partner?.logo}
								maxSize={3}
								onChange={file => {
									if (file) {
										setLogoFile(file);
										const url = URL.createObjectURL(file);
										handleInputChange('logo', url);
									}
								}}
							/>

							{formData.logo && (
								<ImageViewer
									className="size-24 object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
									src={formData.logo}
									alt={formData.name}
								/>
							)}

							<FormSelector
								label="Partner Type"
								value={getCurrentTypeIndex()}
								onChange={value => {
									const actualValue = partnerTypeValues[Number(value)];
									if (actualValue)
										handleInputChange('type', actualValue);
								}}
								options={partnerTypeOptions}
								required
								placeholder="Select partner type"
								disabled={isSubmitting}
								searchable
							/>

							<FormInput
								label="Website"
								value={formData.website || ''}
								onChange={value => handleInputChange('website', value)}
								placeholder="https://example.com"
								type="text"
								error={errors.website}
								touched={touched.website}
								disabled={isSubmitting}
								suffix={<GlobeIcon />}
							/>
						</div>
					</div>
				</ScrollArea>

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
						disabled={isSubmitting || !formData.name}
						className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-gray-50 font-medium px-6 py-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 justify-center"
					>
						{isSubmitting ? (
							<CircularSpinner size={22} className="mx-8" />
						) : partner ? (
							'Update Partner'
						) : (
							'Add Partner'
						)}
						<Building2 />
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AddPartnerModal;
