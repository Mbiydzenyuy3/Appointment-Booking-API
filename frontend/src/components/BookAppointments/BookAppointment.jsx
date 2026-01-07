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

  // Progress steps
  const baseSteps = [
    { id: 1, label: "Select Service" },
    { id: 2, label: "Choose Time" },
    { id: 3, label: "Enter Details" },
    { id: 4, label: "Confirm" }
  ];

  // Filter steps based on user type
  const steps = user
    ? baseSteps.filter((step) => step.id !== 3) // Skip Enter Details for authenticated users
    : baseSteps;

  // Determine current step
  const getCurrentStep = () => {
    if (!selectedSlot) return 2;
    if (user) return 3; // For users, after choose time is confirm (step 3 in filtered array)
    if (!guestName.trim() || !guestEmail.trim()) return 3;
    return 4;
  };

  const currentStep = getCurrentStep();

  // Update steps completion
  const updatedSteps = steps.map((step) => ({
    ...step,
    completed: step.id < currentStep,
    current: step.id === currentStep
  }));

  const formatDate = (date) => {
    if (!date) return "";
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
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

  // Validation functions
  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };

    switch (fieldName) {
      case "guestName":
        if (!value.trim()) {
          errors.guestName = "Name is required";
        } else if (value.trim().length < 2) {
          errors.guestName = "Name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          errors.guestName = "Name can only contain letters and spaces";
        } else {
          delete errors.guestName;
        }
        break;
      case "guestEmail":
        if (!value.trim()) {
          errors.guestEmail = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors.guestEmail = "Please enter a valid email address";
        } else {
          delete errors.guestEmail;
        }
        break;
      case "guestPhone":
        if (
          value.trim() &&
          !/^[+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s-]/g, ""))
        ) {
          errors.guestPhone = "Please enter a valid phone number";
        } else {
          delete errors.guestPhone;
        }
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
      if (!guestName.trim()) {
        errors.guestName = "Name is required";
      } else if (guestName.trim().length < 2) {
        errors.guestName = "Name must be at least 2 characters";
      } else if (!/^[a-zA-Z\s]+$/.test(guestName.trim())) {
        errors.guestName = "Name can only contain letters and spaces";
      }

      if (!guestEmail.trim()) {
        errors.guestEmail = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
        errors.guestEmail = "Please enter a valid email address";
      }

      if (
        guestPhone.trim() &&
        !/^[+]?[1-9][\d]{0,15}$/.test(guestPhone.replace(/[\s-]/g, ""))
      ) {
        errors.guestPhone = "Please enter a valid phone number";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!selectedSlot) {
      setMessage("Please select a time slot to continue.");
      setLoading(false);
      return;
    }

    // Validate all fields if not authenticated
    if (!user) {
      if (!validateAllFields()) {
        setMessage("Please correct the errors below and try again.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      timeslotId: selectedSlot.timeslot_id,
      appointment_date: formatDate(selectedSlot.day),
      appointment_time: formatTime(selectedSlot.start_time)
    };

    // Add guest fields if not authenticated
    if (!user) {
      payload.guest_name = guestName.trim();
      payload.guest_email = guestEmail.trim();
      payload.guest_phone = guestPhone.trim() || null;
    }

    try {
      const endpoint = user ? "/appointments/book" : "/appointments/guest-book";
      const response = await api.post(endpoint, payload);
      setMessage(response.data.message || "Appointment booked successfully!");

      // Track successful booking
      trackBookingCompleted(
        response.data.data?.appointment_id,
        service?.service_id,
        service?.service_name,
        !user
      );

      // Save guest booking data if not authenticated
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

        // Show sign-up prompt after a short delay
        setTimeout(() => {
          setShowSignUpPrompt(true);
          // Track sign-up prompt shown
          trackEvent("Sign Up Prompt Shown", {
            service_id: service?.service_id,
            service_name: service?.service_name,
            booking_type: "guest"
          });
        }, 2000);
      }

      // Reset form
      setSelectedTimeslotId("");
      setSelectedSlot(null);
      if (!user) {
        setGuestName("");
        setGuestEmail("");
        setGuestPhone("");
      }
    } catch (err) {
      console.error("Booking failed:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "We're experiencing some technical difficulties. Please try again in a moment.";
      setMessage(errorMsg);

      // Track booking failure
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

  // Focus management and keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Focus trapping
      if (e.key === "Tab") {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    // Focus first element when modal opens
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-50 bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4 safe-area-bottom'>
      <div
        ref={modalRef}
        className='bg-white rounded-2xl flex flex-col shadow-2xl w-full max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-hidden'
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        role='dialog'
        aria-modal='true'
        aria-labelledby='booking-modal-title'
      >
        {/* Header - Fixed */}
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
              className='p-2 hover:bg-gray-100 text-black rounded-lg touch-target'
              aria-label='Close modal'
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

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto px-6 py-4'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Progress Roadmap */}
            <div className='mt-4 mb-6'>
              <div className='flex items-center justify-between text-sm text-gray-600 mb-4'>
                <span>Booking Progress</span>
                <span>
                  {currentStep} of {user ? 3 : 4}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                {updatedSteps.map((step, index) => (
                  <div key={step.id} className='flex items-center flex-1'>
                    <div className='flex flex-col items-center'>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                          step.completed
                            ? "bg-green-600 text-white"
                            : step.current
                            ? "bg-blue-600 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {step.completed ? (
                          <svg
                            className='w-4 h-4'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </div>
                      <span
                        className={`text-xs mt-1 text-center leading-tight ${
                          step.completed
                            ? "text-green-600 font-medium"
                            : step.current
                            ? "text-blue-600 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < updatedSteps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                          step.completed ? "bg-green-600" : "bg-gray-300"
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Select Date & Time
              </label>
              <AvailabilityPicker
                providerId={providerId}
                onSlotSelect={(slot) => {
                  setSelectedTimeslotId(slot.timeslot_id);
                  setSelectedSlot(slot);
                }}
                selectedSlotId={selectedTimeslotId}
              />
            </div>

            {/* Guest information fields for non-authenticated users */}
            {!user && (
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='guestName'
                    className='block text-sm font-medium text-gray-900 mb-2'
                  >
                    Your Name
                  </label>
                  <input
                    type='text'
                    id='guestName'
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      // Clear error when user starts typing
                      if (fieldErrors.guestName) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          guestName: undefined
                        }));
                      }
                    }}
                    onBlur={(e) => validateField("guestName", e.target.value)}
                    className={`block w-full p-4 border-2 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-200 text-base ${
                      fieldErrors.guestName
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-green-500 focus:ring-green-200"
                    }`}
                    placeholder='Enter your full name'
                    required
                    aria-invalid={fieldErrors.guestName ? "true" : "false"}
                    aria-describedby={
                      fieldErrors.guestName ? "guestName-error" : undefined
                    }
                  />
                  {fieldErrors.guestName && (
                    <p
                      id='guestName-error'
                      className='mt-1 text-sm text-red-600 flex items-center'
                    >
                      <svg
                        className='w-4 h-4 mr-1'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {fieldErrors.guestName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='guestEmail'
                    className='block text-sm font-medium text-gray-900 mb-2'
                  >
                    Email Address
                  </label>
                  <input
                    type='email'
                    id='guestEmail'
                    value={guestEmail}
                    onChange={(e) => {
                      setGuestEmail(e.target.value);
                      // Clear error when user starts typing
                      if (fieldErrors.guestEmail) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          guestEmail: undefined
                        }));
                      }
                    }}
                    onBlur={(e) => validateField("guestEmail", e.target.value)}
                    className={`block w-full p-4 border-2 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-200 text-base ${
                      fieldErrors.guestEmail
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-green-500 focus:ring-green-200"
                    }`}
                    placeholder='your.email@example.com'
                    required
                    aria-invalid={fieldErrors.guestEmail ? "true" : "false"}
                    aria-describedby={
                      fieldErrors.guestEmail ? "guestEmail-error" : undefined
                    }
                  />
                  {fieldErrors.guestEmail && (
                    <p
                      id='guestEmail-error'
                      className='mt-1 text-sm text-red-600 flex items-center'
                    >
                      <svg
                        className='w-4 h-4 mr-1'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {fieldErrors.guestEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='guestPhone'
                    className='block text-sm font-medium text-gray-900 mb-2'
                  >
                    Phone Number (Optional)
                  </label>
                  <input
                    type='tel'
                    id='guestPhone'
                    value={guestPhone}
                    onChange={(e) => {
                      setGuestPhone(e.target.value);
                      // Clear error when user starts typing
                      if (fieldErrors.guestPhone) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          guestPhone: undefined
                        }));
                      }
                    }}
                    onBlur={(e) => validateField("guestPhone", e.target.value)}
                    className={`block w-full p-4 border-2 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-200 text-base ${
                      fieldErrors.guestPhone
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-green-500 focus:ring-green-200"
                    }`}
                    placeholder='+237 6XX XXX XXX'
                    aria-invalid={fieldErrors.guestPhone ? "true" : "false"}
                    aria-describedby={
                      fieldErrors.guestPhone ? "guestPhone-error" : undefined
                    }
                  />
                  {fieldErrors.guestPhone && (
                    <p
                      id='guestPhone-error'
                      className='mt-1 text-sm text-red-600 flex items-center'
                    >
                      <svg
                        className='w-4 h-4 mr-1'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {fieldErrors.guestPhone}
                    </p>
                  )}
                </div>

                <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                  <p className='text-sm text-blue-800'>
                    <strong>Note:</strong> You'll receive a confirmation email.
                    Create an account later to manage your appointments.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className='flex-shrink-0 px-6 py-4 border-t border-gray-100'>
          <div className='relative'>
            <button
              type='submit'
              disabled={loading || !selectedTimeslotId}
              className='form-submit-button w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 focus:outline-none min-h-[64px] touch-target transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border-2 border-transparent hover:border-green-800 disabled:opacity-50 disabled:cursor-not-allowed'
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
              aria-label='Book appointment'
              onClick={handleSubmit}
            >
              <span className='flex items-center justify-center gap-3 text-lg'>
                {loading ? (
                  <div className='loading-spinner mr-2'></div>
                ) : (
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
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                )}
                {loading
                  ? "Booking..."
                  : user
                  ? "Book Appointment"
                  : "Book as Guest"}
              </span>
            </button>
          </div>

          {message && (
            <div
              className={`mt-4 p-4 rounded-xl ${
                message.includes("success") || message.includes("successfully")
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <div className='flex flex-col space-y-3'>
                <p className='text-sm font-medium'>{message}</p>

                {(message.includes("success") ||
                  message.includes("successfully")) && (
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center'>
                        <svg
                          className='w-4 h-4 text-green-600'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      </div>
                      <span className='text-sm font-medium text-green-700'>
                        Booking Confirmed! 🎉
                      </span>
                    </div>
                    <p className='text-xs text-green-600'>
                      Your appointment is secured. Check your email for details
                      and reminders.
                    </p>
                    <div className='flex justify-end'>
                      {onClose && (
                        <button
                          onClick={onClose}
                          className='p-2 hover:bg-gray-100 rounded-lg touch-target'
                          aria-label='Close modal'
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
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign-up Prompt Modal */}
      {showSignUpPrompt && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl p-6 max-w-sm w-full mx-4'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Booking Confirmed!
              </h3>
              <p className='text-gray-600 mb-4'>
                Create an account to manage your appointments and get
                personalized recommendations.
              </p>
              <div className='flex space-x-3'>
                <button
                  onClick={() => {
                    setShowSignUpPrompt(false);
                    markSignUpPrompted();
                    // Track sign-up prompt dismissed
                    trackEvent("Sign Up Prompt Dismissed", {
                      action: "maybe_later",
                      service_id: service?.service_id,
                      service_name: service?.service_name
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
                    // Track sign-up prompt accepted
                    trackEvent("Sign Up Prompt Accepted", {
                      action: "sign_up_now",
                      service_id: service?.service_id,
                      service_name: service?.service_name
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
        </div>
      )}
    </div>
  );
}
