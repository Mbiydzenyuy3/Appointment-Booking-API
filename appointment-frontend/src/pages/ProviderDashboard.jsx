// src/pages/ProviderDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Header from "../components/Header.jsx";
import ServiceForm from "../components/Providers/ServiceForm.jsx";
import ServiceList from "../components/Providers/ServiceList.jsx";
import TimeslotForm from "../components/Providers/TimeSlotForm.jsx";
import TimeslotList from "../components/Providers/TimeSlotList.jsx";
import api from "../services/api.js";
import toast from "react-hot-toast";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.provider_id) return;

    const fetchData = async (providerId) => {
      try {
        const [servicesRes, slotsRes] = await Promise.all([
          api.get(`/services/provider/${providerId}`),
          api.get(`/slots/${providerId}`),
        ]);

        setServices(servicesRes.data.data);
        setTimeSlots(slotsRes.data.data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData(user.provider_id);
  }, [user]);

  const handleCreateService = async (newService) => {
    console.log("Creating service with data:", newService);
    try {
      const res = await api.post("/services/create", newService);
      setServices((prev) => [...prev, res.data.data]);
      toast.success("Service created");
    } catch (error) {
      console.error("Create service error:", error);
      toast.error("Failed to create service");
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await api.delete(`/services/${serviceId}`);
      setServices((prev) => prev.filter((s) => s.service_id !== serviceId));
      toast.success("Service deleted");
    } catch (error) {
      console.error("Delete service error:", error);
      toast.error("Failed to delete service");
    }
  };

  const handleCreateTimeSlot = async (slot) => {
    try {
      const res = await api.post("/slots/create", slot);
      setTimeSlots((prev) => [...prev, res.data.data]);
      toast.success("Timeslot created");
    } catch (error) {
      console.error("Create timeslot error:", error);
      toast.error("Failed to create timeslot");
    }
  };

  const handleDeleteTimeSlot = async (slotId) => {
    try {
      await api.delete(`/slots/${slotId}`);
      setTimeSlots((prev) => prev.filter((s) => s.timeslot_id !== slotId));
      toast.success("Timeslot deleted");
    } catch (error) {
      console.error("Delete timeslot error:", error);
      toast.error("Failed to delete timeslot");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-green-50 p-6">
        <Header />
        <p className="text-center text-lg text-gray-600 mt-10">
          You must be logged in to view this page.
        </p>
      </div>
    );
  }

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

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Services Section */}
          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-xl font-semibold mb-2">Your Services</h2>
            <ServiceForm onCreate={handleCreateService} />
            {services.length === 0 ? (
              <p className="text-gray-500 mt-4">No services yet.</p>
            ) : (
              <ServiceList services={services} onDelete={handleDeleteService} />
            )}
          </div>

          {/* Timeslots Section */}
          <div className="bg-white p-4 shadow rounded">
            <h2 className="text-xl font-semibold mb-2">Your Timeslots</h2>
            <TimeslotForm
              onCreate={handleCreateTimeSlot}
              services={services}
              providerId={user.provider_id}
            />
            {timeSlots.length === 0 ? (
              <p className="text-gray-500 mt-4">No timeslots yet.</p>
            ) : (
              <TimeslotList
                timeslots={timeSlots}
                onDelete={handleDeleteTimeSlot}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
