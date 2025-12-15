// src/components/Providers/TimeslotForm.jsx
import React, { useState } from 'react'

export default function TimeslotForm({ onCreate, services = [] }) {
  const [timeslot, setTimeslot] = useState({
    day: '',
    startTime: '',
    endTime: '',
    serviceId: '',
  })

  const handleChange = (e) => {
    setTimeslot({ ...timeslot, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    onCreate({
      day: timeslot.day,
      startTime: timeslot.startTime,
      endTime: timeslot.endTime,
      serviceId: timeslot.serviceId,
    })

    // Reset form
    setTimeslot({ day: '', startTime: '', endTime: '', serviceId: '' })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 shadow rounded mt-6 space-y-4"
    >
      <h2 className="text-xl font-semibold">Add a Timeslot</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Service</label>
        <select
          name="serviceId"
          value={timeslot.serviceId}
          onChange={handleChange}
          className="block w-full p-2 border rounded"
          required
        >
          <option value="">Select a service</option>
          {services.map((s) => (
            <option key={s.service_id || s._id} value={s.service_id || s._id}>
              {s.service_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          name="day"
          value={timeslot.day}
          onChange={handleChange}
          className="block w-full p-2 border rounded"
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={timeslot.startTime}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input
            type="time"
            name="endTime"
            value={timeslot.endTime}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Create Timeslot
      </button>
    </form>
  )
}
