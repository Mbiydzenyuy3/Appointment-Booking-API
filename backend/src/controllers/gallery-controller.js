// src/controllers/gallery-controller.js
import * as GalleryModel from "../models/gallery-model.js";
import { addGalleryItemSchema, updateGalleryItemSchema } from "../validators/gallery-validator.js";
import { logError } from "../utils/logger.js";
import ProviderModel from "../models/provider-model.js";

export async function addGalleryItem(req, res, next) {
  try {
    const userId = req.user.user_id;
    const provider = await ProviderModel.findByUserId(userId);
    if (!provider) {
      return res.status(404).json({ success: false, error_code: "PROVIDER_NOT_FOUND" });
    }

    const count = await GalleryModel.countByProvider(provider.provider_id);
    if (count >= 20) {
      return res.status(400).json({
        success: false,
        error_code: "GALLERY_LIMIT_REACHED",
        message: "Gallery limit reached (max 20 photos)"
      });
    }

    const { error, value } = addGalleryItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error_code: "VALIDATION_ERROR",
        message: error.details[0].message
      });
    }

    const newItem = await GalleryModel.addItem({
      providerId: provider.provider_id,
      image_url: value.imageUrl,
      caption: value.caption || null,
      display_order: 0
    });

    return res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    logError("addGalleryItem failed", err);
    next(err);
  }
}

export async function updateGalleryItem(req, res, next) {
  try {
    const { galleryId } = req.params;
    const userId = req.user.user_id;

    const provider = await ProviderModel.findByUserId(userId);
    if (!provider) {
      return res.status(404).json({ success: false, error_code: "PROVIDER_NOT_FOUND" });
    }

    const { error, value } = updateGalleryItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error_code: "VALIDATION_ERROR",
        message: error.details[0].message
      });
    }

    const updates = {};
    if (value.imageUrl !== undefined) updates.image_url = value.imageUrl;
    if (value.caption !== undefined) updates.caption = value.caption || null;

    const updated = await GalleryModel.updateItem(galleryId, provider.provider_id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error_code: "GALLERY_ITEM_NOT_FOUND" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    logError("updateGalleryItem failed", err);
    next(err);
  }
}

export async function deleteGalleryItem(req, res, next) {
  try {
    const { galleryId } = req.params;
    const userId = req.user.user_id;

    const provider = await ProviderModel.findByUserId(userId);
    if (!provider) {
      return res.status(404).json({ success: false, error_code: "PROVIDER_NOT_FOUND" });
    }

    const deleted = await GalleryModel.deleteItem(galleryId, provider.provider_id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error_code: "GALLERY_ITEM_NOT_FOUND",
        message: "Gallery item not found or already deleted"
      });
    }

    return res.status(200).json({ success: true, message: "Gallery item deleted" });
  } catch (err) {
    logError("deleteGalleryItem failed", err);
    next(err);
  }
}

export async function getProviderGallery(req, res, next) {
  try {
    const { providerId } = req.params;
    const items = await GalleryModel.listByProvider(providerId);
    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    logError("getProviderGallery failed", err);
    next(err);
  }
}
