import React from "react";

export default function TimeSlotList({ timeslots = [], onDelete }) {
  // Format time helper function
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "booked":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
        );
      case "booked":
        return (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
              clipRule='evenodd'
            />
          </svg>
        );
      case "unavailable":
        return (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z'
              clipRule='evenodd'
            />
          </svg>
        );
      default:
        return (
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
              clipRule='evenodd'
            />
          </svg>
        );
    }
  };

  if (!timeslots || timeslots.length === 0) {
    return (
      <div className='text-center py-8'>
        <div className='text-4xl mb-4'>⏰</div>
        <p className='text-gray-500 mb-2'>No timeslots available</p>
        <p className='text-sm text-gray-400'>
          Create timeslots for your services to get started.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {timeslots.map((timeslot, index) => (
        <div
          key={timeslot.timeslot_id || index}
          className='bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-4 sm:p-6 hover-lift'
        >
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            {/* Timeslot Details */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between mb-3'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 truncate'>
                    {timeslot.service_name || "Service"}
                  </h3>
                  <p className='text-sm text-gray-500 mt-1'>
                    Provider ID: {timeslot.provider_id || "N/A"}
                  </p>
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    timeslot.status
                  )}`}
                >
                  {getStatusIcon(timeslot.status)}
                  {timeslot.status || "Unknown"}
                </span>
              </div>

              {/* Time and Date Info */}
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
                  <span className='font-medium'>Time:</span>
                  <span>
                    {formatTime(timeslot.start_time)} -{" "}
                    {formatTime(timeslot.end_time)}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <svg
                    className='w-4 h-4 text-gray-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='font-medium'>Date:</span>
                  <span>{formatDate(timeslot.date)}</span>
                </div>
              </div>

              {/* Additional Details */}
              {(timeslot.max_bookings || timeslot.current_bookings) && (
                <div className='mt-3 flex items-center gap-4 text-sm text-gray-500'>
                  {timeslot.max_bookings && (
                    <span className='flex items-center gap-1'>
                      <svg
                        className='w-4 h-4'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z' />
                      </svg>
                      Max: {timeslot.max_bookings} bookings
                    </span>
                  )}
                  {timeslot.current_bookings !== undefined && (
                    <span className='flex items-center gap-1'>
                      <svg
                        className='w-4 h-4'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Current: {timeslot.current_bookings} bookings
                    </span>
                  )}
                </div>
              )}

              {/* Notes or Description */}
              {timeslot.notes && (
                <div className='mt-3'>
                  <p className='text-sm text-gray-600 bg-gray-50 rounded-lg p-3'>
                    <span className='font-medium'>Notes:</span> {timeslot.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className='flex flex-row sm:flex-col gap-2 sm:w-auto w-full'>
              <button
                onClick={() => onDelete(timeslot.timeslot_id)}
                className='flex-1 sm:flex-none btn btn-secondary text-sm px-4 py-2 touch-target hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200'
                aria-label={`Delete timeslot for ${timeslot.service_name}`}
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
