import express from 'express'
import * as ServiceController from '../controllers/service-controller.js'
import { validate } from '../middlewares/validate-middleware.js'
import authMiddleware from '../middlewares/auth-middleware.js'
import { serviceSchema } from '../validators/service-validator.js'

const router = express.Router()

/**
 * @swagger
 * /services/create:
 *   post:
 *     summary: Create a new service
 *
 */
router.post(
  '/create',
  authMiddleware,
  validate(serviceSchema),
  ServiceController.create
)

/**
 * @swagger
 * /services:
 *   get:
 *     summary: List all services for the authenticated provider
 */
router.get('/', authMiddleware, ServiceController.list)

/**
 * @swagger
 * /services/provider/{providerId}:
 *   get:
 *     summary: List services by provider ID
 */
router.get(
  '/provider/:providerId',
  authMiddleware,
  ServiceController.listByProvider
)

/**
 * @swagger
 * /services/{serviceId}:
 *   put:
 *     summary: Update a service by ID
 */
router.put(
  '/:serviceId',
  authMiddleware,
  validate(serviceSchema),
  ServiceController.update
)

/**
 * @swagger
 * /services/{serviceId}:
 *   delete:
 *     summary: Delete a service by ID
 */
router.delete('/:serviceId', authMiddleware, ServiceController.remove)

export default router
