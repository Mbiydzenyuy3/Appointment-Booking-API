import React from "react";
import { useCurrency } from "../../context/CurrencyContext.jsx";

export default function ServiceList({ services = [], onDelete }) {
  const { selectedCurrency, formatPrice } = useCurrency();

  if (!services || services.length === 0) {
    return (
      <div className='text-center py-8'>
        <div className='text-4xl mb-4'>📋</div>
        <p className='text-gray-500 mb-2'>No services created yet</p>
        <p className='text-sm text-gray-400'>
          Create your first service to get started.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {services.map((service, index) => (
        <div
          key={service.service_id || index}
          className='bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 p-6 relative overflow-hidden group'
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className='absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-blue-500'></div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4 flex-1 min-w-0'>
              <div className='flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-lg font-semibold text-gray-900 truncate'>
                  {service.name}
                </h3>
                <p className='text-sm text-gray-500'>
                  {service.duration || "N/A"} min •{" "}
                  {formatPrice(service.price, selectedCurrency)}
                </p>
                {service.description && (
                  <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                    {service.description}
                  </p>
                )}
              </div>
            </div>
            <div className='flex items-center gap-3 ml-4'>
              <div className='text-right'>
                <div className='text-lg font-bold text-green-600'>
                  {formatPrice(service.price, selectedCurrency)}
                </div>
                <div className='text-xs text-gray-500'>
                  {service.duration} min
                </div>
              </div>
              <button
                onClick={() => onDelete(service.service_id)}
                className='flex-shrink-0 w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-colors duration-200'
                aria-label={`Delete service ${service.name}`}
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                  />
                </svg>
              </button>
            </div>
          </div>
          {service.location && (
            <div className='mt-3 flex items-center gap-2 text-sm text-gray-600'>
              <svg
                className='w-4 h-4 text-gray-400'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                  clipRule='evenodd'
                />
              </svg>
              <span>{service.location}</span>
            </div>
          )}
          {service.image_url && (
            <div className='mt-3'>
              <img
                src={service.image_url}
                alt='Business image'
                className='w-20 h-20 object-cover rounded-lg'
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
