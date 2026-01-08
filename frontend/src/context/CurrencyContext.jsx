import { X } from "lucide-react";
import React, { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("XAF");
  const [exchangeRates, setExchangeRates] = useState({
    XAF: 550,
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    JPY: 110,
    CAD: 1.25,
    AUD: 1.35
  });

  // Available currencies
  const currencies = [
    { code: "XAF", symbol: "FCFA", name: "Central African CFA Franc" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" }
  ];

  // Format price with selected currency
  const formatPrice = (price, currency = null) => {
    const targetCurrency = currency || selectedCurrency;
    const currencyInfo = currencies.find((c) => c.code === targetCurrency);

    if (!currencyInfo) return `${price}`;

    const convertedPrice = price * exchangeRates[targetCurrency];
    return `${currencyInfo.symbol}${convertedPrice.toFixed(2)}`;
  };

  // Convert price between currencies
  const convertPrice = (price, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return price;

    const priceInUSD = price / exchangeRates[fromCurrency];
    return priceInUSD * exchangeRates[toCurrency];
  };

  // Get currency symbol
  const getCurrencySymbol = (currency = null) => {
    const targetCurrency = currency || selectedCurrency;
    const currencyInfo = currencies.find((c) => c.code === targetCurrency);
    return currencyInfo ? currencyInfo.symbol : "$";
  };

  // Update exchange rates (mock implementation)
  const updateExchangeRates = async () => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll use static rates
      setExchangeRates({
        XAF: 550,
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110,
        CAD: 1.25,
        AUD: 1.35
      });
    } catch (error) {
      console.error("Error updating exchange rates:", error);
    }
  };

  useEffect(() => {
    updateExchangeRates();
    // Update rates every hour
    const interval = setInterval(updateExchangeRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    selectedCurrency,
    setSelectedCurrency,
    currencies,
    exchangeRates,
    formatPrice,
    convertPrice,
    getCurrencySymbol,
    updateExchangeRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
