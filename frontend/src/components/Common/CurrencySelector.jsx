import React from "react";
import { useCurrency } from "../../context/CurrencyContext.jsx";

const CurrencySelector = ({ className = "", showSymbol = true }) => {
  const { selectedCurrency, setSelectedCurrency, currencies } = useCurrency();

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
  };

  return (
    <div className={`currency-selector ${className}`}>
      <select
        value={selectedCurrency}
        onChange={handleCurrencyChange}
        className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        aria-label='Select currency'
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {showSymbol ? `${currency.symbol} ` : ""}
            {currency.code} - {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
