// src/components/ServiceForm.jsx
import React, { useState } from "react";

export default function ServiceForm({ onCreate }) {
  const [service, setService] = useState({
    name: "",
    description: "",
    duration_minutes: "",
    price: "",
  });

  const handleChange = (e) => {
    setService({ ...service, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const ServiceValues = {
      // provider_id: service.provider_id,
      name: service.service_name,
      description: service.description,
      price: Number(service.price),
      durationMinutes: Number(service.duration_minutes),
    };

    onCreate(ServiceValues);

    setService({
      service_name: "",
      description: "",
      price: "",
      duration_minutes: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded">
      <h2 className="text-xl font-semibold mb-2">Add a Service</h2>
      <input
        type="text"
        name="service_name"
        value={service.service_name}
        onChange={handleChange}
        placeholder="Service name"
        className="block w-full mb-2 p-2 border rounded"
        required
      />
      <textarea
        name="description"
        value={service.description}
        onChange={handleChange}
        placeholder="Description"
        className="block w-full mb-2 p-2 border rounded"
        required
      />

      <input
        type="number"
        name="price"
        value={service.price}
        onChange={handleChange}
        placeholder="Price"
        className="block w-full mb-2 p-2 border rounded"
        required
      />

      <input
        type="number"
        name="duration_minutes"
        value={service.duration_minutes}
        onChange={handleChange}
        placeholder="duration Minutes"
        className="block w-full mb-2 p-2 border rounded"
        required
      />

      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Create Service
      </button>
    </form>
  );
}
