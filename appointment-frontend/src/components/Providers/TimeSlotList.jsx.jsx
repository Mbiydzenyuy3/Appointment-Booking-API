// src/components/TimeslotList.jsx
import React, { useState } from "react";

export default function TimeslotList({ timeslots = [], onDelete }) {
  const [search, setSearch] = useState("");

  const filteredTimeslots = (timeslots || []).filter((slot) =>
    slot.date.includes(search)
  );

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
      <ul className="space-y-3">
        {filteredTimeslots.map((slot, index) => (
          <li
            key={index}
            className="p-4 bg-white shadow rounded flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{slot.date}</p>
              <p>
                {slot.startTime} - {slot.endTime}
              </p>
            </div>
            <button
              onClick={() => onDelete(index)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
