import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useGuest } from "../../context/GuestContext.jsx";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import AvailabilityPicker from "./AvailabilityPicker.jsx";
import {
  trackBookingCompleted,
  trackBookingFailed,
  trackEvent
} from "../../services/analytics.js";

export default function BookAppointmentForm({
  providerId,
  isOpen,
  onClose,
  service
}) {
  const { user } = useAuth();
  const { saveGuestBooking, markSignUpPrompted } = useGuest();
  const navigate = useNavigate();
  const [selectedTimeslotId, setSelectedTimeslotId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  // Guest booking fields
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // Define steps
  const baseSteps = [
    { id: 1, label: "Select Service" },
    { id: 2, label: "Choose Time" },
    { id: 3, label: "Enter Details" },
    { id: 4, label: "Confirm" }
  ];

  const steps = user ? baseSteps.filter((s) => s.id !== 3) : baseSteps;

  const getCurrentStep = () => {
    if (!selectedSlot) return 2;
    if (!user && (!guestName.trim() || !guestEmail.trim())) return 3;
    return steps.length;
  };

  const currentStep = getCurrentStep();

  const updatedSteps = steps.map((step) => ({
    ...step,
    completed: step.id < currentStep,
    current: step.id === currentStep
  }));

  const formatDate = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return date;
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  // Field validation
  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };
    switch (fieldName) {
      case "guestName":
        if (!value.trim()) errors.guestName = "Name is required";
        else if (value.trim().length < 2)
          errors.guestName = "Name must be at least 2 characters";
        else if (!/^[a-zA-Z\s]+$/.test(value.trim()))
          errors.guestName = "Name can only contain letters and spaces";
        else delete errors.guestName;
        break;
      case "guestEmail":
        if (!value.trim()) errors.guestEmail = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
          errors.guestEmail = "Please enter a valid email address";
        else delete errors.guestEmail;
        break;
      case "guestPhone":
        if (
          value.trim() &&
          !/^[+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s-]/g, ""))
        )
          errors.guestPhone = "Please enter a valid phone number";
        else delete errors.guestPhone;
        break;
      default:
        break;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAllFields = () => {
    const errors = {};
    if (!user) {
      if (!guestName.trim()) errors.guestName = "Name is required";
      else if (guestName.trim().length < 2)
        errors.guestName = "Name must be at least 2 characters";
      else if (!/^[a-zA-Z\s]+$/.test(guestName.trim()))
        errors.guestName = "Name can only contain letters and spaces";

      if (!guestEmail.trim()) errors.guestEmail = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim()))
        errors.guestEmail = "Please enter a valid email address";

      if (
        guestPhone.trim() &&
        !/^[+]?[1-9][\d]{0,15}$/.test(guestPhone.replace(/[\s-]/g, ""))
      )
        errors.guestPhone = "Please enter a valid phone number";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isReadyToBook = () => {
    if (!selectedSlot) return false;
    if (!user && (!guestName.trim() || !guestEmail.trim())) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isReadyToBook()) return;
    setLoading(true);
    setMessage(null);

    const payload = {
      timeslotId: selectedSlot.timeslot_id,
      appointment_date: formatDate(selectedSlot.day),
      appointment_time: formatTime(selectedSlot.start_time)
    };

    if (!user) {
      if (!validateAllFields()) {
        setMessage("Please correct the errors above to continue.");
        setLoading(false);
        return;
      }
      payload.guest_name = guestName.trim();
      payload.guest_email = guestEmail.trim();
      payload.guest_phone = guestPhone.trim() || null;
    }

    try {
      const endpoint = user ? "/appointments/book" : "/appointments/guest-book";
      const response = await api.post(endpoint, payload);
      setMessage("Appointment booked successfully! 🎉");

      trackBookingCompleted(
        response.data.data?.appointment_id,
        service?.service_id,
        service?.service_name,
        !user
      );

      if (!user) {
        saveGuestBooking({
          appointment_id: response.data.data?.appointment_id,
          guest_email: payload.guest_email,
          guest_name: payload.guest_name,
          guest_phone: payload.guest_phone,
          service_name: service?.service_name,
          provider_name: service?.provider_name,
          appointment_date: payload.appointment_date,
          appointment_time: payload.appointment_time
        });

        setTimeout(() => {
          setShowSignUpPrompt(true);
          trackEvent("Sign Up Prompt Shown", {
            service_id: service?.service_id,
            service_name: service?.service_name,
            booking_type: "guest"
          });
        }, 2000);
      }

      setSelectedTimeslotId("");
      setSelectedSlot(null);
      if (!user) {
        setGuestName("");
        setGuestEmail("");
        setGuestPhone("");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Technical difficulties. Please try again later.";
      setMessage(errorMsg);

      trackBookingFailed(
        service?.service_id,
        service?.service_name,
        errorMsg,
        !user
      );
    } finally {
      setLoading(false);
    }
  };

  // Focus trap and ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const modal = modalRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (firstFocusableRef.current) firstFocusableRef.current.focus();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-50 bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4 safe-area-bottom'>
      <div
        ref={modalRef}
        className='bg-white rounded-2xl flex flex-col shadow-2xl w-full max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-hidden'
        role='dialog'
        aria-modal='true'
      >
        {/* Header */}
        <div className='flex-shrink-0 px-6 py-4 border-b border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-xl font-bold text-gray-900'>
                Book Appointment
              </h3>
              {service && (
                <p className='text-gray-600 mt-1 text-sm'>
                  {service.service_name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg'
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto px-6 py-4'>
          <form className='space-y-6'>
            {/* Progress */}
            <div className='mb-6'>
              <div className='flex items-center justify-between text-sm text-gray-600 mb-2'>
                <span>Booking Progress</span>
                <span>
                  {currentStep} of {steps.length}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                {updatedSteps.map((step, idx) => (
                  <div key={step.id} className='flex items-center flex-1'>
                    <div className='flex flex-col items-center'>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
                        ${step.completed ? "bg-green-600 text-white" : step.current ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
                      >
                        {step.completed ? "✓" : step.id}
                      </div>
                      <span
                        className={`text-xs mt-1 text-center leading-tight
                        ${step.completed ? "text-green-600 font-medium" : step.current ? "text-blue-600 font-medium" : "text-gray-500"}`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < updatedSteps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${step.completed ? "bg-green-600" : "bg-gray-300"}`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Availability */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Select Date & Time
              </label>
              <p className='text-xs text-gray-500 mb-2'>
                Pick a convenient slot to continue.
              </p>
              <AvailabilityPicker
                providerId={providerId}
                onSlotSelect={(slot) => {
                  setSelectedTimeslotId(slot.timeslot_id);
                  setSelectedSlot(slot);
                }}
                selectedSlotId={selectedTimeslotId}
              />
            </div>

            {/* Step 3: Guest info */}
            {!user && (
              <div className='space-y-4'>
                <p className='text-xs text-gray-500 mb-2'>
                  Enter your details to confirm your booking.
                </p>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    Your Name
                  </label>
                  <input
                    type='text'
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      if (fieldErrors.guestName)
                        setFieldErrors((prev) => ({
                          ...prev,
                          guestName: undefined
                        }));
                    }}
                    onBlur={(e) => validateField("guestName", e.target.value)}
                    className={`block w-full p-4 border-2 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-200 text-base
                      ${fieldErrors.guestName ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                    placeholder='Enter your full name'
                  />
                  {fieldErrors.guestName && (
                    <p className='text-red-600 text-xs mt-1'>
                      {fieldErrors.guestName}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    Email Address
                  </label>
                  <input
                    type='email'
                    value={guestEmail}
                    onChange={(e) => {
                      setGuestEmail(e.target.value);
                      if (fieldErrors.guestEmail)
                        setFieldErrors((prev) => ({
                          ...prev,
                          guestEmail: undefined
                        }));
                    }}
                    onBlur={(e) => validateField("guestEmail", e.target.value)}
                    className={`block w-full p-4 border-2 rounded-lg text-gray-800 placeholder-gray-400 text-base
                      ${fieldErrors.guestEmail ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                    placeholder='your.email@example.com'
                  />
                  {fieldErrors.guestEmail && (
                    <p className='text-red-600 text-xs mt-1'>
                      {fieldErrors.guestEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-900 mb-2'>
                    Phone Number (Optional)
                  </label>
                  <input
                    type='tel'
                    value={guestPhone}
                    onChange={(e) => {
                      setGuestPhone(e.target.value);
                      if (fieldErrors.guestPhone)
                        setFieldErrors((prev) => ({
                          ...prev,
                          guestPhone: undefined
                        }));
                    }}
                    onBlur={(e) => validateField("guestPhone", e.target.value)}
                    className={`block w-full p-4 border-2 rounded-lg text-gray-800 placeholder-gray-400 text-base
                      ${fieldErrors.guestPhone ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}
                    placeholder='+237 6XX XXX XXX'
                  />
                  {fieldErrors.guestPhone && (
                    <p className='text-red-600 text-xs mt-1'>
                      {fieldErrors.guestPhone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Confirmation Summary */}
            {selectedSlot && (
              <div className='bg-gray-50 p-4 rounded-lg border mt-4'>
                <p className='text-sm font-medium mb-2'>
                  You are about to book:
                </p>
                <ul className='text-sm'>
                  <li>
                    <strong>Service:</strong> {service?.service_name}
                  </li>
                  <li>
                    <strong>Date:</strong> {formatDate(selectedSlot.day)}
                  </li>
                  <li>
                    <strong>Time:</strong> {formatTime(selectedSlot.start_time)}
                  </li>
                  {!user && (
                    <li>
                      <strong>Name:</strong> {guestName}
                    </li>
                  )}
                  {!user && (
                    <li>
                      <strong>Email:</strong> {guestEmail}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className='flex-shrink-0 px-6 py-4 border-t border-gray-100'>
          <button
            type='submit'
            disabled={loading || !isReadyToBook()}
            onClick={handleSubmit}
            className='w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading
              ? "Booking..."
              : user
                ? "Book Appointment"
                : "Book as Guest"}
          </button>
          {message && <p className='text-sm text-center mt-3'>{message}</p>}
        </div>

        {/* Sign-up Prompt */}
        {showSignUpPrompt && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-xl p-6 max-w-sm w-full mx-4 text-center'>
              <h3 className='text-lg font-semibold mb-2'>Booking Confirmed!</h3>
              <p className='text-gray-600 mb-4'>
                Create an account to manage your appointments and get
                recommendations.
              </p>
              <div className='flex space-x-3'>
                <button
                  onClick={() => {
                    setShowSignUpPrompt(false);
                    markSignUpPrompted();
                    trackEvent("Sign Up Prompt Dismissed", {
                      action: "maybe_later",
                      service_id: service?.service_id
                    });
                  }}
                  className='flex-1 btn btn-secondary'
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    setShowSignUpPrompt(false);
                    markSignUpPrompted();
                    trackEvent("Sign Up Prompt Accepted", {
                      action: "sign_up_now",
                      service_id: service?.service_id
                    });
                    navigate("/register");
                  }}
                  className='flex-1 btn btn-primary'
                >
                  Sign Up Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
