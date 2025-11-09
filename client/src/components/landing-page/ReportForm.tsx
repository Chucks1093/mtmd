import FormInput from '../shared/FormInput';
import { z } from 'zod';
import { useState, useMemo } from 'react';
import { useZodValidation } from '@/hooks/useZodValidation';
import statesData from '@/data/state-lga.json';
import wardsData from '@/data/wards_new.json';
import FormSelector from '../shared/FormSelector';
import { motion } from 'framer-motion';
import CheckboxOption from '../common/CheckboxOption';
import { Send } from 'lucide-react';
import reportService from '@/services/report.service';
import uploadService from '@/services/upload.service';
import showToast from '@/utils/toast.util';
import ImageUpload from './ImageUpload';

export const ToiletConditionEnum = z.enum([
	'EXCELLENT',
	'GOOD',
	'FAIR',
	'POOR',
	'VERY_POOR',
]);
export const FacilityTypeEnum = z.enum([
	'PUBLIC',
	'PRIVATE',
	'SCHOOL',
	'HOSPITAL',
	'MARKET',
	'OFFICE',
	'RESIDENTIAL',
	'OTHER',
]);

export const ReportFormSchema = z.object({
	submitterName: z.string().min(2, 'Submitter name is required'),
	submitterEmail: z.string().email('Invalid email address').or(z.literal('')),
	submitterPhone: z
		.string()
		.min(10, 'Valid phone number is required')
		.or(z.literal('')),
	state: z.string().min(2, 'State is required'),
	lga: z.string().min(2, 'Local Government Area is required'),
	ward: z.string().or(z.literal('')),
	specificAddress: z.string().min(5, 'Specific address is required'),
	coordinates: z.string().or(z.literal('')),
	imageFiles: z.array(z.any()).min(1, 'At least one image is required'),
	description: z.string().or(z.literal('')),
	toiletCondition: ToiletConditionEnum,
	facilityType: FacilityTypeEnum,
});

type ReportFormData = z.infer<typeof ReportFormSchema>;

// Mapping arrays for getting actual enum values from FormSelector indices
const toiletConditionValues = [
	'EXCELLENT',
	'GOOD',
	'FAIR',
	'POOR',
	'VERY_POOR',
];
const facilityTypeValues = [
	'PUBLIC',
	'PRIVATE',
	'SCHOOL',
	'HOSPITAL',
	'MARKET',
	'OFFICE',
	'RESIDENTIAL',
	'OTHER',
];

// Condition options for FormSelector (using indices as values)
const toiletConditionOptions = [
	{ value: '0', label: 'Excellent' },
	{ value: '1', label: 'Good' },
	{ value: '2', label: 'Fair' },
	{ value: '3', label: 'Poor' },
	{ value: '4', label: 'Very Poor' },
];

// Facility type options for FormSelector (using indices as values)
const facilityTypeOptions = [
	{ value: '0', label: 'Public' },
	{ value: '1', label: 'Private' },
	{ value: '2', label: 'School' },
	{ value: '3', label: 'Hospital' },
	{ value: '4', label: 'Market' },
	{ value: '5', label: 'Office' },
	{ value: '6', label: 'Residential' },
	{ value: '7', label: 'Other' },
];

const initialReportData: ReportFormData = {
	submitterName: '',
	submitterEmail: '',
	submitterPhone: '',
	state: '',
	lga: '',
	ward: '',
	specificAddress: '',
	coordinates: '',
	imageFiles: [],
	description: '',
	toiletCondition: 'FAIR',
	facilityType: 'PUBLIC',
};

function ReportForm() {
	const [formData, setFormData] = useState<ReportFormData>(initialReportData);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasConfirmed, setHasConfirmed] = useState(false);
	const [availableLGAs, setAvailableLGAs] = useState<string[]>([]);
	const [availableWards, setAvailableWards] = useState<
		Array<{ longitude: number; latitude: number; name: string }>
	>([]);

	const {
		validate,
		errors,
		touched,
		markAllTouched,
		validateAndTouch,
		clearErrors,
	} = useZodValidation(initialReportData);

	const handleInputChange = (
		field: keyof typeof formData,
		value: string | number | File[]
	) => {
		setFormData(prev => {
			const newData = { ...prev, [field]: value };

			validateAndTouch(ReportFormSchema, newData, field);
			return newData;
		});
	};

	// Convert states data to select options for FormSelector
	const stateOptions = useMemo(() => {
		return statesData.map(state => ({
			value: state.name,
			label: state.name,
		}));
	}, []);

	// LGA options based on selected state
	const lgaOptions = useMemo(() => {
		return availableLGAs.map((lga, i) => ({
			value: lga,
			label: lga,
			id: i.toString(),
		}));
	}, [availableLGAs]);

	// Ward options based on selected state and LGA
	const wardOptions = useMemo(() => {
		return availableWards.map((ward, i) => ({
			...ward,
			value: ward.name,
			label: ward.name,
			description: `Lat: ${ward.latitude}, Long: ${ward.longitude}`,
			id: i.toString(),
		}));
	}, [availableWards]);

	// Helper function to get current toilet condition index for FormSelector
	const getCurrentToiletConditionIndex = () => {
		const index = toiletConditionValues.indexOf(formData.toiletCondition);
		return index >= 0 ? index.toString() : '';
	};

	// Helper function to get current facility type index for FormSelector
	const getCurrentFacilityTypeIndex = () => {
		const index = facilityTypeValues.indexOf(formData.facilityType);
		return index >= 0 ? index.toString() : '';
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Mark all fields as touched for validation display
		markAllTouched();

		// Validate the entire form
		const validatedData = validate(ReportFormSchema, formData);

		if (!validatedData) {
			showToast.error('Please fix the errors in the form');
			return;
		}

		// Check confirmation checkbox
		if (!hasConfirmed) {
			showToast.error('Please confirm the accuracy of your information');
			return;
		}

		setIsSubmitting(true);

		try {
			let imageUrls: string[] = [];

			// Upload images to Backend API first
			if (validatedData.imageFiles && validatedData.imageFiles.length > 0) {
				showToast.loading('Uploading images...');

				try {
					const multipleUploadResult =
						await uploadService.uploadMultipleImages(
							validatedData.imageFiles as File[],
							(filename, progress) => {
								console.log(`${filename}: ${progress}%`);
							}
						);

					console.log('Upload result:', multipleUploadResult);

					if (!multipleUploadResult.success) {
						showToast.error('Some images failed to upload');
						return;
					}

					// ✅ Fixed: Use correct property name from backend response
					const uploadedImages = multipleUploadResult.data.images; // Changed from uploadedFiles to images
					imageUrls = uploadedImages.map(image => image.url);

					showToast.success(
						`Successfully uploaded ${imageUrls.length} image(s)!`
					);
				} catch (uploadError) {
					console.error('Image upload failed:', uploadError);
					showToast.error('Failed to upload images. Please try again.');
					return;
				}
			} else {
				showToast.error('At least one image is required');
				return;
			}

			// Prepare data with uploaded image URLs
			const submissionData = {
				submitterName: validatedData.submitterName,
				submitterEmail: validatedData.submitterEmail || undefined,
				submitterPhone: validatedData.submitterPhone || undefined,
				state: validatedData.state,
				lga: validatedData.lga,
				ward: validatedData.ward || undefined,
				specificAddress: validatedData.specificAddress,
				coordinates: validatedData.coordinates || undefined,
				description: validatedData.description || undefined,
				toiletCondition: validatedData.toiletCondition,
				facilityType: validatedData.facilityType,
				images: imageUrls, // Use uploaded URLs
			};

			showToast.loading('Submitting report...');

			// Submit using the report service
			const response = await reportService.createReport(submissionData);

			if (response.success) {
				showToast.success('Toilet report submitted successfully!');
				console.log('Report submitted:', response.data);

				// Reset form
				setFormData(initialReportData);
				setHasConfirmed(false);
				clearErrors();
				setAvailableLGAs([]);
				setAvailableWards([]);
			} else {
				throw new Error(response.message || 'Submission failed');
			}
		} catch (error) {
			console.error('Submission error:', error);

			if (error instanceof Error) {
				showToast.error(error.message);
			} else {
				showToast.error('Failed to submit report. Please try again.');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section
			className="py-30 bg-gray-50 relative overflow-hidden"
			id="contact"
		>
			{/* Content */}
			<div className="max-w-6xl mx-auto px-6 text-center relative z-10">
				<motion.p
					className="px-8 py-2 rounded-lg bg-blue-50 text-blue-500 w-fit mx-auto mb-5 "
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.24 }}
				>
					Report Form
				</motion.p>
				<h2 className="text-3xl md:text-6xl font-black text-gray-700 mb-4 font-space-grotesk tracking-tighter">
					Submit Toilet Report
				</h2>
				<p className="text-sm md:text-lg text-gray-500 mb-12">
					Help improve sanitation infrastructure across Nigeria by
					reporting toilet conditions in your area. Your report will help
					government agencies and organizations make data-driven
					improvements.
				</p>
				<form
					className="relative z-10 text-left max-w-6xl mx-auto"
					onSubmit={handleSubmit}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Left Column */}
						<div className="space-y-6">
							<FormInput
								label="Name"
								value={formData.submitterName}
								onChange={value =>
									handleInputChange('submitterName', value)
								}
								placeholder="Enter your first name"
								required
								error={errors.submitterName}
								touched={touched.submitterName}
							/>
							<FormInput
								label="Email Address"
								type="email"
								value={formData.submitterEmail}
								onChange={value =>
									handleInputChange('submitterEmail', value)
								}
								placeholder="your.email@example.com"
								error={errors.submitterEmail}
								touched={touched.submitterEmail}
							/>
							<FormInput
								label="Phone Number"
								type="tel"
								value={formData.submitterPhone}
								onChange={value =>
									handleInputChange('submitterPhone', value)
								}
								placeholder="+234 800 000 0000"
								error={errors.submitterPhone}
								touched={touched.submitterPhone}
							/>
							<FormSelector
								label="State"
								value={formData.state}
								onChange={value => {
									const selectedState = statesData[Number(value)];
									if (selectedState) {
										const lgas = selectedState.lgas;
										handleInputChange('state', selectedState.name);
										handleInputChange('lga', selectedState.name);
										handleInputChange('ward', selectedState.name);
										setAvailableLGAs(lgas);
										setAvailableWards([]);
									}
								}}
								options={stateOptions}
								placeholder="e.g. Lagos"
								searchable={true}
								error={errors.state}
								touched={touched.lga}
								required
							/>
							<FormSelector
								label="Local Government Area"
								value={formData.lga}
								onChange={value => {
									const selectedLga = lgaOptions[Number(value)]
										.label as keyof typeof wardsData;
									const stateWards = wardsData[selectedLga].wards;
									if (stateWards) {
										setAvailableWards(stateWards);
										handleInputChange('lga', selectedLga);
									}
								}}
								options={lgaOptions}
								placeholder="Select LGA"
								searchable={true}
								error={errors.lga}
								touched={touched.lga}
								required
								disabled={!formData.state}
							/>
							<FormSelector
								label="Ward"
								value={formData.ward}
								onChange={value => {
									const selectedWardData = wardOptions[Number(value)];
									if (selectedWardData) {
										handleInputChange('ward', selectedWardData.name);
										handleInputChange(
											'coordinates',
											`${selectedWardData.latitude},${selectedWardData.longitude}`
										);
									}
								}}
								options={wardOptions || []}
								placeholder="Select your ward (optional)"
								disabled={!formData.lga}
								error={errors.ward}
								touched={touched.ward}
								searchable={true}
							/>
						</div>

						{/* Right Column */}
						<div className="space-y-6">
							<FormInput
								label="Specific Address"
								value={formData.specificAddress}
								onChange={value =>
									handleInputChange('specificAddress', value)
								}
								placeholder="Street address, building name, or landmark"
								required
								error={errors.specificAddress}
								touched={touched.specificAddress}
							/>
							<FormSelector
								label="Toilet Condition"
								value={getCurrentToiletConditionIndex()}
								onChange={value => {
									const actualValue =
										toiletConditionValues[Number(value)];
									if (actualValue) {
										handleInputChange('toiletCondition', actualValue);
									}
								}}
								options={toiletConditionOptions}
								required
								placeholder="Select condition"
								error={errors.toiletCondition}
								touched={touched.toiletCondition}
							/>
							<FormSelector
								label="Facility Type"
								value={getCurrentFacilityTypeIndex()}
								onChange={value => {
									const actualValue =
										facilityTypeValues[Number(value)];
									if (actualValue) {
										handleInputChange('facilityType', actualValue);
									}
								}}
								options={facilityTypeOptions}
								required
								placeholder="Select facility type"
								error={errors.facilityType}
								touched={touched.facilityType}
							/>
							<FormInput
								label="Additional Description"
								type="textarea"
								value={formData.description}
								onChange={value =>
									handleInputChange('description', value)
								}
								placeholder="Any additional details about the toilet condition..."
								rows={3}
							/>
							<ImageUpload
								label="Images"
								files={formData.imageFiles}
								onChange={files =>
									handleInputChange('imageFiles', files)
								}
								maxImages={5}
								error={errors.imageFiles}
								touched={touched.imageFiles}
							/>
							<CheckboxOption
								checked={hasConfirmed}
								onChange={setHasConfirmed}
								className="mt-6"
								label="I confirm that the above information is accurate and complete to the best of my knowledge."
							/>
							{/* Submit Button */}
							<div className="flex ">
								<button
									type="submit"
									disabled={isSubmitting || !hasConfirmed}
									className="bg-gray-600 flex gap-2 hover:bg-gray-700 active:bg-gray-700 disabled:bg-gray-300 mt-3 disabled:cursor-not-allowed text-white font-semibold font-jakarta px-14 py-3 rounded-lg transition-colors duration-200 outline-none ring-2 ring-gray-500 ring-offset-2 cursor-pointer "
								>
									{isSubmitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}
									<Send className="size-6" />
								</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</section>
	);
}
export default ReportForm;
