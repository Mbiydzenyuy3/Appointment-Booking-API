import React, { useState } from "react";

export default function TimeslotForm({ onCreate, services = [] }) {
  const [timeslot, setTimeslot] = useState({
    day: "",
    startTime: "",
    endTime: "",
    serviceId: ""
  });

  const handleChange = (e) => {
    setTimeslot({ ...timeslot, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onCreate({
      day: timeslot.day,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
      serviceId: timeslot.serviceId
    });

    // Reset form
    setTimeslot({ day: "", startTime: "", endTime: "", serviceId: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='relative bg-white p-6 shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-shadow duration-300'
      style={{ zIndex: 10 }}
    >
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-800 mb-2'>
          Add a Timeslot
        </h2>
        <p className='text-gray-600 text-sm'>
          Create available time slots for your services
        </p>
      </div>

      <div className='space-y-5 mb-8'>
        <div>
          <label
            htmlFor='serviceId'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Service *
          </label>
          <select
            id='serviceId'
            name='serviceId'
            value={timeslot.serviceId}
            onChange={handleChange}
            className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-base bg-white'
            required
          >
            <option value=''>Select a service</option>
            {services.map((s) => (
              <option
                key={s.service_id || s._id}
                value={s.service_id || s._id}
                className='text-gray-800'
              >
                {s.service_name || s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor='day'
            className='block text-sm font-semibold text-gray-700 mb-2'
          >
            Date *
          </label>
          <input
            id='day'
            type='date'
            name='day'
            value={timeslot.day}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-base'
            required
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div>
            <label
              htmlFor='startTime'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              Start Time *
            </label>
            <input
              id='startTime'
              type='time'
              name='startTime'
              value={timeslot.startTime}
              onChange={handleChange}
              className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-base'
              required
            />
          </div>
          <div>
            <label
              htmlFor='endTime'
              className='block text-sm font-semibold text-gray-700 mb-2'
            >
              End Time *
            </label>
            <input
              id='endTime'
              type='time'
              name='endTime'
              value={timeslot.endTime}
              onChange={handleChange}
              className='block w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-base'
              required
            />
          </div>
        </div>
      </div>

      <div className='relative'>
        <button
          type='submit'
          className='form-submit-button w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2 min-h-[64px] touch-target transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border-2 border-transparent hover:border-green-800'
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
          aria-label='Create new timeslot'
        >
          <span className='flex items-center justify-center gap-3 text-lg'>
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
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            Add A Timeslot
          </span>
        </button>
      </div>
    </form>
  );
}
