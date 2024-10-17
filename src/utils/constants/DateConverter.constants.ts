import { subMinutes, subHours, subDays, subWeeks, subMonths, subYears } from 'date-fns';

export const getStartDateFromRange = (range: string): Date => {
	const now = new Date();
	switch (range) {
		case 'now-5m':
			return subMinutes(now, 5);
		case 'now-1h':
			return subHours(now, 1);
		case 'now-1d':
			return subDays(now, 1);
		case 'now-1w':
			return subWeeks(now, 1);
		case 'now-1M':
			return subMonths(now, 1);
		case 'now-6M':
			return subMonths(now, 6);
		case 'now-1y':
			return subYears(now, 1);
		case 'now-5y':
			return subYears(now, 5);
		default:
			return now;
	}
};
