import { CURRENCY_SYMBOLS } from './constants';

export const formatCurrency = (amount: number, currency: string): string => {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
