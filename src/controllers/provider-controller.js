//controller/provider-controller.js
import ProviderModel from "../models/provider-model";

export async function listProviders(req, res, next) {
  try {
    const providers = await ProviderModel.listAll();
    res.json(providers);
  } catch (err) {
    next(err)
  }
}