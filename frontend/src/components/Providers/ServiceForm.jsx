import React, { useState, useEffect } from "react";
import { useCurrency } from "../../context/CurrencyContext.jsx";
import CurrencySelector from "../Common/CurrencySelector.jsx";
import { XMarkIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline";

const REQUIRED = ["service_name", "price", "duration_minutes"];

const INITIAL = {
  service_name: "",
  description: "",
  duration_minutes: "",
  price: "",
  location: "",
  additional_description: "",
  image_url: ""
};

function validate(service) {
  const errors = {};
  if (!service.service_name.trim()) errors.service_name = "Service name is required";
  else if (service.service_name.trim().length < 3) errors.service_name = "Name must be at least 3 characters";

  const price = Number(service.price);
  if (service.price === "" || service.price === null) errors.price = "Price is required";
  else if (isNaN(price) || price <= 0) errors.price = "Price must be greater than 0";

  const dur = Number(service.duration_minutes);
  if (service.duration_minutes === "" || service.duration_minutes === null) errors.duration_minutes = "Duration is required";
  else if (isNaN(dur) || dur <= 0) errors.duration_minutes = "Duration must be greater than 0";

  if (service.image_url && service.image_url.trim()) {
    try { new URL(service.image_url.trim()); }
    catch { errors.image_url = "Image URL must be a valid URL (e.g. https://example.com/img.jpg)"; }
  }

  return errors;
}

export default function ServiceForm({ onCreate, onUpdate, editingService, onCancelEdit }) {
  const { selectedCurrency, formatPrice } = useCurrency();
  const [service, setService] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
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
      setService(INITIAL);
    }
    setErrors({});
    setTouched({});
  }, [editingService]);

  const handleChange = (e) => {
    const updated = { ...service, [e.target.name]: e.target.value };
    setService(updated);
    if (touched[e.target.name]) {
      setErrors(validate(updated));
    }
  };

  const handleBlur = (e) => {
    const next = { ...touched, [e.target.name]: true };
    setTouched(next);
    setErrors(validate(service));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(service).map(k => [k, true]));
    setTouched(allTouched);
    const errs = validate(service);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: service.service_name.trim(),
      description: service.description.trim(),
      price: Number(service.price),
      durationMinutes: Number(service.duration_minutes),
      location: service.location.trim(),
      additionalDescription: service.additional_description.trim(),
      imageUrl: service.image_url.trim()
    };

    if (editingService) {
      onUpdate(editingService.service_id, payload);
    } else {
      onCreate(payload);
      setService(INITIAL);
      setErrors({});
      setTouched({});
    }
  };

  const isValid = Object.keys(validate(service)).length === 0;

  const getCurrencySymbol = (currency) => {
    const symbols = {
      XAF: "FCFA", USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$",
      AUD: "A$", CHF: "CHF", CNY: "¥", INR: "₹", BRL: "R$", MXN: "$",
      SGD: "S$", HKD: "HK$", NZD: "NZ$", SEK: "kr", NOK: "kr", DKK: "kr",
      PLN: "zł", CZK: "Kč", HUF: "Ft", RUB: "₽", KRW: "₩", THB: "฿",
      MYR: "RM", IDR: "Rp", PHP: "₱", AED: "د.إ", SAR: "﷼", ILS: "₪",
      TRY: "₺", CLP: "$", COP: "$", PEN: "S/", ARS: "$", NGN: "₦",
      EGP: "E£", ZAR: "R", KES: "KSh", GHS: "₵", XOF: "CFA", MAD: "MAD"
    };
    return symbols[currency] || "$";
  };

  const inputClass = (field) =>
    `block w-full p-4 border-2 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-200 text-base ${
      touched[field] && errors[field]
        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-200"
        : "border-gray-200 focus:border-green-500 focus:ring-green-200"
    }`;

  const FieldError = ({ field }) =>
    touched[field] && errors[field] ? (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <span>⚠</span> {errors[field]}
      </p>
    ) : null;

  const RequiredStar = () => <span className="text-red-500 ml-0.5">*</span>;
  const OptionalBadge = () => (
    <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
      optional
    </span>
  );

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative bg-white p-6 shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {editingService ? "Edit Service" : "Add a Service"}
            </h2>
            <p className="text-gray-500 text-sm">
              Fields marked <span className="text-red-500 font-semibold">*</span> are required
            </p>
          </div>
          <div className="flex-shrink-0 text-gray-700">
            <CurrencySelector />
          </div>
        </div>
      </div>

      <div className="space-y-5 mb-8">
        {/* Service Name — required */}
        <div>
          <label htmlFor="service_name" className="block text-sm font-semibold text-gray-700 mb-2">
            Service Name <RequiredStar />
          </label>
          <input
            id="service_name"
            type="text"
            name="service_name"
            value={service.service_name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Haircut, Consultation, Massage"
            className={inputClass("service_name")}
            autoComplete="off"
          />
          <FieldError field="service_name" />
        </div>

        {/* Description — optional */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Description <OptionalBadge />
          </label>
          <textarea
            id="description"
            name="description"
            value={service.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Describe what your service includes..."
            rows={4}
            className={inputClass("description") + " resize-vertical"}
          />
          <FieldError field="description" />
        </div>

        {/* Location — optional */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
            Location <OptionalBadge />
          </label>
          <input
            id="location"
            type="text"
            name="location"
            value={service.location}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 123 Main St, Douala"
            className={inputClass("location")}
            autoComplete="off"
          />
          <FieldError field="location" />
        </div>

        {/* Additional Description — optional */}
        <div>
          <label htmlFor="additional_description" className="block text-sm font-semibold text-gray-700 mb-2">
            Additional Description <OptionalBadge />
          </label>
          <textarea
            id="additional_description"
            name="additional_description"
            value={service.additional_description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Additional details about your business or service..."
            rows={3}
            className={inputClass("additional_description") + " resize-vertical"}
          />
          <FieldError field="additional_description" />
        </div>

        {/* Image URL — optional */}
        <div>
          <label htmlFor="image_url" className="block text-sm font-semibold text-gray-700 mb-2">
            Image URL <OptionalBadge />
          </label>
          <input
            id="image_url"
            type="url"
            name="image_url"
            value={service.image_url}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="https://example.com/image.jpg"
            className={inputClass("image_url")}
            autoComplete="off"
          />
          <FieldError field="image_url" />
        </div>

        {/* Price + Duration — required */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
              Price <RequiredStar />
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm pointer-events-none">
                {getCurrencySymbol(selectedCurrency)}
              </span>
              <input
                id="price"
                type="number"
                name="price"
                value={service.price}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0"
                min="1"
                step="1"
                className={inputClass("price") + " pl-12"}
              />
            </div>
            {service.price && !errors.price && (
              <p className="text-xs text-gray-500 mt-1">
                Preview: {formatPrice(Number(service.price) || 0, selectedCurrency)}
              </p>
            )}
            <FieldError field="price" />
          </div>

          <div>
            <label htmlFor="duration_minutes" className="block text-sm font-semibold text-gray-700 mb-2">
              Duration (minutes) <RequiredStar />
            </label>
            <input
              id="duration_minutes"
              type="number"
              name="duration_minutes"
              value={service.duration_minutes}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="30"
              min="1"
              max="480"
              className={inputClass("duration_minutes")}
            />
            <FieldError field="duration_minutes" />
          </div>
        </div>
      </div>

      <div className="relative">
        {editingService && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="w-full mb-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-xl transition-all duration-300 focus:outline-none min-h-[48px]"
          >
            <span className="flex items-center justify-center gap-3 text-base">
              <XMarkIcon className="w-5 h-5" />
              Cancel
            </span>
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className={`w-full font-bold py-5 px-8 rounded-xl transition-all duration-300 focus:outline-none min-h-[64px] text-white shadow-lg ${
            isValid
              ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
          }`}
          aria-label={editingService ? "Update service" : "Create new service"}
        >
          <span className="flex items-center justify-center gap-3 text-lg">
            {editingService ? <PencilIcon className="w-6 h-6" /> : <PlusIcon className="w-6 h-6" />}
            {editingService ? "Update Service" : "Add A Service"}
          </span>
        </button>
      </div>
    </form>
  );
}
