import React from "react";

export default function ServiceList({ services = [], onDelete }) {
  return (
    <div className='mt-6'>
      <h2 className='text-xl font-semibold mb-2'>Your Services</h2>
      <ul className='space-y-3'>
        {(services || []).map((service, index) => (
          <li
            key={index}
            className='p-4 bg-white shadow rounded flex justify-between items-center'
          >
            <div>
              <p className='font-bold'>{service.service_name}</p>
              <p>{service.description}</p>
              <p>${service.price}</p>
              <p>{service.duration_minutes}</p>
            </div>
            <button
              onClick={() => onDelete(service.service_id)}
              className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
