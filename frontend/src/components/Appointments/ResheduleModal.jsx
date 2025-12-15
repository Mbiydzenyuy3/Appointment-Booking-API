// src/components/Appointments/RescheduleModal.jsx
import React, { useState } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

Modal.setAppElement("#root");

export default function RescheduleModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate
}) {
  const [selectedDate, setSelectedDate] = useState(new Date(initialDate));

  const handleSubmit = () => {
    onSubmit(selectedDate);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className='bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-32 outline-none'
      overlayClassName='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'
    >
      <h2 className='text-xl font-semibold mb-4'>Reschedule Appointment</h2>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        showTimeSelect
        timeFormat='HH:mm'
        timeIntervals={30}
        dateFormat='MMMM d, yyyy h:mm aa'
        className='w-full p-2 border rounded mb-4'
      />
      <div className='flex justify-end gap-2'>
        <button
          onClick={onClose}
          className='px-4 py-2 rounded bg-gray-300 hover:bg-gray-400'
        >
          Cancel
        </button>
        <button onClick={handleSubmit} className='btn-primary'>
          Confirm
        </button>
      </div>
    </Modal>
  );
}
