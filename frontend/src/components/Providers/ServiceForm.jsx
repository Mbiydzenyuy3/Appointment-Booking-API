import React, { useState } from "react";
import { useCurrency } from "../../context/CurrencyContext.jsx";
import CurrencySelector from "../Common/CurrencySelector.jsx";

export default function ServiceForm({ onCreate }) {
  const { selectedCurrency, formatPrice } = useCurrency();
  const [service, setService] = useState({
    service_name: "",
    description: "",
    duration_minutes: "",
    price: ""
  });

  const handleChange = (e) => {
    setService({ ...service, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const ServiceValues = {
      name: service.service_name,
      description: service.description,
      price: Number(service.price),
      currency: selectedCurrency,
      durationMinutes: Number(service.duration_minutes)
    };

    onCreate(ServiceValues);

    setService({
      service_name: "",
      description: "",
      price: "",
      duration_minutes: ""
    });
  };

  // Get currency symbols for the different countries, not all but majority of the worlds currencies to make the app more inclusive to all users
  const getCurrencySymbol = (currency) => {
    const symbols = {
      XAF: "FCFA",
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      CHF: "CHF",
      CNY: "¥",
      INR: "₹",
      BRL: "R$",
      MXN: "$",
      SGD: "S$",
      HKD: "HK$",
      NZD: "NZ$",
      SEK: "kr",
      NOK: "kr",
      DKK: "kr",
      PLN: "zł",
      CZK: "Kč",
      HUF: "Ft",
      RUB: "₽",
      KRW: "₩",
      THB: "฿",
      MYR: "RM",
      IDR: "Rp",
      PHP: "₱",
      AED: "د.إ",
      SAR: "﷼",
      ILS: "₪",
      TRY: "₺",
      CLP: "$",
      COP: "$",
      PEN: "S/",
      ARS: "$",
      NGN: "₦",
      EGP: "E£",
      ZAR: "R",
      KES: "KSh",
      GHS: "₵",
      XOF: "CFA",
      MAD: "MAD"
    };
    return symbols[currency] || "$";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='relative bg-white p-6 shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-shadow duration-300'
      style={{ zIndex: 10 }}
    >
      <div className='mb-6'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
          <div>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>
              Add a Service
            </h2>
            <p className='text-gray-600 text-sm'>
              Create a new service offering for your clients
            </p>
          </div>
          <div className='flex-shrink-0'>
            <CurrencySelector />
          </div>
        </div>
      </div>

      <div className='space-y-5 mb-8'>
        <div>
          <label
            htmlFor='service_name'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Service Name *
          </label>
          <input
            id='service_name'
            type='text'
            name='service_name'
            value={service.service_name}
            onChange={handleChange}
            placeholder='Enter service name (e.g., Haircut, Consultation)'
            className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-base'
            required
            autoComplete='off'
          />
        </div>

        <div>
          <label
            htmlFor='description'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Description *
          </label>
          <textarea
            id='description'
            name='description'
            value={service.description}
            onChange={handleChange}
            placeholder='Describe what your service includes...'
            rows={4}
            className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 resize-vertical text-base'
            required
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div>
            <label
              htmlFor='price'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Price ({selectedCurrency}) *
            </label>
            <div className='relative'>
              <span className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium'>
                {getCurrencySymbol(selectedCurrency)}
              </span>
              <input
                id='price'
                type='number'
                name='price'
                value={service.price}
                onChange={handleChange}
                placeholder='0.00'
                min='0'
                step='0.01'
                className='block w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-base'
                required
              />
            </div>
            {service.price && (
              <p className='text-xs text-gray-500 mt-1'>
                Preview:{" "}
                {formatPrice(Number(service.price) || 0, selectedCurrency)}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='duration_minutes'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Duration (minutes) *
            </label>
            <input
              id='duration_minutes'
              type='number'
              name='duration_minutes'
              value={service.duration_minutes}
              onChange={handleChange}
              placeholder='30'
              min='1'
              max='480'
              className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-base'
              required
            />
          </div>
        </div>
      </div>

      <div className='relative'>
        <button
          type='submit'
          className='form-submit-button w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2 min-h-[64px] touch-target transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border-2 border-transparent hover:border-green-800'
          style={{
            position: "relative",
            zIndex: 9999,
            visibility: "visible",
            opacity: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
            backgroundColor: "#16a34a",
            color: "white"
          }}
          aria-label='Create new service'
        >
          <span className='flex items-center justify-center gap-3 text-lg'>
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              strokeWidth='2'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M12 4v16m8-8H4'
              />
            </svg>
            Add A Service
          </span>
        </button>
      </div>
    </form>
  );
}
