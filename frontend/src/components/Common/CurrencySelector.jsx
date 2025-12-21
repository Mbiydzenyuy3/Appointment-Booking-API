import React, { useState, useRef, useEffect } from "react";
import { useCurrency } from "../../context/CurrencyContext.jsx";

export default function CurrencySelector() {
  const { selectedCurrency, currencies, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Filter currencies based on search term
  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCurrencyData = currencies.find(
    (c) => c.code === selectedCurrency
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCurrencySelect = (currencyCode) => {
    changeCurrency(currencyCode);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 min-w-[140px] justify-between shadow-sm'
        aria-label={`Current currency: ${selectedCurrencyData?.name}`}
      >
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 text-sm font-bold'>
            {selectedCurrencyData?.symbol.substring(0, 2)}
          </div>
          <span className='text-sm font-semibold text-gray-800'>
            {selectedCurrencyData?.code}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute top-36 mt-2 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden backdrop-blur-sm'>
          {/* Header */}
          <div className='p-4 border-b border-gray-100 bg-gray-50'>
            <h3 className='text-sm font-semibold text-gray-800 mb-3'>
              Select Currency
            </h3>
            <input
              type='text'
              placeholder='Search currencies...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full text-gray-800 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-colors'
              autoFocus
            />
          </div>

          {/* Currency List */}
          <div className='max-h-64 overflow-y-auto'>
            {searchTerm ? (
              <div>
                {filteredCurrencies.length > 0 ? (
                  filteredCurrencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencySelect(currency.code)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                        currency.code === selectedCurrency
                          ? "bg-gray-50 border-r-4 border-gray-400"
                          : ""
                      }`}
                    >
                      <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 text-xs font-bold'>
                        {currency.symbol.substring(0, 2)}
                      </div>
                      <div className='flex-1'>
                        <div className='font-semibold text-gray-900'>
                          {currency.code}
                        </div>
                        <div className='text-sm text-gray-500 truncate'>
                          {currency.name}
                        </div>
                      </div>
                      {currency.code === selectedCurrency && (
                        <svg
                          className='w-4 h-4 text-gray-600'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                            clipRule='evenodd'
                          />
                        </svg>
                      )}
                    </button>
                  ))
                ) : (
                  <div className='px-4 py-8 text-center text-gray-500'>
                    <div className='text-2xl mb-2'>🔍</div>
                    <div className='text-sm'>
                      No currencies found matching "{searchTerm}"
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Clean currency list without duplication
              <div className='py-2'>
                {/* Prioritize XAF and African currencies */}
                <div className='space-y-1'>
                  {currencies
                    .sort((a, b) => {
                      // Prioritize XAF first
                      if (a.code === "XAF") return -1;
                      if (b.code === "XAF") return 1;
                      // Then African currencies
                      if (
                        a.region.includes("Africa") &&
                        !b.region.includes("Africa")
                      )
                        return -1;
                      if (
                        b.region.includes("Africa") &&
                        !a.region.includes("Africa")
                      )
                        return 1;
                      // Then by name
                      return a.name.localeCompare(b.name);
                    })
                    .map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => handleCurrencySelect(currency.code)}
                        className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                          currency.code === selectedCurrency
                            ? "bg-gray-50 border-r-4 border-gray-400"
                            : ""
                        }`}
                      >
                        <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 text-xs font-bold'>
                          {currency.symbol.substring(0, 2)}
                        </div>
                        <div className='flex-1'>
                          <div className='font-medium text-gray-900'>
                            {currency.code}
                          </div>
                          <div className='text-sm text-gray-500 truncate'>
                            {currency.name}
                          </div>
                        </div>
                        {currency.code === selectedCurrency && (
                          <svg
                            className='w-4 h-4 text-gray-600'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='p-3 border-t border-gray-100 bg-gray-50'>
            <div className='text-xs text-gray-500 text-center flex items-center justify-center gap-1'>
              <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
              Currency selection affects all pricing
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
