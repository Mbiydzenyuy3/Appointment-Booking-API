// models/appointment-model.js

import { pool } from '../config/db.js'

export const CreateAppointment = async ({
  timeslotId,
  userId,
  appointment_date,
  appointment_time,
}) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Lock and fetch the timeslot row to prevent race conditions
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

    // Helper to safely extract "HH:MM" from various formats
    const formatTime = (time) => {
      if (!time) return ''
      if (typeof time === 'string') return time.slice(0, 5)
      if (time instanceof Date) return time.toTimeString().slice(0, 5)
      return String(time).slice(0, 5)
    }

    const formattedSlotDate =
      slotDate instanceof Date
        ? slotDate.toISOString().split('T')[0]
        : String(slotDate).split('T')[0]

    const formattedSlotTime = formatTime(slotTime)
    const formattedAppointmentTime = formatTime(appointment_time)

    // Ensure the submitted time/date match the slot
    if (
      appointment_date !== formattedSlotDate ||
      formattedAppointmentTime !== formattedSlotTime
    ) {
      const mismatchError = new Error(
        'Provided appointment date/time does not match the selected time slot'
      )
      mismatchError.details = {
        expected_date: formattedSlotDate,
        actual_date: appointment_date,
        expected_time: formattedSlotTime,
        actual_time: formattedAppointmentTime,
      }
      console.error('Appointment mismatch details:', mismatchError.details)
      throw mismatchError
    }

    // Insert appointment into the DB
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
        appointment_date,
        appointment_time,
        'booked',
      ]
    )

    // Mark the timeslot as booked
    await client.query(
      'UPDATE time_slots SET is_booked = true, is_available = false WHERE timeslot_id = $1',
      [timeslotId]
    )

    await client.query('COMMIT')
    return appointmentRes.rows[0]
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('CreateAppointment transaction failed:', err)
    throw err // Let the caller handle the response formatting
  } finally {
    client.release()
  }
}

// Cancel appointment and reopen the timeslot
export const cancelAppointment = async (appointmentId) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const apptRes = await client.query(
      'SELECT * FROM appointments WHERE appointment_id = $1 FOR UPDATE',
      [appointmentId]
    )

    const appointment = apptRes.rows[0]
    if (!appointment) throw new Error('Appointment not found')

    const { timeslot_id } = appointment

    // Delete the appointment
    await client.query('DELETE FROM appointments WHERE appointment_id = $1', [
      appointmentId,
    ])

    // Reopen the time slot
    await client.query(
      'UPDATE time_slots SET is_booked = false, is_available = true WHERE timeslot_id = $1',
      [timeslot_id]
    )

    await client.query('COMMIT')
    return appointment
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ cancelAppointment transaction failed:', err)
    throw err
  } finally {
    client.release()
  }
}

// Find all appointments for a specific user
export const findAppointmentsByUser = async (
  userId,
  { status, startDate, endDate, limit = 10, offset = 0 }
) => {
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
  return result.rows
}
