// src/pages/ProviderDashboard.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Header from "../components/Header.jsx";
import ServiceForm from "../components/Providers/ServiceForm.jsx";
import ServiceList from "../components/Providers/ServiceList.jsx";
import TimeslotForm from "../components/Providers/TimeSlotForm.jsx";
import TimeslotList from "../components/Providers/TimeSlotList.jsx";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const handleDeleteService = (indexToDelete) => {
    setServices((prevServices) =>
      prevServices.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleCreateService = (newService) => {
    setServices((prev) => [...prev, newService]);
  };

  const handleDeleteTimeSlot = (indexToDelete) => {
    setServices((prevTimeSlot) =>
      prevTimeSlot.filter((_, index) => index !== indexToDelete)
    );
  };

  const handleCreateTimeSlot = (newTimeSlot) => {
    setTimeSlots((prev) => [...prev, newTimeSlot]);
  };

  return (
    <div className="min-h-screen bg-green-50 p-6">
      <Header />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">
          Provider Dashboard
        </h1>
      </div>

      <p className="text-lg text-gray-700 mb-6">
        Welcome, {user?.email || "Provider"}!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Services Section */}
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-semibold mb-2">Your Services</h2>
          <ServiceForm onCreate={handleCreateService} />
          <ServiceList services={services} onDelete={handleDeleteService} />
        </div>

        {/* Timeslots Section */}
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-semibold mb-2">Your Timeslots</h2>
          <TimeslotForm onCreate={handleCreateTimeSlot} />
          <TimeslotList timeSlots={timeSlots} onDelete={handleDeleteTimeSlot} />
        </div>
      </div>
    </div>
  );
}
