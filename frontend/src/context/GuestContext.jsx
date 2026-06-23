import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api.js";
import { identifyUser } from "../services/analytics.js";

const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
  const [guestData, setGuestData] = useState({
    email: localStorage.getItem("guestEmail") || null,
    bookings: [],
    pendingSignUp: false,
    lastBooking: null
  });

  // Save guest booking data
  const saveGuestBooking = (bookingData) => {
    const updatedBookings = [...guestData.bookings, bookingData];
    setGuestData((prev) => ({
      ...prev,
      bookings: updatedBookings,
      lastBooking: bookingData,
      email: bookingData.guest_email || prev.email
    }));

    // Store in localStorage
    localStorage.setItem(
      "guestEmail",
      bookingData.guest_email || guestData.email
    );
    localStorage.setItem("guestBookings", JSON.stringify(updatedBookings));
  };

  // Convert guest to registered user
  const convertToUser = async (userData) => {
    try {
      const response = await api.post("/auth/convert-guest", {
        guest_email: guestData.email,
        ...userData
      });

      if (response.data.success) {
        // Identify the user in analytics for stitching guest history
        identifyUser(response.data.data.user_id, {
          user_type: response.data.data.user_type,
          registration_source: "guest_conversion"
        });

        // Clear guest data
        setGuestData({
          email: null,
          bookings: [],
          pendingSignUp: false,
          lastBooking: null
        });
        localStorage.removeItem("guestEmail");
        localStorage.removeItem("guestBookings");

        return { success: true, data: response.data };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Conversion failed"
      };
    }
  };

  // Load guest data from localStorage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("guestEmail");
    const storedBookings = localStorage.getItem("guestBookings");

    if (storedEmail || storedBookings) {
      setGuestData((prev) => ({
        ...prev,
        email: storedEmail,
        bookings: storedBookings ? JSON.parse(storedBookings) : []
      }));
    }
  }, []);

  // Check if user has pending sign-up prompt
  const shouldPromptSignUp = () => {
    return guestData.bookings.length > 0 && !guestData.pendingSignUp;
  };

  // Mark sign-up as prompted
  const markSignUpPrompted = () => {
    setGuestData((prev) => ({ ...prev, pendingSignUp: true }));
  };

  return (
    <GuestContext.Provider
      value={{
        guestData,
        saveGuestBooking,
        convertToUser,
        shouldPromptSignUp,
        markSignUpPrompted
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => useContext(GuestContext);
