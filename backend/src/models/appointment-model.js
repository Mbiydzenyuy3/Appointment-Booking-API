// models/appointment-model.js

import { pool } from '../config/db.js'

//  Create appointment with timeslot-based resolution of provider/service
export const CreateAppointment = async ({
  timeslotId,
  userId,
  appointment_date,
  appointment_time,
}) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Lock the slot and fetch details
    const slotRes = await client.query(
      `SELECT * FROM time_slots WHERE timeslot_id = $1 FOR UPDATE`,
      [timeslotId]
    )

    const slot = slotRes.rows[0]
    if (!slot) throw new Error('Slot not found')
    if (slot.is_booked || !slot.is_available) {
      throw new Error('Slot is already booked or unavailable')
    }

    const { provider_id, service_id, day: slotDate, time: slotTime } = slot

    // Ensure appointment date/time matches the timeslot and also the database time format to avoid the 500 internal server error
    const formatTime = (time) => {
      if (typeof time === 'string') {
        return time.slice(0, 5) // safely extracts "HH:MM" from "HH:MM:SS"
      } else if (time instanceof Date) {
        return time.toTimeString().slice(0, 5)
      } else {
        return String(time).slice(0, 5) // fallback
      }
    }

    const formattedSlotDate = new Date(slot.date).toISOString().split('T')[0]
    const formattedSlotTime = formatTime(slot.time) // assuming `slot.time` exists
    const formattedAppointmentTime = formatTime(appointment_time)

    if (
      appointment_date !== formattedSlotDate ||
      formattedAppointmentTime !== formattedSlotTime
    ) {
      throw new Error(
        'Provided appointment date/time does not match the selected time slot'
      )
    }

    const appointmentRes = await client.query(
      `
      INSERT INTO appointments (
        timeslot_id, user_id, provider_id, service_id, appointment_date, appointment_time, status
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

    //  Mark timeslot as booked
    await client.query(
      `UPDATE time_slots SET is_booked = true, is_available = false WHERE timeslot_id = $1`,
      [timeslotId]
    )

    await client.query('COMMIT')
    return appointmentRes.rows[0]
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('CreateAppointment transaction failed:', err)
    throw err
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
      `SELECT * FROM appointments WHERE appointment_id = $1 FOR UPDATE`,
      [appointmentId]
    )

    const appointment = apptRes.rows[0]
    if (!appointment) throw new Error('Appointment not found')

    const { timeslot_id } = appointment

    // Delete the appointment
    await client.query(`DELETE FROM appointments WHERE appointment_id = $1`, [
      appointmentId,
    ])

    // Reopen the time slot
    await client.query(
      `UPDATE time_slots SET is_booked = false, is_available = true WHERE timeslot_id = $1`,
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
