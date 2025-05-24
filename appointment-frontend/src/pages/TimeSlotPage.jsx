// src/pages/TimeSlotPage.jsx
import React from "react";
import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useParams } from "react-router-dom";

export default function TimeSlotPage() {
  const { slotId } = useParams();
  const [slot, setSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSlot() {
      try {
        const response = await api.get(`/slots/${slotId}`);
        setSlot(response.data);
      } catch (error) {
        console.error("Failed to load slot", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSlot();
  }, [slotId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Slot Details</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : slot ? (
        <div className="bg-white p-4 shadow rounded">
          <p>
            <strong>Time:</strong> {new Date(slot.time).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong> {slot.isBooked ? "Booked" : "Available"}
          </p>
          <p>
            <strong>Provider:</strong> {slot.provider?.name || "Unknown"}
          </p>
        </div>
      ) : (
        <p>Slot not found.</p>
      )}
    </div>
  );
}
