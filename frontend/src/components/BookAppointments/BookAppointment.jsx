import React, { useEffect, useState } from "react";
import api from "../../services/api.js";

export default function BookAppointmentForm({ providerId }) {
  const [timeslots, setTimeslots] = useState([]);
  const [selectedTimeslotId, setSelectedTimeslotId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchTimeslots = async () => {
      if (!providerId) return;

      try {
        const response = await api.get(`/slots/${providerId}`);
        const data = response.data.data;
        setTimeslots(Array.isArray(data) ? data : []);
        console.log("Fetched timeslots:", data);
      } catch (error) {
        console.error("Failed to fetch timeslots:", error);
        setTimeslots([]);
      }
    };

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
    } catch (err) {
      console.error("Booking failed:", err);
      const errorMsg =
        err.response?.data?.message || "Internal server error. Try again.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Group timeslots by date for better mobile UX
  const timeslotsByDate = timeslots.reduce((acc, slot) => {
    const date = formatDate(slot.day);
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-6'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>
            Book an Appointment
          </h2>
          <p className='text-gray-600 text-sm'>
            Select a date and time slot for your appointment.
          </p>
        </div>

        {/* Mobile-optimized date selector */}
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
            className='input-field w-full touch-target text-base'
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Timeslot selector - Mobile optimized */}
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

        {/* Submit button - Mobile optimized */}
        <div className='pt-4 border-t border-gray-200'>
          <button
            type='submit'
            disabled={loading || !selectedTimeslotId}
            className='btn btn-primary w-full py-4 text-base font-semibold touch-target disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <div className='flex items-center justify-center'>
                <div className='loading-spinner mr-2'></div>
                Booking...
              </div>
            ) : (
              "Book Appointment"
            )}
          </button>
        </div>

        {/* Message display */}
        {message && (
          <div
            className={`p-4 rounded-xl ${
              message.includes("success") || message.includes("successfully")
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <p className='text-sm font-medium'>{message}</p>
          </div>
        )}
      </form>
    </div>
  );
}
