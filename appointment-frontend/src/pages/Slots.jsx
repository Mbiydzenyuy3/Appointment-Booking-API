// src/pages/SlotPage.jsx
import React from "react";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SlotPage() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const response = await api.get(`/slots/provider/${providerId}`);
        setSlots(response.data);
      } catch (error) {
        console.error("Failed to load slots", error);
        toast.error("Failed to load slots");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSlots();
  }, [providerId]);

  const handleBook = async (slotId) => {
    try {
      await api.post("/appointments", { slotId });
      toast.success("Appointment booked successfully");
      navigate("/appointments");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to book appointment"
      );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Time Slots</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {slots.map((slot) => (
            <div key={slot._id} className="p-4 bg-white shadow rounded">
              <p>{new Date(slot.time).toLocaleString()}</p>
              {!slot.isBooked ? (
                <button
                  onClick={() => handleBook(slot._id)}
                  className="text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                >
                  Book
                </button>
              ) : (
                <p className="text-red-500">Booked</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
