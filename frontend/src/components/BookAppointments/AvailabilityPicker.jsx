import React, { useState, useEffect } from "react";
import api from "../../services/api.js";

// Get user's time zone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const AvailabilityPicker = ({ providerId, onSlotSelect, selectedSlotId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch available slots for the current month
  const fetchAvailableSlots = async (month = currentMonth) => {
    if (!providerId) return;

    setLoading(true);
    try {
      // Get start and end of month
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      // Fetch slots for the entire month
      const response = await api.get(
        `/slots/search/available?providerId=${providerId}&limit=1000`
      );
      const slots = response.data.data || [];

      // Filter slots for current month
      const monthSlots = slots.filter((slot) => {
        const slotDate = new Date(slot.day);
        return slotDate >= startOfMonth && slotDate <= endOfMonth;
      });

      setAvailableSlots(monthSlots);
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, [providerId, currentMonth]);

  // Check if a date has available slots
  const hasAvailableSlots = (date) => {
    return availableSlots.some((slot) => slot.day === date);
  };

  // Get slots for a specific date
  const getSlotsForDate = (date) => {
    return availableSlots.filter((slot) => slot.day === date);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (hasAvailableSlots(date)) {
      setSelectedDate(date);
    }
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    onSlotSelect(slot);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      const dateString = currentDate.toISOString().split("T")[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = dateString === new Date().toISOString().split("T")[0];
      const isPast = currentDate < new Date();
      const hasSlots = hasAvailableSlots(dateString);

      days.push({
        date: new Date(currentDate),
        dateString,
        isCurrentMonth,
        isToday,
        isPast,
        hasSlots,
        isSelected: selectedDate === dateString
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className='availability-picker'>
      {/* Month Navigation */}
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={goToPreviousMonth}
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          aria-label='Previous month'
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
              d='M15 19l-7-7 7-7'
            />
          </svg>
        </button>

        <div className='text-center'>
          <h3 className='text-lg font-semibold text-gray-900'>
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric"
            })}
          </h3>
          <p className='text-xs text-gray-500 mt-1'>
            Times shown in {userTimeZone.replace("_", " ")}
          </p>
        </div>

        <button
          onClick={goToNextMonth}
          className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          aria-label='Next month'
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
              d='M9 5l7 7-7 7'
            />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className='grid grid-cols-7 gap-1 mb-4'>
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className='p-2 text-center text-sm font-medium text-gray-500'
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateSelect(day.dateString)}
            disabled={!day.hasSlots || day.isPast}
            className={`
              p-2 text-center text-sm rounded-lg transition-all duration-200 touch-target
              ${day.isCurrentMonth ? "text-gray-900" : "text-gray-400"}
              ${day.isToday ? "bg-blue-100 text-blue-600 font-semibold" : ""}
              ${day.isSelected ? "bg-green-500 text-white" : ""}
              ${
                day.hasSlots && !day.isPast && !day.isSelected
                  ? "hover:bg-green-100 hover:text-green-700 bg-green-50 text-green-700"
                  : ""
              }
              ${
                (!day.hasSlots || day.isPast) && day.isCurrentMonth
                  ? "text-gray-300 cursor-not-allowed"
                  : ""
              }
              ${!day.isCurrentMonth ? "cursor-default" : ""}
            `}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>

      {/* Time Slots for Selected Date */}
      {selectedDate && (
        <div className='border-t pt-4'>
          <h4 className='text-md font-medium text-gray-900 mb-3'>
            Available times for{" "}
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric"
            })}
          </h4>

          {getSlotsForDate(selectedDate).length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <svg
                className='w-12 h-12 mx-auto mb-3 text-gray-300'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <p className='text-sm'>No available time slots for this date</p>
              <p className='text-xs mt-1'>Try selecting a different date</p>
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-2 max-h-48 overflow-y-auto'>
              {getSlotsForDate(selectedDate).map((slot) => {
                // Check if slot time is in the past
                const slotDateTime = new Date(
                  `${selectedDate}T${slot.start_time}`
                );
                const isPast = slotDateTime < new Date();
                const isDisabled = isPast;

                return (
                  <button
                    key={slot.timeslot_id}
                    onClick={() => !isDisabled && handleSlotSelect(slot)}
                    disabled={isDisabled}
                    className={`
                      p-3 text-center rounded-lg border-2 transition-all duration-200 touch-target
                      ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                      ${
                        selectedSlotId === slot.timeslot_id
                          ? "border-green-500 bg-green-50 text-green-700 shadow-md transform scale-105"
                          : isDisabled
                            ? "border-gray-300 text-gray-400"
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700 hover:shadow-sm"
                      }
                    `}
                    aria-label={`Select time slot ${new Date(
                      `2000-01-01T${slot.start_time}`
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true
                    })} - ${slot.name}${isDisabled ? " (unavailable)" : ""}`}
                  >
                    <div className='font-medium'>
                      {new Date(
                        `2000-01-01T${slot.start_time}`
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                      })}
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {slot.name}
                    </div>
                    {selectedSlotId === slot.timeslot_id && (
                      <div className='mt-1'>
                        <svg
                          className='w-4 h-4 mx-auto text-green-600'
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
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className='text-center py-4'>
          <div className='inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600'></div>
          <p className='text-sm text-gray-600 mt-2'>Loading availability...</p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityPicker;
