import React, { useEffect, useState } from 'react'
import api from '../../services/api.js'
import axios from 'axios'

export default function BookAppointmentForm({ providerId }) {
  const [timeslots, setTimeslots] = useState([])
  const [selectedTimeslotId, setSelectedTimeslotId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // Fetch available time slots from provider dashboard
  useEffect(() => {
    const fetchTimeslots = async () => {
      try {
        const res = await api.get(`/slots/${providerId}`)
        const data = res.data.data

        if (Array.isArray(data)) {
          setTimeslots(data)
        } else {
          console.error('Expected timeslots array, got:', data)
          setTimeslots([])
        }
      } catch (error) {
        console.error('Failed to fetch timeslots', error)
        setTimeslots([])
      }
    }

    fetchTimeslots()
  }, [providerId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const payload = {
        timeslotId: selectedTimeslotId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
      }

      const res = await axios.post('/appointments/book', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // adjust auth strategy
        },
      })

      setMessage(res.data.message || 'Appointment booked successfully')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Booking failed'
      setMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (!providerId) {
    return <p>Loading provider details...</p>
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Book an Appointment</h2>

      <div>
        <label>Date:</label>
        <input
          type="date"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Time (HH:MM):</label>
        <input
          type="time"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Select Time Slot:</label>
        <select
          value={selectedTimeslotId}
          onChange={(e) => setSelectedTimeslotId(e.target.value)}
          required
        >
          <option value="">-- Choose a time slot --</option>
          {Array.isArray(timeslots) &&
            timeslots.map((slot, index) => (
              <option key={index} value={slot.timeslot_id}>
                {slot.day} at {slot.time} ({slot.provider_name})
              </option>
            ))}
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>

      {message && <p>{message}</p>}
    </form>
  )
}
