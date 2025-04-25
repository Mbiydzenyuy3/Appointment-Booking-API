import express from "express";
import * as ProviderController from "../controllers/provider-controller.js"

const router = express.Router();
router.get("/", ProviderController.listProviders);
export default router;
