import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function RescheduleModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(new Date(initialDate));
    }
  }, [initialDate]);

  const handleSubmit = () => {
    onSubmit(selectedDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 safe-area-bottom'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
        <div className='p-4 sm:p-6 border-b border-gray-100'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold text-gray-900'>
              Reschedule Appointment
            </h2>
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
          </div>
          <p className='text-gray-600 mt-1 text-sm'>
            Select a new date and time for your appointment
          </p>
        </div>

        <div className='p-4 sm:p-6'>
          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-3'>
              Choose New Date & Time
            </label>
            <div className='mobile-datepicker-wrapper'>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                showTimeSelect
                timeFormat='HH:mm'
                timeIntervals={30}
                dateFormat='MMMM d, yyyy h:mm aa'
                minDate={new Date()}
                className='input-field w-full touch-target'
                popperClassName='mobile-datepicker-popper'
                calendarClassName='mobile-datepicker-calendar'
                wrapperClassName='w-full'
                inline={false}
                showPopperArrow={false}
              />
            </div>
          </div>

          <div className='bg-green-50 border border-green-200 rounded-lg p-3 mb-6'>
            <div className='flex items-center'>
              <svg
                className='w-5 h-5 text-green-600 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
                  clipRule='evenodd'
                />
              </svg>
              <div>
                <p className='text-sm font-medium text-green-800'>
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
                <p className='text-sm text-green-600'>
                  {selectedDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-3'>
            <button
              onClick={onClose}
              className='flex-1 btn btn-secondary py-3 touch-target text-sm sm:text-base'
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className='flex-1 btn btn-primary py-3 touch-target text-sm sm:text-base'
            >
              Confirm Reschedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
