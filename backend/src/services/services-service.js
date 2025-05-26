// src/services/services-service.js
import * as ServiceModel from "../models/service-model.js";
import { logError, logDebug } from "../utils/logger.js";

// Create a new service
export async function createServices(serviceData) {
  try {
    logDebug("createService: input", serviceData);
    const newService = await ServiceModel.createService(serviceData);
    logDebug("createService: created", newService);
    return newService;
  } catch (err) {
    logError("createService: failed", err);
    throw err;
  }
}

// Get a single service by ID
export async function getServiceById(serviceId) {
  try {
    const service = await ServiceModel.findById(serviceId);
    if (!service) {
      const err = new Error("Service not found");
      err.status = 404;
      throw err;
    }
    return service;
  } catch (err) {
    logError("getServiceById: failed", err);
    throw err;
  }
}

// List all services
export async function listServicesForProvider(providerId) {
  try {
    return await ServiceModel.findByProviderId(providerId);
  } catch (err) {
    logError("listServicesForProvider: failed", err);
    throw err;
  }
}

// Delete a service by ID
export async function deleteService(serviceId) {
  try {
    const deleted = await ServiceModel.deleteById(serviceId);
    if (!deleted) {
      const err = new Error("Service not found or already deleted");
      err.status = 404;
      throw err;
    }
    return deleted;
  } catch (err) {
    logError("deleteService: failed", err);
    throw err;
  }
}

// Update a service
export async function updateService(serviceId, updates) {
  try {
    const updatedService = await ServiceModel.updateById(serviceId, updates);
    if (!updatedService) {
      const err = new Error("Service not found");
      err.status = 404;
      throw err;
    }
    return updatedService;
  } catch (err) {
    logError("updateService: failed", err);
    throw err;
  }
}
