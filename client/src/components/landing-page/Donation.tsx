import React, { useMemo, useState } from 'react';
import { Heart } from 'lucide-react';
import { z } from 'zod';
import { useZodValidation } from '@/hooks/useZodValidation';
import FormInput from '@/components/shared/FormInput';
import FormSelector, {
	type SelectOption,
} from '@/components/shared/FormSelector';
import showToast from '@/utils/toast.util';
import CircularSpinner from '@/components/common/CircularSpinnerProps';
import donationService, {
	type CreateDonationRequest,
	ApiError,
} from '@/services/donation.service';
import statesData from '@/data/state-lga.json';
import wardsData from '@/data/wards_new.json';

// Updated Donation validation schema to match the service
export const DonationSchema = z.object({
	amount: z
		.string()
		.min(1, 'Amount is required')
		.refine(
			val => !isNaN(Number(val)) && Number(val) >= 500,
			'Minimum donation amount is ₦500'
		),
	donorName: z.string().min(2, 'Full name is required'),
	donorEmail: z.email('Please enter a valid email address'),
	donorPhone: z.string().optional(),
	type: z.enum(['ONE_TIME', 'MONTHLY', 'ANNUAL']).default('ONE_TIME'),
	message: z.string().optional(),
	isAnonymous: z.boolean().default(false),
	state: z.string().min(2, 'State is required'),
	lga: z.string().min(2, 'Local Government Area is required'),
	ward: z.string().or(z.literal('')),
	coordinates: z.string().or(z.literal('')),
});

type DonationFormData = z.infer<typeof DonationSchema>;

const donationTypeOptions: SelectOption[] = [
	{
		value: '0',
		label: 'One-time Donation',
		description: 'Make a single donation',
	},
	{
		value: '1',
		label: 'Monthly Donation',
		description: 'Recurring monthly support',
	},
	{ value: '2', label: 'Annual Donation', description: 'Yearly contribution' },
];

const donationTypeValues = ['ONE_TIME', 'MONTHLY', 'ANNUAL'] as const;

const initialDonationData: DonationFormData = {
	amount: '',
	donorName: '',
	donorEmail: '',
	donorPhone: '',
	type: 'ONE_TIME',
	message: '',
	isAnonymous: false,
	state: '',
	lga: '',
	coordinates: '',
	ward: '',
};

// Quick amount selection buttons
const quickAmounts = [500, 1000, 2500, 5000, 10000, 25000];

const Donation: React.FC = () => {
	const [formData, setFormData] =
		useState<DonationFormData>(initialDonationData);
	const [isSubmitting, setIsSubmitting] = useState(false);
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
	} = useZodValidation(initialDonationData);

	const handleInputChange = (
		field: keyof DonationFormData,
		value: string | boolean
	) => {
		setFormData(prev => {
			const newData = { ...prev, [field]: value };
			validateAndTouch(DonationSchema, newData, field);
			return newData;
		});
	};

	const handleQuickAmountSelect = (amount: number) => {
		handleInputChange('amount', amount.toString());
	};

	const getCurrentDonationTypeIndex = () => {
		const index = donationTypeValues.indexOf(formData.type);
		return index.toString();
	};

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		markAllTouched();

		const validatedData = validate(DonationSchema, formData);
		if (!validatedData) {
			showToast.error('Please fix the errors in the form');
			return;
		}

		try {
			setIsSubmitting(true);
			showToast.loading('Processing donation...');

			// Prepare donation data according to service interface
			const donationData: CreateDonationRequest = {
				donorName: validatedData.donorName,
				donorEmail: validatedData.donorEmail,
				donorPhone: validatedData.donorPhone,
				amount: Number(validatedData.amount),
				currency: 'NGN',
				type: validatedData.type,
				message: validatedData.message,
				isAnonymous: validatedData.isAnonymous,
				state: validatedData.state,
				lga: validatedData.lga,
				callbackUrl: `${window.location.origin}/donation/callback`,
			};
			console.log(donationData);

			const result = await donationService.createDonation(donationData);

			if (result.success && result.data) {
				showToast.success(
					'Donation initiated successfully! Redirecting to payment...'
				);

				// Reset form
				setFormData(initialDonationData);
				clearErrors();

				// Redirect to Paystack payment page
				window.location.href = result.data.payment.authorization_url;
			} else {
				showToast.error('Failed to process donation. Please try again.');
			}
		} catch (error) {
			console.error('Error processing donation:', error);
			if (error instanceof ApiError) {
				showToast.error(error.message);
			} else {
				showToast.error('An error occurred. Please try again.');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className=" my-[4rem] px-4" id="donation">
			<div className="max-w-6xl mx-auto flex flex-col items-center bg-white">
				{/* Section Header */}
				<div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium ">
					<Heart className="w-4 h-4" />
					Support a Ward
				</div>
				<h1 className="text-gray-700 tracking-tight font-space-grotesk text-[1.8rem] md:text-[3rem] font-semibold mt-2 text-center">
					Make A Donation
				</h1>
				<p className="text-gray-600 text-md md:text-lg mt-2 text-center max-w-2xl">
					Your generous contributions directly fund the maintenance and
					improvement of public toilet facilities.
				</p>

				<div className="grid lg:grid-cols-2 gap-12 items-start mt-8 w-full">
					{/* Impact Cards */}
					<div className="space-y-6 p-8 shadow-sm border border-gray-100  rounded-xl">
						{/* Quick Amount Selection */}
						<div className="bg-white  ">
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Select Amount <span className="text-red-500">*</span>
							</label>
							<div className="grid grid-cols-3 gap-4 mb-4">
								{quickAmounts.map(amount => (
									<button
										key={amount}
										type="button"
										onClick={() => handleQuickAmountSelect(amount)}
										className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors cursor-pointer ${
											formData.amount === amount.toString()
												? 'border-green-600 bg-green-50 text-green-700'
												: 'border-gray-200 text-gray-700 hover:border-gray-300'
										}`}
									>
										₦{amount.toLocaleString()}
									</button>
								))}
							</div>
						</div>
						<FormInput
							label="Custom Amount (₦)"
							value={formData.amount}
							onChange={value => handleInputChange('amount', value)}
							placeholder="Enter amount"
							type="number"
							required
							error={errors.amount}
							touched={touched.amount}
							disabled={isSubmitting}
						/>
						<FormSelector
							label="Donation Type"
							value={getCurrentDonationTypeIndex()}
							onChange={value => {
								const actualValue = donationTypeValues[Number(value)];
								if (actualValue) handleInputChange('type', actualValue);
							}}
							options={donationTypeOptions}
							required
							placeholder="Select donation type"
							disabled={isSubmitting}
							searchable={false}
						/>
						{/* Optional Message */}
						<FormInput
							label="Message (Optional)"
							value={formData.message || ''}
							onChange={value => handleInputChange('message', value)}
							placeholder="Leave a message of support..."
							type="textarea"
							rows={3}
							disabled={isSubmitting}
						/>
					</div>

					{/* Donation Form */}
					<div className="space-y-6">
						<div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Donation Type */}

								{/* Personal Information */}
								<div className=" pt-2">
									<div className="space-y-4">
										<FormInput
											label="Full Name"
											value={formData.donorName}
											onChange={value =>
												handleInputChange('donorName', value)
											}
											placeholder="Enter your full name"
											required
											error={errors.donorName}
											touched={touched.donorName}
											disabled={isSubmitting}
										/>

										<FormInput
											label="Email Address"
											value={formData.donorEmail}
											onChange={value =>
												handleInputChange('donorEmail', value)
											}
											placeholder="Enter your email address"
											type="email"
											required
											error={errors.donorEmail}
											touched={touched.donorEmail}
											disabled={isSubmitting}
										/>

										<FormInput
											label="Phone Number (Optional)"
											value={formData.donorPhone || ''}
											onChange={value =>
												handleInputChange('donorPhone', value)
											}
											placeholder="Enter your phone number"
											type="tel"
											error={errors.donorPhone}
											touched={touched.donorPhone}
											disabled={isSubmitting}
										/>
										<FormSelector
											label="State"
											value={formData.state}
											onChange={value => {
												const selectedState =
													statesData[Number(value)];
												if (selectedState) {
													const lgas = selectedState.lgas;
													handleInputChange(
														'state',
														selectedState.name
													);
													handleInputChange(
														'lga',
														selectedState.name
													);
													handleInputChange(
														'ward',
														selectedState.name
													);
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
												const selectedLga = lgaOptions[
													Number(value)
												].label as keyof typeof wardsData;
												const stateWards =
													wardsData[selectedLga].wards;
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
												const selectedWardData =
													wardOptions[Number(value)];
												if (selectedWardData) {
													handleInputChange(
														'ward',
														selectedWardData.name
													);
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
								</div>

								{/* Anonymous Option */}
								<div className="flex items-center space-x-3">
									<input
										type="checkbox"
										id="isAnonymous"
										checked={formData.isAnonymous}
										onChange={e =>
											handleInputChange(
												'isAnonymous',
												e.target.checked
											)
										}
										disabled={isSubmitting}
										className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
									/>
									<label
										htmlFor="isAnonymous"
										className="text-sm text-gray-700"
									>
										Make this donation anonymous
									</label>
								</div>

								{/* Submit Button */}
								<button
									type="submit"
									disabled={
										isSubmitting ||
										!formData.donorName ||
										!formData.donorEmail ||
										!formData.amount
									}
									className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg"
								>
									{isSubmitting ? (
										<>
											<CircularSpinner
												size={20}
												className="text-white"
											/>
											Processing...
										</>
									) : (
										<>
											<Heart className="w-5 h-5" />
											Donate ₦
											{formData.amount
												? Number(formData.amount).toLocaleString()
												: '0'}
										</>
									)}
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Donation;
