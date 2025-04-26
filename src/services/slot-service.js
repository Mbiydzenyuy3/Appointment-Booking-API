//services/slot-service.js
import SlotModel from "../models/slot-model.js";

export async function createSlot({ providerId, startTime, endTime }) {
  return SlotModel.create({providerId, startTime, endTime})
}

export async function getSlotsByProvider(providerId) {
  return SlotModel.getByProvider(providerId)
}