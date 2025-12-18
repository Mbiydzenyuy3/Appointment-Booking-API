// Currency Selector Component
import React, { useState } from "react";
import { useCurrency } from "../../context/CurrencyContext.jsx";

export default function CurrencySelector() {
  const { selectedCurrency, userCurrency, currencies, changeCurrency } =
    useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Group currencies by region for better organization
  const groupedCurrencies = currencies.reduce((groups, currency) => {
    const region = currency.region;
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(currency);
    return groups;
  }, {});

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

  const handleCurrencySelect = (currencyCode) => {
    changeCurrency(currencyCode);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className='relative'>
      {/* Currency Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 min-w-[160px] justify-between'
        aria-label={`Current currency: ${selectedCurrencyData?.name}`}
      >
        <div className='flex items-center gap-2'>
          <span className='text-lg font-medium'>
            {selectedCurrencyData?.symbol}
          </span>
          <span className='text-sm font-medium text-gray-700'>
            {selectedCurrencyData?.code}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
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

      {/* Currency Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className='absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-hidden'>
            {/* Search Input */}
            <div className='p-3 border-b border-gray-100'>
              <input
                type='text'
                placeholder='Search currencies...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500'
                autoFocus
              />
            </div>

            {/* Currency List */}
            <div className='max-h-64 overflow-y-auto'>
              {searchTerm ? (
                // Filtered Results
                <div>
                  {filteredCurrencies.length > 0 ? (
                    filteredCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => handleCurrencySelect(currency.code)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors ${
                          currency.code === selectedCurrency
                            ? "bg-green-50 border-r-2 border-green-500"
                            : ""
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <span className='text-lg font-medium text-gray-800 min-w-[60px]'>
                            {currency.symbol}
                          </span>
                          <div>
                            <div className='font-medium text-gray-900'>
                              {currency.code}
                            </div>
                            <div className='text-sm text-gray-500 truncate'>
                              {currency.name}
                            </div>
                          </div>
                        </div>
                        <div className='text-xs text-gray-400'>
                          {currency.region}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className='px-4 py-6 text-center text-gray-500'>
                      No currencies found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              ) : (
                // Grouped by Region
                <div>
                  {/* Show user's detected currency first if different */}
                  {userCurrency && userCurrency !== selectedCurrency && (
                    <div className='border-b border-gray-100'>
                      <div className='px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Recommended for you
                      </div>
                      {(() => {
                        const userCurrencyData = currencies.find(
                          (c) => c.code === userCurrency
                        );
                        return userCurrencyData ? (
                          <button
                            onClick={() => handleCurrencySelect(userCurrency)}
                            className='w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between border-l-4 border-blue-400'
                          >
                            <div className='flex items-center gap-3'>
                              <span className='text-lg font-medium text-gray-800 min-w-[60px]'>
                                {userCurrencyData.symbol}
                              </span>
                              <div>
                                <div className='font-medium text-gray-900'>
                                  {userCurrencyData.code}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  {userCurrencyData.name}
                                </div>
                              </div>
                            </div>
                            <span className='text-xs text-blue-600 font-medium'>
                              Detected
                            </span>
                          </button>
                        ) : null;
                      })()}
                    </div>
                  )}

                  {/* Regional Groups */}
                  {Object.entries(groupedCurrencies).map(
                    ([region, regionCurrencies]) => (
                      <div
                        key={region}
                        className='border-b border-gray-100 last:border-b-0'
                      >
                        <div className='px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          {region}
                        </div>
                        {regionCurrencies
                          .sort((a, b) => {
                            // Prioritize FCFA and other African currencies
                            if (a.code === "XAF") return -1;
                            if (b.code === "XAF") return 1;
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
                            return a.name.localeCompare(b.name);
                          })
                          .map((currency) => (
                            <button
                              key={currency.code}
                              onClick={() =>
                                handleCurrencySelect(currency.code)
                              }
                              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors ${
                                currency.code === selectedCurrency
                                  ? "bg-green-50 border-r-2 border-green-500"
                                  : ""
                              }`}
                            >
                              <div className='flex items-center gap-3'>
                                <span className='text-lg font-medium text-gray-800 min-w-[60px]'>
                                  {currency.symbol}
                                </span>
                                <div>
                                  <div className='font-medium text-gray-900'>
                                    {currency.code}
                                  </div>
                                  <div className='text-sm text-gray-500 truncate'>
                                    {currency.name}
                                  </div>
                                </div>
                              </div>
                              <div className='text-xs text-gray-400'>
                                {currency.countries.slice(0, 2).join(", ")}
                                {currency.countries.length > 2 && "..."}
                              </div>
                            </button>
                          ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='p-3 border-t border-gray-100 bg-gray-50'>
              <div className='text-xs text-gray-500 text-center'>
                Currency selection affects pricing display only
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
