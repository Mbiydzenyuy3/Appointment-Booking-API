// src/controllers/service-controller.js
import * as ServiceService from "../services/services-service.js";
import { logError, logDebug } from "../utils/logger.js";
import ProviderModel from "../models/provider-model.js";

export async function create(req, res, next) {
  try {
    const userId = req.user?.user_id;
    const { name, description, price, durationMinutes } = req.body;

    // 🔍 Look up provider_id from providers table
    const provider = await ProviderModel.findByUserId(userId);

    if (!provider || !provider.provider_id) {
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

// List services (all for clients, own for providers)
export async function list(req, res, next) {
  try {
    const userType = req.user?.user_type;
    const userId = req.user?.user_id;

    let services;

    if (userType === "provider") {
      const provider = await ProviderModel.findByUserId(userId);
      if (!provider?.provider_id) {
        return res
          .status(403)
          .json({ message: "You must have a provider profile first." });
      }
      services = await ServiceService.listServicesForProvider(
        provider.provider_id
      );
    } else {
      // Clients see all services from all providers
      services = await ServiceService.listAllServices();
    }

    return res.status(200).json({ success: true, data: services });
  } catch (err) {
    logError("listServices controller error", err);
    next(err);
  }
}

export async function listByProvider(req, res) {
  try {
    const providerId = req.params.providerId;
    const services = await ServiceService.getServicesByProviderId(providerId);
    res.status(200).json({ success: true, data: services });
  } catch (err) {
    console.error("Failed to list services by provider:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function update(req, res, next) {
  try {
    const userId = req.user?.user_id;
    const { serviceId } = req.params;
    const updates = req.body;

    const provider = await ProviderModel.findByUserId(userId);
    if (!provider || !provider.provider_id) {
      return res
        .status(403)
        .json({ message: "You must have a provider profile first." });
    }

    updates.providerId = provider.provider_id;

    const updatedService = await ServiceService.updateService(
      serviceId,
      updates
    );
    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (err) {
    logError("updateService controller error", err);
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { serviceId } = req.params;

    const deletedService = await ServiceService.deleteService(serviceId);
    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      data: deletedService,
    });
  } catch (err) {
    logError("deleteService controller error", err);
    next(err);
  }
}
