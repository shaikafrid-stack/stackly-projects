import { DateRange } from '../types';

export const getStartDate = (range: DateRange): Date | null => {
  const now = new Date();
  switch (range) {
    case 'week': {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case 'month': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return d;
    }
    case 'year': {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return d;
    }
    default:
      return null;
  }
};

export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const toYearMonth = (iso: string): string => iso.slice(0, 7);

export const getMonthLabel = (ym: string): string => {
  const [year, month] = ym.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1);
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
};

export const getLast12Months = (): string[] => {
  const months: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    );
  }
  return months;
};

export const getLast6Months = (): string[] => getLast12Months().slice(6);

export const getDayOfWeek = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long' });
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
