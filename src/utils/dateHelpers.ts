import { format, parseISO, isValid, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid Date';
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid Date';
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const getDateRange = (range: 'today' | 'week' | 'month' | 'custom', customRange?: { from: Date; to: Date }) => {
  const now = new Date();
  
  switch (range) {
    case 'today':
      return {
        from: startOfDay(now),
        to: endOfDay(now),
      };
    case 'week':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
      };
    case 'custom':
      return customRange || { from: startOfDay(now), to: endOfDay(now) };
    default:
      return {
        from: startOfDay(now),
        to: endOfDay(now),
      };
  }
};

export const getRelativeDateLabel = (date: Date): string => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

export const isValidDateRange = (from: Date, to: Date): boolean => {
  return isValid(from) && isValid(to) && from <= to;
}; 