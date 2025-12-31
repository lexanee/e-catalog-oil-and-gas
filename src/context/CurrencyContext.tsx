import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Currency = "IDR" | "USD";

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  formatMoney: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem("currency");
    return (saved as Currency) || "IDR";
  });

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "IDR" ? "USD" : "IDR"));
  };

  const formatMoney = (amount: number) => {
    if (currency === "USD") {
      // Simple static rate for demo purposes: 1 USD = 15,000 IDR
      const usdAmount = amount / 15000;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(usdAmount);
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, formatMoney }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
