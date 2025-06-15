import * as appointmentService from '../services/appointment-service.js'
import { logError } from '../utils/logger.js'

export async function CreateAppointment(req, res) {
  try {
    const { timeslotId } = req.body
    const userId = req.user?.user_id

    if (!userId || !timeslotId) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    const appointment = await appointmentService.book({ userId, timeslotId })

    return res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment,
    })
  } catch (err) {
    logError('Create appointment failed', err)
    return res
      .status(500)
      .json({ message: err.message || 'Internal Server Error' })
  }
}

export async function cancelAppointment(req, res, next) {
  try {
    const { appointmentId } = req.params
    const result = await appointmentService.cancel(appointmentId)

    if (!result) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    return res.json({ message: 'Appointment cancelled', data: result })
  } catch (err) {
    logError('Cancel appointment failed', err)
    next(err)
  }
}

export async function listAppointments(req, res, next) {
  try {
    const userId = req.user?.user_id
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const filters = {
      status,
      startDate,
      endDate,
      limit: Number(limit),
      offset,
    }

    const appointments = await appointmentService.list(userId, filters)

    return res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      data: appointments,
    })
  } catch (err) {
    logError('List appointments failed', err)
    next(err)
  }
}
