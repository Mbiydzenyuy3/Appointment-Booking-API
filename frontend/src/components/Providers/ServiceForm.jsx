import React, { useState } from "react";
import { useCurrency } from "../../context/CurrencyContext.jsx";
import CurrencySelector from "../Common/CurrencySelector.jsx";

export default function ServiceForm({
  onCreate,
  onUpdate,
  editingService,
  onCancelEdit
}) {
  const { selectedCurrency, formatPrice } = useCurrency();
  const [service, setService] = useState({
    service_name: "",
    description: "",
    duration_minutes: "",
    price: "",
    location: "",
    additional_description: "",
    image_url: ""
  });

  // Populate form when editing
  React.useEffect(() => {
    if (editingService) {
      setService({
        service_name: editingService.name || "",
        description: editingService.description || "",
        duration_minutes: editingService.duration || "",
        price: editingService.price || "",
        location: editingService.location || "",
        additional_description: editingService.additional_description || "",
        image_url: editingService.image_url || ""
      });
    } else {
      // Reset form when not editing
      setService({
        service_name: "",
        description: "",
        duration_minutes: "",
        price: "",
        location: "",
        additional_description: "",
        image_url: ""
      });
    }
  }, [editingService]);

  const handleChange = (e) => {
    setService({ ...service, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const ServiceValues = {
      name: service.service_name,
      description: service.description,
      price: Number(service.price),
      durationMinutes: Number(service.duration_minutes),
      location: service.location,
      additionalDescription: service.additional_description,
      imageUrl: service.image_url
    };

    console.log("Service data being sent:", ServiceValues);

    if (editingService) {
      onUpdate(editingService.service_id, ServiceValues);
    } else {
      onCreate(ServiceValues);
      // Reset form only when creating
      setService({
        service_name: "",
        description: "",
        price: "",
        duration_minutes: "",
        location: "",
        additional_description: "",
        image_url: ""
      });
    }
  };

  const handleCancel = () => {
    if (onCancelEdit) {
      onCancelEdit();
    }
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
              {editingService ? "Edit Service" : "Add a Service"}
            </h2>
            <p className='text-gray-600 text-sm'>
              {editingService
                ? "Update your service details"
                : "Create a new service offering for your clients"}
            </p>
          </div>
          <div className='flex-shrink-0 text-gray-700'>
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
            Service Name
          </label>
          <input
            id='service_name'
            type='text'
            name='service_name'
            value={service.service_name}
            onChange={handleChange}
            placeholder='Enter service name (e.g., Haircut, Consultation)'
            className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400    transition-all duration-200 text-base'
            required
            autoComplete='off'
          />
        </div>

        <div>
          <label
            htmlFor='description'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Description
          </label>
          <textarea
            id='description'
            name='description'
            value={service.description}
            onChange={handleChange}
            placeholder='Describe what your service includes...'
            rows={4}
            className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400    transition-all duration-200 resize-vertical text-base'
            required
          />
        </div>

        <div>
          <label
            htmlFor='location'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Location
          </label>
          <input
            id='location'
            type='text'
            name='location'
            value={service.location}
            onChange={handleChange}
            placeholder='Enter your business location (e.g., 123 Main St, City)'
            className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400    transition-all duration-200 text-base'
            autoComplete='off'
          />
        </div>

        <div>
          <label
            htmlFor='additional_description'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Additional Description
          </label>
          <textarea
            id='additional_description'
            name='additional_description'
            value={service.additional_description}
            onChange={handleChange}
            placeholder='Additional details about your business or service...'
            rows={3}
            className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400    transition-all duration-200 resize-vertical text-base'
          />
        </div>

        <div>
          <label
            htmlFor='image_url'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Image URL (Logo or Business Place)
          </label>
          <input
            id='image_url'
            type='url'
            name='image_url'
            value={service.image_url}
            onChange={handleChange}
            placeholder='https://example.com/image.jpg'
            className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400    transition-all duration-200 text-base'
            autoComplete='off'
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div>
            <label
              htmlFor='price'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Price (in XAF)
            </label>
            <div className='relative'>
              <span className='absolute left-4 top-1/2 transform -translate-y-1/2 text-transparent font-medium'>
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
                className='block w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400    transition-all duration-200 text-base'
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
              Duration (minutes)
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
              className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400    transition-all duration-200 text-base'
              required
            />
          </div>
        </div>
      </div>

      <div className='relative'>
        {editingService && (
          <button
            type='button'
            onClick={handleCancel}
            className='w-full mb-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-xl transition-all duration-300 focus:outline-none min-h-[48px] touch-target'
            aria-label='Cancel editing'
          >
            <span className='flex items-center justify-center gap-3 text-base'>
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                strokeWidth='2'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
              Cancel
            </span>
          </button>
        )}
        <button
          type='submit'
          className='form-submit-button w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 focus:outline-none    min-h-[64px] touch-target transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border-2 border-transparent hover:border-green-800'
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
          aria-label={editingService ? "Update service" : "Create new service"}
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
                d={
                  editingService
                    ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    : "M12 4v16m8-8H4"
                }
              />
            </svg>
            {editingService ? "Update Service" : "Add A Service"}
          </span>
        </button>
      </div>
    </form>
  );
}
