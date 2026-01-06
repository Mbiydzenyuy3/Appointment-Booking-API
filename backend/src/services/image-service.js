import sharp from "sharp";
import axios from "axios";
import { logError, logDebug } from "../utils/logger.js";

/**
 * Image optimization service for WebP conversion and processing
 */
class ImageService {
  /**
   * Convert image URL to WebP format
   * @param {string} imageUrl - Original image URL
   * @param {Object} options - Conversion options
   * @returns {Promise<string>} WebP image URL or original if conversion fails
   */
  async convertToWebP(imageUrl, options = {}) {
    try {
      const {
        quality = 80,
        effort = 4,
        maxWidth = 1200,
        maxHeight = 1200
      } = options;

      logDebug("Converting image to WebP", { imageUrl, options });

      // Download the image
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 10000,
        headers: {
          "User-Agent": "Appointment-Booking-App/1.0"
        }
      });

      // Convert to WebP using Sharp
      const webpBuffer = await sharp(response.data)
        .resize(maxWidth, maxHeight, {
          fit: "inside",
          withoutEnlargement: true
        })
        .webp({
          quality,
          effort,
          smartSubsample: true
        })
        .toBuffer();

      // For now, return base64 data URL (in production, you'd upload to cloud storage)
      const base64WebP = `data:image/webp;base64,${webpBuffer.toString(
        "base64"
      )}`;

      logDebug("Image converted to WebP successfully", {
        originalSize: response.data.length,
        webpSize: webpBuffer.length,
        compressionRatio: (
          ((response.data.length - webpBuffer.length) / response.data.length) *
          100
        ).toFixed(1)
      });

      return base64WebP;
    } catch (error) {
      logError("Failed to convert image to WebP", error);
      // Return original URL if conversion fails
      return imageUrl;
    }
  }

  /**
   * Process multiple images to WebP
   * @param {string[]} imageUrls - Array of image URLs
   * @param {Object} options - Conversion options
   * @returns {Promise<string[]>} Array of WebP URLs
   */
  async processImagesToWebP(imageUrls, options = {}) {
    if (!Array.isArray(imageUrls)) {
      return [];
    }

    const webpPromises = imageUrls.map((url) =>
      url ? this.convertToWebP(url, options) : Promise.resolve("")
    );

    try {
      const results = await Promise.allSettled(webpPromises);
      return results.map((result) =>
        result.status === "fulfilled" ? result.value : ""
      );
    } catch (error) {
      logError("Failed to process images to WebP", error);
      return imageUrls; // Return originals if batch processing fails
    }
  }

  /**
   * Generate responsive image sizes
   * @param {string} imageUrl - Original image URL
   * @param {number[]} sizes - Array of widths to generate
   * @returns {Promise<Object>} Object with size URLs
   */
  async generateResponsiveImages(imageUrl, sizes = [400, 800, 1200]) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 10000
      });

      const results = {};

      for (const size of sizes) {
        const resizedBuffer = await sharp(response.data)
          .resize(size, null, {
            fit: "inside",
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toBuffer();

        results[size] = `data:image/webp;base64,${resizedBuffer.toString(
          "base64"
        )}`;
      }

      return results;
    } catch (error) {
      logError("Failed to generate responsive images", error);
      return {};
    }
  }

  /**
   * Optimize image for mobile (smaller size, WebP)
   * @param {string} imageUrl - Original image URL
   * @returns {Promise<string>} Optimized image URL
   */
  async optimizeForMobile(imageUrl) {
    return this.convertToWebP(imageUrl, {
      quality: 70,
      maxWidth: 800,
      maxHeight: 600
    });
  }
}

export default new ImageService();
