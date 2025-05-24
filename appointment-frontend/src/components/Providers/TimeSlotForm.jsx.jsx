// src/components/TimeslotForm.jsx
import React, { useState } from "react";

export default function TimeslotForm({ onCreate }) {
  const [timeslot, setTimeslot] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const handleChange = (e) => {
    setTimeslot({ ...timeslot, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(timeslot);
    setTimeslot({ date: "", startTime: "", endTime: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mt-6">
      <h2 className="text-xl font-semibold mb-2">Add a Timeslot</h2>
      <input
        type="date"
        name="date"
        value={timeslot.date}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border rounded"
        required
      />
      <input
        type="time"
        name="startTime"
        value={timeslot.startTime}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border rounded"
        required
      />
      <input
        type="time"
        name="endTime"
        value={timeslot.endTime}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border rounded"
        required
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Create Timeslot
      </button>
    </form>
  );
}
