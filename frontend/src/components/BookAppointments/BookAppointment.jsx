import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";
import {
  trackBookingCompleted,
  trackBookingFailed
} from "../../services/analytics.js";

export default function BookAppointmentForm({
  providerId,
  isOpen,
  onClose,
  service
}) {
  const { user } = useAuth();
  const [timeslots, setTimeslots] = useState([]);
  const [selectedTimeslotId, setSelectedTimeslotId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  // Guest booking fields
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const fetchTimeslots = async () => {
    if (!providerId) return;

    try {
      const response = await api.get(
        `/slots/search/available?providerId=${providerId}`
      );
      const data = response.data.data;
      setTimeslots(Array.isArray(data) ? data : []);
      console.log("Fetched timeslots:", data);
    } catch (error) {
      console.error("Failed to fetch timeslots:", error);
      setTimeslots([]);
    }
  };

  useEffect(() => {
    fetchTimeslots();
  }, [providerId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const selectedSlot = timeslots.find(
      (slot) => slot.timeslot_id === selectedTimeslotId
    );

    if (!selectedSlot) {
      setMessage("Invalid timeslot selected.");
      setLoading(false);
      return;
    }

    // Validate guest fields if not authenticated
    if (!user) {
      if (!guestName.trim() || !guestEmail.trim()) {
        setMessage("Please provide your name and email to book as a guest.");
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
      console.log("Sending booking payload:", payload);
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

      await fetchTimeslots();

      // Reset form
      setSelectedTimeslotId("");
      setSelectedDate("");
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
        "Something went wrong. Please try again.";
      setMessage(errorMsg);

      // Track booking failure
      trackBookingFailed(
        service?.service_id,
        service?.service_name,
        errorMsg,
        !user
      );

      if (err.response?.status === 409) {
        await fetchTimeslots();
      }
    } finally {
      setLoading(false);
    }
  };

  const timeslotsByDate = timeslots.reduce((acc, slot) => {
    const date = formatDate(slot.day);
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-50 bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4 safe-area-bottom'>
      <div
        className='bg-white rounded-2xl flex flex-col shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto'
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className='border bg-white border-gray-200 px-6 py-4 rounded-xl hover:shadow-xl transition-shadow duration-300'>
          <div className='w-full flex items-end justify-end'>
            <div className='flex items-center justify-between -mt-2 mr-0'>
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
            {service && (
              <p className='text-gray-600 mt-1'>{service.service_name}</p>
            )}
          </div>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <h3 className='text-xl font-bold text-gray-900'>
                Book Appointment
              </h3>
              {/* Progress indicator */}
              <div className='mt-4 mb-6'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium text-gray-700'>
                    Step 1 of 2
                  </span>
                  <span className='text-sm text-gray-500'>
                    Select time slot
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-green-600 h-2 rounded-full transition-all duration-300'
                    style={{ width: selectedTimeslotId ? "50%" : "0%" }}
                  ></div>
                </div>
                {!user && selectedTimeslotId && (
                  <div className='mt-2'>
                    <span className='text-sm font-medium text-gray-700'>
                      Step 2 of 2
                    </span>
                    <span className='text-sm text-gray-500 ml-2'>
                      Enter your details
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor='date'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                Select Date
              </label>
              <input
                type='date'
                id='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400    transition-all duration-200 text-base'
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label
                htmlFor='timeslot'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Available Time Slots
              </label>
              {Object.keys(timeslotsByDate).length === 0 ? (
                <div className='text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200'>
                  <div className='text-3xl mb-2'>⏰</div>
                  <p className='text-gray-600'>No available time slots</p>
                </div>
              ) : (
                <div className='space-y-4 max-h-64 overflow-y-auto'>
                  {Object.entries(timeslotsByDate).map(([date, slots]) => (
                    <div
                      key={date}
                      className='border border-gray-200 rounded-xl overflow-hidden'
                    >
                      <div className='bg-gray-50 px-4 py-2 border-b border-gray-200'>
                        <h3 className='font-medium text-gray-900 text-sm'>
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric"
                          })}
                        </h3>
                      </div>
                      <div className='p-2 grid grid-cols-1 gap-2'>
                        {slots.map((slot) => (
                          <label
                            key={slot.timeslot_id}
                            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 touch-target ${
                              selectedTimeslotId === slot.timeslot_id
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                            }`}
                          >
                            <input
                              type='radio'
                              name='timeslot'
                              value={slot.timeslot_id}
                              checked={selectedTimeslotId === slot.timeslot_id}
                              onChange={(e) =>
                                setSelectedTimeslotId(e.target.value)
                              }
                              className='sr-only'
                            />
                            <div className='flex-1'>
                              <div className='flex items-center justify-between'>
                                <span className='font-medium text-gray-900'>
                                  {formatTime(slot.start_time)} -{" "}
                                  {formatTime(slot.end_time)}
                                </span>
                                <span className='text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full'>
                                  {slot.name}
                                </span>
                              </div>
                            </div>
                            {selectedTimeslotId === slot.timeslot_id && (
                              <div className='ml-2'>
                                <svg
                                  className='w-5 h-5 text-green-600'
                                  fill='currentColor'
                                  viewBox='0 0 20 20'
                                >
                                  <path
                                    fillRule='evenodd'
                                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                    clipRule='evenodd'
                                  />
                                </svg>
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Guest information fields for non-authenticated users */}
            {!user && (
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor='guestName'
                    className='block text-sm font-medium text-gray-900 mb-2'
                  >
                    Your Name *
                  </label>
                  <input
                    type='text'
                    id='guestName'
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400    transition-all duration-200 text-base'
                    placeholder='Enter your full name'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='guestEmail'
                    className='block text-sm font-medium text-gray-900 mb-2'
                  >
                    Email Address *
                  </label>
                  <input
                    type='email'
                    id='guestEmail'
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400    transition-all duration-200 text-base'
                    placeholder='your.email@example.com'
                    required
                  />
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
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400    transition-all duration-200 text-base'
                    placeholder='+237 6XX XXX XXX'
                  />
                </div>

                <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                  <p className='text-sm text-blue-800'>
                    <strong>Note:</strong> You'll receive a confirmation email.
                    Create an account later to manage your appointments.
                  </p>
                </div>
              </div>
            )}

            <div className='relative'>
              <button
                type='submit'
                disabled={loading || !selectedTimeslotId}
                className='form-submit-button w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 focus:outline-none    min-h-[64px] touch-target transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border-2 border-transparent hover:border-green-800 disabled:opacity-50 disabled:cursor-not-allowed'
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
                className={`p-4 rounded-xl ${
                  message.includes("success") ||
                  message.includes("successfully")
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                <div className='flex flex-col space-y-3'>
                  <p className='text-sm font-medium'>{message}</p>

                  {(message.includes("success") ||
                    message.includes("successfully")) && (
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <span className='text-xs text-green-600'>
                          ✓ Confirmed
                        </span>
                        <button
                          onClick={() => {
                            const shareText = `I've booked an appointment for ${
                              service?.service_name
                            } with ${service?.provider_name || "BookEasy"}! 📅`;
                            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                              shareText
                            )}`;
                            window.open(whatsappUrl, "_blank");
                          }}
                          className='flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs rounded-full transition-colors'
                        >
                          <svg
                            className='w-4 h-4'
                            fill='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488' />
                          </svg>
                          <span>Share on WhatsApp</span>
                        </button>
                      </div>
                      {onClose && (
                        <button
                          onClick={onClose}
                          className='p-2 hover:bg-green-100 rounded-lg touch-target'
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
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
