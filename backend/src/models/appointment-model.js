// models/appointment-model.js

// models/appointment-model.js

import { pool } from '../config/db.js'

// 🔍 Get and lock a timeslot by ID
export async function getSlotForUpdate(timeslotId) {
  const result = await pool.query(
    'SELECT * FROM time_slots WHERE timeslot_id = $1 FOR UPDATE',
    [timeslotId]
  )
  return result.rows[0]
}

// ✅ Insert a new appointment (assumes all values are validated)
export async function insertAppointment({
  timeslotId,
  userId,
  providerId,
  serviceId,
  appointmentDate,
  appointmentTime,
}) {
  const result = await pool.query(
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
      providerId,
      serviceId,
      appointmentDate,
      appointmentTime,
      'booked',
    ]
  )
  return result.rows[0]
}

// 🔁 Update a timeslot’s booking status
export async function setSlotBookingStatus(timeslotId, isBooked) {
  await pool.query(
    'UPDATE time_slots SET is_booked = $1, is_available = $2 WHERE timeslot_id = $3',
    [isBooked, !isBooked, timeslotId]
  )
}

// ❌ Get appointment by ID and lock it
export async function getAppointmentForUpdate(appointmentId) {
  const result = await pool.query(
    'SELECT * FROM appointments WHERE appointment_id = $1 FOR UPDATE',
    [appointmentId]
  )
  return result.rows[0]
}

// 🗑️ Delete an appointment
export async function deleteAppointment(appointmentId) {
  await pool.query('DELETE FROM appointments WHERE appointment_id = $1', [
    appointmentId,
  ])
}

// 📄 List appointments for a user with filters
export async function findAppointmentsByUser(
  userId,
  { status, startDate, endDate, limit = 10, offset = 0 }
) {
  let query = `SELECT * FROM appointments WHERE user_id = $1`
  const params = [userId]
  let i = 2

  if (status) {
    query += ` AND status = $${i++}`
    params.push(status)
  }
  if (startDate) {
    query += ` AND appointment_date >= $${i++}`
    params.push(startDate)
  }
  if (endDate) {
    query += ` AND appointment_date <= $${i++}`
    params.push(endDate)
  }

  query += ` ORDER BY appointment_date DESC, appointment_time DESC LIMIT $${i++} OFFSET $${i++}`
  params.push(limit, offset)

  const result = await pool.query(query, params)
  return result.rows
}
