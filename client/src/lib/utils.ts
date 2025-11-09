import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const numberWithCommas = (value: number | undefined | null): string => {
	if (value === null || value === undefined || isNaN(value)) {
		return '00';
	}

	// For single digit WHOLE numbers (0-9), add leading zero
	if (Number.isInteger(value) && value >= 0 && value <= 9) {
		return `0${value}`;
	}

	// For all other numbers (including decimals), use toLocaleString
	return value.toLocaleString();
};
