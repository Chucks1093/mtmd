import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats an ISO date string to a readable format: 'DD MMM YYYY'
 *
 * @param isoString - The ISO date string to format (e.g., "2024-08-11T10:30:00.000Z")
 * @returns Formatted date string in single quotes (e.g., "'11 Aug 2024'") or "'Invalid Date'" if parsing fails
 *
 * @example
 * ```typescript
 * formatDate("2024-08-11T10:30:00.000Z") // "'11 Aug 2024'"
 * formatDate("2024-12-25T00:00:00.000Z") // "'25 Dec 2024'"
 * formatDate("invalid-date") // "'Invalid Date'"
 * formatDate("") // "'Invalid Date'"
 * ```
 *
 * @since 1.0.0
 */
export const formatDate = (isoString: string): string => {
	try {
		// Handle empty or null-like strings
		if (
			!isoString ||
			typeof isoString !== 'string' ||
			isoString.trim() === ''
		) {
			return "'Invalid Date'";
		}

		const date = parseISO(isoString.trim());

		if (!isValid(date)) {
			return "'Invalid Date'";
		}

		const formatted = format(date, 'd MMM yyyy');
		return formatted;
	} catch (error) {
		// Log error for debugging in development
		if (process.env.NODE_ENV === 'development') {
			console.warn('Date formatting error:', error);
		}

		return 'Invalid Date';
	}
};
