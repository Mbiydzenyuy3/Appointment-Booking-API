// src/components/Providers/TimeslotList.jsx
import React, { useState } from 'react'

export default function TimeslotList({ timeslots = [], onDelete }) {
  const [search, setSearch] = useState('')

  const filteredTimeslots = timeslots.filter((slot) =>
    (slot.day || '').includes(search)
  )

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Your Timeslots</h2>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by date (YYYY-MM-DD)"
        className="block w-full mb-4 p-2 border rounded"
      />

      {filteredTimeslots.length === 0 ? (
        <p className="text-gray-500">No timeslots found.</p>
      ) : (
        <ul className="space-y-3">
          {filteredTimeslots.map((slot) => (
            <li
              key={slot.timeslot_id || slot._id}
              className="p-4 bg-white shadow rounded flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{slot.service_name}</p>
                <p className="font-bold">{slot.day}</p>
                <p>
                  {slot.start_time} - {slot.end_time}
                </p>
              </div>
              <button
                onClick={() => onDelete(slot.timeslot_id || slot._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
