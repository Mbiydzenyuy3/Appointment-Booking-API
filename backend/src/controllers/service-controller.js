import * as ServiceService from "../services/services-service.js";
import { logError, logDebug } from "../utils/logger.js";
import ProviderModel from "../models/provider-model.js";

// Create a new service
export async function create(req, res, next) {
  try {
    const userId = req.user?.user_id;
    const { name, description, price, durationMinutes } = req.body;

    const provider = await ProviderModel.findByUserId(userId);
    if (!provider?.provider_id) {
      return res
        .status(403)
        .json({ message: "You must have a provider profile first." });
    }

    const providerId = provider.provider_id;

    logDebug("createService: input", {
      providerId,
      name,
      description,
      price,
      durationMinutes,
    });

    const service = await ServiceService.createServices({
      providerId,
      name,
      description,
      price,
      durationMinutes,
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (err) {
    logError("createService controller error", err);
    next(err);
  }
}

// List all services for the authenticated provider
export async function list(req, res, next) {
  try {
    const userId = req.user?.user_id;

    const provider = await ProviderModel.findByUserId(userId);
    if (!provider?.provider_id) {
      return res
        .status(403)
        .json({ message: "You must have a provider profile first." });
    }

    const services = await ServiceService.listServicesForProvider(
      provider.provider_id
    );
    return res.status(200).json({ success: true, data: services });
  } catch (err) {
    logError("listServices controller error", err);
    next(err);
  }
}

// Update a service by ID
export async function update(req, res, next) {
  try {
    const { serviceId } = req.params;
    const updates = req.body;

    const updated = await ServiceService.updateService(serviceId, updates);

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updated,
    });
  } catch (err) {
    logError("updateService controller error", err);
    next(err);
  }
}

// Delete a service by ID
export async function remove(req, res, next) {
  try {
    const { serviceId } = req.params;

    await ServiceService.deleteService(serviceId);

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (err) {
    logError("deleteService controller error", err);
    next(err);
  }
}
