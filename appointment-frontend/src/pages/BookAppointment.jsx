import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiFetch from "../services/api.js";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";

const BookAppointmentPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchProviderAndSlots = async () => {
      try {
        setIsLoading(true);
        const [providerRes, slotsRes] = await Promise.all([
          apiFetch.get(`/providers/${providerId}`),
          apiFetch.get(
            `/timeslots/available?providerId=${providerId}&date=${selectedDate}`
          ),
        ]);
        setProvider(providerRes.data);
        setAvailableSlots(slotsRes.data);
      } catch (error) {
        toast.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderAndSlots();
  }, [providerId, selectedDate]);

  const handleBookSlot = async (slotId) => {
    try {
      setIsBooking(true);
      await apiFetch.post("/appointments", {
        providerId,
        timeSlotId: slotId,
      });
      toast.success("Appointment booked successfully!");
      navigate("/appointments");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to book appointment"
      );
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Book Appointment with {provider?.name}
      </h1>

      <div className="mb-6">
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Date
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="p-2 border rounded"
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Time Slots</h2>
        {availableSlots.length === 0 ? (
          <p>No available slots for this date.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSlots.map((slot) => (
              <div key={slot._id} className="bg-white p-4 rounded shadow">
                <p className="font-medium">
                  {format(parseISO(slot.startTime), "h:mm a")} -{" "}
                  {format(parseISO(slot.endTime), "h:mm a")}
                </p>
                <button
                  onClick={() => handleBookSlot(slot._id)}
                  disabled={isBooking}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isBooking ? "Booking..." : "Book Slot"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointmentPage;
