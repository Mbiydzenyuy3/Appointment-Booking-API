import jwt from "jsonwebtoken"
import ProviderModel from "../models/provider-model.js";
import { logError } from "../utils/logger.js";

export async function create(req, res, next) {
  try {
    const providerData = req.body;
    const newProvider = await ProviderModel.create(providerData); // assuming a create function in the model

    // Generate JWT token for the newly created provider
    const token = jwt.sign(
      { sub: newProvider.id, role: "provider" }, // include role in token
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      success: true,
      message: "Provider created successfully",
      data: newProvider,
    });
  } catch (err) {
    logError("Error creating provider", err);
    next(err); // pass the error to the next middleware (e.g., global error handler)
  }
}

export async function list(req, res, next) {
  try {
    const providers = await ProviderModel.listAll();
    return res.status(200).json({
      success: true,
      message: "Providers fetched successfully",
      data: providers,
    });
  } catch (err) {
    logError("Error fetching providers", err);
    next(err);
  }
}


// export const create = async (req, res) => {
//   try {
//     const providerData = req.body;
//     const newProvider = await ProviderModel.create(providerData);
//     // Generate JWT token for the newly created provider
//     const token = jwt.sign(
//       { sub: newProvider.id, role: "provider" }, // include role in token
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     if (!userId) {
//       return res.status(400).json({ error: "Missing user ID" });
//     }

//     const provider = await ProviderModel.create({
//       name,
//       email,
//       userId,
//       service,
//     });
//     return res.status(200).json({
//       success: true,
//       message: "Providers fetched successfully",
//       data: provider,
//     });
//   } catch (err) {
//     logError("Error creating provider", err);
//     res.status(500).json({ error: "Failed to create service provider" });
//   }
// };

