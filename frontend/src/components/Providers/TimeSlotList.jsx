import React from "react";
import { useCurrency } from "../../context/CurrencyContext.jsx";

export default function TimeSlotList({ timeslots = [], onDelete }) {
  const { formatPrice } = useCurrency();

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  // Calculate duration in minutes
  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes - startMinutes;
  };

  // Group timeslots by date for better organization
  const groupedTimeslots = timeslots.reduce((groups, slot) => {
    const date = slot.day;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedTimeslots).sort();

  const handleDelete = async (slotId, serviceName, day) => {
    if (
      window.confirm(
        `Are you sure you want to delete the timeslot for "${serviceName}" on ${formatDate(
          day
        )}? This action cannot be undone.`
      )
    ) {
      onDelete(slotId);
    }
  };

  if (!timeslots || timeslots.length === 0) {
    return (
      <div className='text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200'>
        <div className='text-6xl mb-4'>⏰</div>
        <h3 className='text-xl font-semibold text-gray-700 mb-2'>
          No Timeslots Created Yet
        </h3>
        <p className='text-gray-500 mb-4'>
          Start by creating available time slots for your services
        </p>
        <div className='text-sm text-gray-400'>
          <p>
            Timeslots help clients know when you're available for appointments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Your Timeslots ({timeslots.length})
          </h3>
          <div className='flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              <span className='text-gray-600'>Available</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
              <span className='text-gray-600'>Booked</span>
            </div>
          </div>
        </div>
      </div>

      {sortedDates.map((date) => (
        <div
          key={date}
          className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
        >
          {/* Date Header */}
          <div className='bg-gray-50 px-4 py-3 border-b border-gray-200'>
            <h4 className='text-md font-semibold text-gray-800 flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-gray-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              {formatDate(date)}
              <span className='text-sm font-normal text-gray-500'>
                ({groupedTimeslots[date].length} slot
                {groupedTimeslots[date].length !== 1 ? "s" : ""})
              </span>
            </h4>
          </div>

          {/* Timeslots for this date */}
          <div className='divide-y divide-gray-100'>
            {groupedTimeslots[date]
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((slot) => {
                const duration = calculateDuration(
                  slot.start_time,
                  slot.end_time
                );
                const isBooked = slot.is_booked || !slot.is_available;

                return (
                  <div
                    key={slot.timeslot_id}
                    className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                      isBooked
                        ? "bg-red-50 border-l-4 border-red-400"
                        : "bg-white"
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      {/* Timeslot Info */}
                      <div className='flex-1'>
                        <div className='flex items-center gap-4'>
                          {/* Time Range */}
                          <div className='flex items-center gap-2'>
                            <svg
                              className='w-5 h-5 text-gray-500'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                              />
                            </svg>
                            <div>
                              <p className='font-semibold text-gray-800'>
                                {formatTime(slot.start_time)} -{" "}
                                {formatTime(slot.end_time)}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {duration} minutes
                              </p>
                            </div>
                          </div>

                          {/* Service Info */}
                          <div className='flex-1'>
                            <p className='font-medium text-gray-800'>
                              {slot.service_name ||
                                `Service ID: ${slot.service_id}`}
                            </p>
                            <div className='flex items-center gap-2 mt-1'>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  isBooked
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {isBooked ? (
                                  <>
                                    <svg
                                      className='w-3 h-3 mr-1'
                                      fill='currentColor'
                                      viewBox='0 0 20 20'
                                    >
                                      <path
                                        fillRule='evenodd'
                                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                                        clipRule='evenodd'
                                      />
                                    </svg>
                                    Booked
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      className='w-3 h-3 mr-1'
                                      fill='currentColor'
                                      viewBox='0 0 20 20'
                                    >
                                      <path
                                        fillRule='evenodd'
                                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                        clipRule='evenodd'
                                      />
                                    </svg>
                                    Available
                                  </>
                                )}
                              </span>

                              {slot.service_price && (
                                <span className='text-sm text-gray-500'>
                                  • {formatPrice(slot.service_price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div className='mt-2 flex items-center gap-4 text-sm text-gray-500'>
                          <span>
                            Created:{" "}
                            {new Date(
                              slot.created_at || Date.now()
                            ).toLocaleDateString()}
                          </span>
                          {slot.updated_at && (
                            <span>
                              Updated:{" "}
                              {new Date(slot.updated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex items-center gap-2 ml-4'>
                        {!isBooked && (
                          <button
                            onClick={() =>
                              handleDelete(
                                slot.timeslot_id,
                                slot.service_name,
                                slot.day
                              )
                            }
                            className='inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200'
                            title='Delete timeslot'
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
                            Delete
                          </button>
                        )}

                        {isBooked && (
                          <div className='flex items-center gap-1 text-red-600 text-sm'>
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
                                d='M12 15v2m0 0v2m0-2h2m-2 0H9m3-6V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v6z'
                              />
                            </svg>
                            <span>Cannot delete (booked)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h4 className='font-medium text-green-800'>Timeslot Summary</h4>
            <p className='text-sm text-green-600 mt-1'>
              Total: {timeslots.length} timeslots • Available:{" "}
              {timeslots.filter((s) => !s.is_booked && s.is_available).length} •
              Booked:{" "}
              {timeslots.filter((s) => s.is_booked || !s.is_available).length}
            </p>
          </div>
          <div className='text-right'>
            <p className='text-sm text-green-600'>
              {timeslots.filter((s) => !s.is_booked && s.is_available).length >
              0
                ? "You have available slots for booking"
                : "All slots are currently booked"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
