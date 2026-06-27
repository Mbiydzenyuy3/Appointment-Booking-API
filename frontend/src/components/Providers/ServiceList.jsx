import React from "react";
import { useCurrency } from "../../context/CurrencyContext.jsx";
import {
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return "N/A";
  const m = Number(minutes);
  if (isNaN(m) || m <= 0) return "N/A";
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem === 0 ? `${h} hr` : `${h} hr ${rem} min`;
  }
  return `${m} min`;
}

export default function ServiceList({ services = [], onDelete, onEdit }) {
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
                <CheckCircleIcon className='w-6 h-6 text-green-600' />
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-lg font-semibold text-gray-900 truncate'>
                  {service.name || service.service_name}
                </h3>
                <p className='text-sm text-gray-500'>
                  {formatDuration(service.duration ?? service.duration_minutes)} •{" "}
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
                  {formatDuration(service.duration ?? service.duration_minutes)}
                </div>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => onEdit(service)}
                  className='flex-shrink-0 w-10 h-10 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full flex items-center justify-center transition-colors duration-200'
                  aria-label={`Edit service ${service.name}`}
                >
                  <PencilIcon className='w-4 h-4' />
                </button>
                <button
                  onClick={() => onDelete(service.service_id)}
                  className='flex-shrink-0 w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-colors duration-200'
                  aria-label={`Delete service ${service.name}`}
                >
                  <TrashIcon className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>
          {service.location && (
            <div className='mt-3 flex items-center gap-2 text-sm text-gray-600'>
              <MapPinIcon className='w-4 h-4 text-gray-400' />
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
