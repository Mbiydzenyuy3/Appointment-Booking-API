import React from "react";
import { useCurrency } from "../../context/CurrencyContext.jsx";

export default function ServiceList({ services = [], onDelete }) {
  const { selectedCurrency, formatPrice } = useCurrency();

  // Get service icon based on service name
  // const getServiceIcon = (serviceName) => {
  //   const name = serviceName?.toLowerCase() || "";
  //   if (
  //     name.includes("hair") ||
  //     name.includes("cut") ||
  //     name.includes("style")
  //   ) {
  //     return "";
  //   } else if (name.includes("massage") || name.includes("spa")) {
  //     return "";
  //   } else if (name.includes("facial") || name.includes("skin")) {
  //     return "";
  //   } else if (
  //     name.includes("manicure") ||
  //     name.includes("pedicure") ||
  //     name.includes("nail")
  //   ) {
  //     return "";
  //   } else if (name.includes("consultation") || name.includes("advice")) {
  //     return "";
  //   } else if (name.includes("training") || name.includes("class")) {
  //     return "";
  //   } else if (name.includes("therapy") || name.includes("treatment")) {
  //     return "";
  //   } else {
  //     return "";
  //   }
  // };

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
          className='bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-4 sm:p-6 hover-lift'
        >
          <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'>
            {/* Service Details */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between mb-3'>
                <div className='flex items-start gap-3'>
                  {/* Service Icon */}
                  {/* <div className='flex-shrink-0 w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl'>
                    {getServiceIcon(service.name)}
                  </div> */}

                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      {service.name}
                    </h3>
                    <p className='text-sm text-gray-500 mt-1'>
                      Service ID: {service.service_id || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Price Badge */}
                <div className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium'>
                  {formatPrice(service.price, selectedCurrency)}
                </div>
              </div>

              {/* Service Description */}
              {service.description && (
                <p className='text-gray-600 mb-4 leading-relaxed'>
                  {service.description}
                </p>
              )}

              {/* Service Details */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600'>
                <div className='flex items-center gap-2'>
                  <svg
                    className='w-4 h-4 text-gray-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='font-medium'>Duration:</span>
                  <span>{service.duration || "N/A"} minutes</span>
                </div>

                {service.category && (
                  <div className='flex items-center gap-2'>
                    <svg
                      className='w-4 h-4 text-gray-400'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='font-medium'>Category:</span>
                    <span className='capitalize'>{service.category}</span>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              {(service.is_active !== undefined || service.max_clients) && (
                <div className='mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500'>
                  {service.is_active !== undefined && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        service.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <svg
                        className='w-3 h-3'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {service.is_active ? "Active" : "Inactive"}
                    </span>
                  )}

                  {service.max_clients && (
                    <span className='flex items-center gap-1'>
                      <svg
                        className='w-4 h-4'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' />
                      </svg>
                      Max {service.max_clients} clients
                    </span>
                  )}
                </div>
              )}

              {/* Service Notes */}
              {service.notes && (
                <div className='mt-3'>
                  <p className='text-sm text-gray-600 bg-gray-50 rounded-lg p-3'>
                    <span className='font-medium'>Notes:</span> {service.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className='flex flex-row sm:flex-col gap-2 sm:w-auto w-full'>
              <button
                onClick={() => onDelete(service.service_id)}
                className='flex-1 sm:flex-none btn btn-secondary text-sm px-4 py-2 touch-target hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200'
                aria-label={`Delete service ${service.name}`}
              >
                <svg
                  className='w-4 h-4 mr-1'
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
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
