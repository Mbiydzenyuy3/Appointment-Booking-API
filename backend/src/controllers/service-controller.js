import * as ServiceService from "../services/services-service.js";
import { logError, logDebug } from "../utils/logger.js";
import ProviderModel from "../models/provider-model.js";

// Create a new service
export async function create(req, res, next) {
  try {
    const userId = req.user?.sub;
    const {
      name: service_name,
      description,
      price,
      durationMinutes: duration_minutes
    } = req.body;

    if (!service_name || !description || !price || !duration_minutes) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide service name, description, price, and duration."
      });
    }

    if (price <= 0 || duration_minutes <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price and duration must be positive numbers."
      });
    }

    const provider = await ProviderModel.findByUserId(userId);
    if (!provider?.provider_id) {
      return res.status(403).json({
        success: false,
        message: "Provider profile not found. Please contact support."
      });
    }

    const providerId = provider.provider_id;

    const service = await ServiceService.createServices({
      providerId,
      service_name,
      description,
      price,
      duration_minutes
    });

    return res.status(201).json({
      success: true,
      message: "Your service has been added successfully!",
      data: service
    });
  } catch (err) {
    logError("Create service error", err);
    next(err);
  }
}

// List services (public for all users - shows all services from all providers)
export async function list(req, res, next) {
  try {
    // Public endpoint - always return all services
    const services = await ServiceService.listAllServices();

    return res.status(200).json({ success: true, data: services });
  } catch (err) {
    logError("List services error", err);
    next(err);
  }
}

// List services by provider ID
export async function listByProvider(req, res, next) {
  try {
    const { providerId } = req.params;
    const services = await ServiceService.getServicesByProviderId(providerId);
    return res.status(200).json({ success: true, data: services });
  } catch (err) {
    logError("List services by provider error", err);
    next(err);
  }
}

// Search services
export async function search(req, res, next) {
  try {
    const { q } = req.query;
    const query = q ? q.trim() : "";
    const services = await ServiceService.searchServices(query);
    return res.status(200).json({ success: true, data: services });
  } catch (err) {
    logError("Search services error", err);
    next(err);
  }
}

// Update a service by ID
export async function update(req, res, next) {
  try {
    const { serviceId } = req.params;
    const {
      name: service_name,
      description,
      price,
      durationMinutes: duration_minutes
    } = req.body;
    const userId = req.user?.sub;

    if (!service_name || !description || !price || !duration_minutes) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide service name, description, price, and duration."
      });
    }

    if (price <= 0 || duration_minutes <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price and duration must be positive numbers."
      });
    }

    // Verify provider ownership
    const provider = await ProviderModel.findByUserId(userId);
    if (!provider?.provider_id) {
      return res.status(403).json({
        success: false,
        message: "Please create a business profile first."
      });
    }

    // Verify the service belongs to this provider
    const existingService = await ServiceService.getServiceById(serviceId);
    if (existingService.provider_id !== provider.provider_id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own services."
      });
    }

    const updates = { service_name, description, price, duration_minutes };
    const updated = await ServiceService.updateService(serviceId, updates);

    return res.status(200).json({
      success: true,
      message: "Your service has been updated successfully!",
      data: updated
    });
  } catch (err) {
    logError("Update service error", err);
    next(err);
  }
}

// Delete a service by ID
export async function remove(req, res, next) {
  try {
    const { serviceId } = req.params;
    const userId = req.user?.sub;

    // Verify provider ownership
    const provider = await ProviderModel.findByUserId(userId);
    if (!provider?.provider_id) {
      return res.status(403).json({
        success: false,
        message: "Please create a business profile first."
      });
    }

    // Verify the service belongs to this provider
    const existingService = await ServiceService.getServiceById(serviceId);
    if (existingService.provider_id !== provider.provider_id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own services."
      });
    }

    await ServiceService.deleteService(serviceId);

    return res.status(200).json({
      success: true,
      message: "Your service has been deleted successfully."
    });
  } catch (err) {
    logError("Delete service error", err);
    next(err);
  }
}
