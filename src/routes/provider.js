// src/routes/provider.js
import express from "express";
import * as ProviderController from "../controllers/provider-controller.js";

const router = express.Router();

// Route for listing all providers
// This route accepts GET requests to '/providers'
// and retrieves the list of all providers from the database.
router.get("/", ProviderController.listProviders);

export default router;
