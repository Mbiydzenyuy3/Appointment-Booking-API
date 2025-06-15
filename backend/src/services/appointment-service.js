import { pool } from '../config/db.js'
import {
  emitAppointmentBooked,
  emitAppointmentCancelled,
} from '../sockets/socket.js'
import { logError, logInfo } from '../utils/logger.js'

// Book a new appointment
export async function book({ userId, timeslotId }) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const slotRes = await client.query(
      'SELECT * FROM time_slots WHERE timeslot_id = $1 FOR UPDATE',
      [timeslotId]
    )

    const slot = slotRes.rows[0]
    if (!slot) throw Object.assign(new Error('Slot not found'), { status: 404 })

    if (slot.is_booked || !slot.is_available) {
      throw Object.assign(new Error('Slot is already booked or unavailable'), {
        status: 400,
      })
    }

    const {
      provider_id,
      service_id,
      day: slotDate,
      start_time: slotTime,
    } = slot

    const formattedSlotDate =
      slotDate instanceof Date
        ? slotDate.toISOString().split('T')[0]
        : String(slotDate).split('T')[0]

    const formatTime = (time) => {
      if (!time) return ''
      if (typeof time === 'string') return time.slice(0, 5)
      if (time instanceof Date) return time.toTimeString().slice(0, 5)
      return String(time).slice(0, 5)
    }

    const formattedSlotTime = formatTime(slotTime)

    const appointmentRes = await client.query(
      `
      INSERT INTO appointments (
        timeslot_id, user_id, provider_id, service_id,
        appointment_date, appointment_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        timeslotId,
        userId,
        provider_id,
        service_id,
        formattedSlotDate,
        formattedSlotTime,
        'booked',
      ]
    )

    await client.query(
      'UPDATE time_slots SET is_booked = true, is_available = false WHERE timeslot_id = $1',
      [timeslotId]
    )

    await client.query('COMMIT')

    const appointment = appointmentRes.rows[0]
    emitAppointmentBooked(appointment)
    logInfo('✅ Appointment booked:', appointment.appointment_id)
    return appointment
  } catch (err) {
    logError(' Error booking appointment:', err)
    throw new Error(err.message || 'Failed to create appointment')
  }
}

// Cancel appointment
export async function cancel(appointmentId) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const apptRes = await client.query(
      'SELECT * FROM appointments WHERE appointment_id = $1 FOR UPDATE',
      [appointmentId]
    )

    const appointment = apptRes.rows[0]
    if (!appointment) throw new Error('Appointment not found')

    await client.query('DELETE FROM appointments WHERE appointment_id = $1', [
      appointmentId,
    ])
    await client.query(
      'UPDATE time_slots SET is_booked = false, is_available = true WHERE timeslot_id = $1',
      [appointment.timeslot_id]
    )

    await client.query('COMMIT')

    emitAppointmentCancelled(appointment)

    logInfo(`Appointment cancelled:`, appointment.id)
    return appointment
  } catch (err) {
    await client.query('ROLLBACK')
    logError('❌ Cancel transaction failed:', err)
    throw err
  } finally {
    client.release()
  }
}

// List appointments for a specific user
export async function list(
  userId,
  { status, startDate, endDate, limit = 10, offset = 0 }
) {
  let query = `SELECT * FROM appointments WHERE user_id = $1`
  const params = [userId]
  let paramIndex = 2

  if (status) {
    query += ` AND status = $${paramIndex++}`
    params.push(status)
  }

  if (startDate) {
    query += ` AND appointment_date >= $${paramIndex++}`
    params.push(startDate)
  }

  if (endDate) {
    query += ` AND appointment_date <= $${paramIndex++}`
    params.push(endDate)
  }

  query += ` ORDER BY appointment_date DESC, appointment_time DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
  params.push(limit, offset)

  const result = await pool.query(query, params)
  logInfo(`Appointments fetched for user:`, userId)
  return result.rows
}
