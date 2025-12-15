// src/components/Slots/api.js
import axios from "axios";
export const createSlot = (slotData) => axios.post("/slots/create", slotData);
export const getSlotsByProvider = (providerId) =>
  axios.get(`/slots/${providerId}`);
export const updateSlot = (slotId, updatedData) =>
  axios.put(`/slots/${slotId}`, updatedData);
export const deleteSlot = (slotId) => axios.delete(`/slots/${slotId}`);
export const searchAvailableSlots = (params) =>
  axios.get("/slots/search/available", { params });
