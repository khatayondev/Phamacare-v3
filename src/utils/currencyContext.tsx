import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const AVAILABLE_CURRENCIES: Currency[] = [
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi (₵)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling (KSh)' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc (CFA)' },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Load currency from localStorage or default to Cedis
    const saved = localStorage.getItem('pharmacare_currency');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return AVAILABLE_CURRENCIES[0]; // Default to Cedis
      }
    }
    return AVAILABLE_CURRENCIES[0]; // Default to Cedis
  });

  // Save to localStorage whenever currency changes
  useEffect(() => {
    localStorage.setItem('pharmacare_currency', JSON.stringify(currency));
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const formatAmount = (amount: number): string => {
    return `${currency.symbol}${amount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
