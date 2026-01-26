import React, { useState, useEffect } from "react";
import api from "../../services/api.js";

// Get user's time zone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const AvailabilityPicker = ({
  providerId,
  serviceId,
  onSlotSelect,
  selectedSlotId
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch available slots for the current month
  const fetchAvailableSlots = async (month = currentMonth) => {
    if (!providerId || !serviceId) return;

    setLoading(true);
    try {
      // Get start and end of month
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      // Fetch slots for the entire month
      const response = await api.get(
        `/slots/search/available?providerId=${providerId}&serviceId=${serviceId}&limit=1000`
      );
      const slots = response.data.data || [];
      console.log("Fetched slots:", slots);

      // Filter slots for current month
      const monthSlots = slots.filter((slot) => {
        const slotDate = new Date(slot.day);
        return slotDate >= startOfMonth && slotDate <= endOfMonth;
      });
      console.log("Month slots:", monthSlots);

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
  }, [providerId, serviceId, currentMonth]);

  // Check if a date has available slots
  const hasAvailableSlots = (date) => {
    return availableSlots.some((slot) => slot.day === date);
  };

  // Get slots for a specific date
  const getSlotsForDate = (date) => {
    return availableSlots.filter((slot) => slot.day === date);
  };

  // Navigate to previous month
  const goToPreviousMonth = (e) => {
    e.preventDefault();
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  // Navigate to next month
  const goToNextMonth = (e) => {
    e.preventDefault();
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
    <div className='availability-picker flex flex-col md:flex-row h-full md:min-h-[400px]'>
      {/* Left Side: Calendar */}
      <div className='flex-1 md:pr-6'>
        <div className='flex items-center justify-center relative mb-6'>
          <button
            onClick={goToPreviousMonth}
            className='absolute left-0 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600'
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
          <h3 className='text-lg font-bold text-gray-900'>
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric"
            })}
          </h3>
          <button
            onClick={goToNextMonth}
            className='absolute right-0 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600'
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

        <div className='grid grid-cols-7 gap-1 mb-2'>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className='text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-2'
            >
              {day.charAt(0)}
            </div>
          ))}

          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                handleDateSelect(day.dateString);
              }}
              disabled={!day.hasSlots || day.isPast}
              className={`
                relative h-10 w-10 mx-auto flex items-center justify-center text-sm rounded-full transition-all duration-200
                ${
                  day.isSelected
                    ? "bg-green-600 text-white font-bold shadow-md"
                    : day.hasSlots && !day.isPast
                      ? "bg-green-50 text-green-700 font-semibold hover:bg-green-100"
                      : "text-gray-400 cursor-default"
                }
                ${day.isToday && !day.isSelected ? "ring-1 ring-green-600 text-green-700" : ""}
                ${!day.isCurrentMonth ? "opacity-0 pointer-events-none" : ""}
              `}
            >
              {day.date.getDate()}
              {day.hasSlots && !day.isPast && !day.isSelected && (
                <span className='absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full'></span>
              )}
            </button>
          ))}
        </div>

        {/* Timezone Footer */}
        <div className='mt-6 pt-4 border-t border-gray-100 hidden md:block'>
          <p className='text-xs font-semibold text-gray-500 flex items-center gap-1'>
            🌍 {userTimeZone.replace("_", " ")}
          </p>
        </div>
      </div>

      {/* Right Side: Slots */}
      <div className='md:w-72 md:border-l border-gray-200 md:pl-6 flex flex-col mt-6 md:mt-0'>
        {selectedDate ? (
          <>
            <h4 className='text-md font-semibold text-gray-900 mb-4 sticky top-0 bg-white z-10'>
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric"
              })}
            </h4>

            <div className='flex-1 overflow-y-auto pr-2 max-h-[300px] md:max-h-[360px] space-y-2 custom-scrollbar'>
              {getSlotsForDate(selectedDate).length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <p className='text-sm'>No available time slots</p>
                </div>
              ) : (
                getSlotsForDate(selectedDate).map((slot) => {
                  const slotDateTime = new Date(
                    `${selectedDate}T${slot.start_time}`
                  );
                  const now = new Date();
                  const oneHourFromNow = new Date(
                    now.getTime() + 60 * 60 * 1000
                  );
                  const isPast = slotDateTime < oneHourFromNow;
                  const isDisabled = isPast;

                  return (
                    <button
                      key={slot.timeslot_id}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isDisabled) handleSlotSelect(slot);
                      }}
                      disabled={isDisabled}
                      className={`
                        w-full py-3 px-4 text-center rounded-lg border transition-all duration-200 font-semibold text-sm
                        ${
                          selectedSlotId === slot.timeslot_id
                            ? "bg-green-600 border-green-600 text-white shadow-md"
                            : isDisabled
                              ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                              : "border-green-200 text-green-700 hover:border-green-600 hover:bg-green-50"
                        }
                      `}
                    >
                      {new Date(
                        `2000-01-01T${slot.start_time}`
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                      })}
                    </button>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center h-full text-gray-400 py-12 md:py-0'>
            <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
              <svg
                className='w-6 h-6 text-gray-400'
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
            </div>
            <p className='text-sm font-medium'>Select a date to view times</p>
          </div>
        )}
      </div>

      {loading && (
        <div className='absolute inset-0 bg-white/80 flex items-center justify-center z-20'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600'></div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityPicker;
