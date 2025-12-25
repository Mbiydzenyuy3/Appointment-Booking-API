import React, { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function BookAppointmentForm({
  providerId,
  isOpen,
  onClose,
  service
}) {
  const [timeslots, setTimeslots] = useState([]);
  const [selectedTimeslotId, setSelectedTimeslotId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

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

    const payload = {
      timeslotId: selectedSlot.timeslot_id,
      appointment_date: formatDate(selectedSlot.day),
      appointment_time: formatTime(selectedSlot.start_time)
    };

    try {
      console.log("Sending booking payload:", payload);
      const response = await api.post("/appointments/book", payload);
      setMessage(response.data.message || "Appointment booked successfully!");

      await fetchTimeslots();

      setSelectedTimeslotId("");
      setSelectedDate("");
    } catch (err) {
      console.error("Booking failed:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Internal server error. Try again.";
      setMessage(errorMsg);

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
            <h3 className='text-xl font-bold text-gray-900'>
              Book Appointment
            </h3>
            <div>
              <p className='text-gray-600 text-sm'>
                Select a date and time slot for your appointment.
              </p>
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
                className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-base'
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
                                  {slot.provider_name}
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

            <div className='relative'>
              <button
                type='submit'
                disabled={loading || !selectedTimeslotId}
                className='form-submit-button w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2 min-h-[64px] touch-target transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border-2 border-transparent hover:border-green-800 disabled:opacity-50 disabled:cursor-not-allowed'
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
                  {loading ? "Booking..." : "Book Appointment"}
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
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium'>{message}</p>
                  {(message.includes("success") ||
                    message.includes("successfully")) &&
                    onClose && (
                      <button
                        onClick={onClose}
                        className='ml-4 p-2 hover:bg-green-100 rounded-lg touch-target'
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
          </form>
        </div>
      </div>
    </div>
  );
}
