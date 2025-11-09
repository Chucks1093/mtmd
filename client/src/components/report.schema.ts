import { z } from 'zod';

// Enums matching backend
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

// Form validation schema
export const toiletReportFormSchema = z.object({
	submitterName: z.string().min(2, 'Submitter name is required'),
	submitterEmail: z
		.string()
		.email('Invalid email address')
		.optional()
		.or(z.literal('')),
	submitterPhone: z
		.string()
		.min(10, 'Valid phone number is required')
		.optional()
		.or(z.literal('')),
	state: z.string().min(2, 'State is required'),
	lga: z.string().min(2, 'Local Government Area is required'),
	ward: z.string().optional().or(z.literal('')),
	specificAddress: z.string().min(5, 'Specific address is required'),
	coordinates: z.string().optional().or(z.literal('')),
	images: z.array(z.string()).min(1, 'At least one image is required'),
	description: z.string().optional().or(z.literal('')),
	toiletCondition: ToiletConditionEnum,
	facilityType: FacilityTypeEnum,
});

export type ToiletReportFormData = z.infer<typeof toiletReportFormSchema>;

// Initial form data
export const initialToiletReportData: ToiletReportFormData = {
	submitterName: '',
	submitterEmail: '',
	submitterPhone: '',
	state: '',
	lga: '',
	ward: '',
	specificAddress: '',
	coordinates: '',
	images: [],
	description: '',
	toiletCondition: 'FAIR',
	facilityType: 'PUBLIC',
};

// Helper types for the data
export interface StateData {
	code: string;
	name: string;
	lgas: string[];
}

export interface WardData {
	State: string;
	LGA: string;
	Ward: string;
	Latitude: number;
	Longitude: number;
}

// Condition options for select
export const toiletConditionOptions = [
	{ value: 'EXCELLENT', label: 'Excellent' },
	{ value: 'GOOD', label: 'Good' },
	{ value: 'FAIR', label: 'Fair' },
	{ value: 'POOR', label: 'Poor' },
	{ value: 'VERY_POOR', label: 'Very Poor' },
] as const;

// Facility type options for select
export const facilityTypeOptions = [
	{ value: 'PUBLIC', label: 'Public' },
	{ value: 'PRIVATE', label: 'Private' },
	{ value: 'SCHOOL', label: 'School' },
	{ value: 'HOSPITAL', label: 'Hospital' },
	{ value: 'MARKET', label: 'Market' },
	{ value: 'OFFICE', label: 'Office' },
	{ value: 'RESIDENTIAL', label: 'Residential' },
	{ value: 'OTHER', label: 'Other' },
] as const;
