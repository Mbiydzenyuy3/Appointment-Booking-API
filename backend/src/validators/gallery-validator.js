// src/validators/gallery-validator.js
import Joi from "joi";

export const addGalleryItemSchema = Joi.object({
  imageUrl: Joi.string().uri().max(2000).required().messages({
    "string.uri": "Image URL must be a valid URL (e.g. https://example.com/photo.jpg)",
    "string.empty": "Image URL is required",
    "any.required": "Image URL is required",
    "string.max": "URL must be under 2000 characters"
  }),
  caption: Joi.string().max(255).optional().allow("")
});

export const updateGalleryItemSchema = Joi.object({
  imageUrl: Joi.string().uri().max(2000).optional().messages({
    "string.uri": "Image URL must be a valid URL"
  }),
  caption: Joi.string().max(255).optional().allow("").allow(null)
}).min(1);
