import React, { useEffect, useState } from 'react'
import api from '../../services/api.js'

export default function BookAppointmentForm({ providerId }) {
  const [timeslots, setTimeslots] = useState([])
  const [selectedTimeslotId, setSelectedTimeslotId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const fetchTimeslots = async () => {
      try {
        const res = await api.get(`/slots/${providerId}`)
        const data = res.data.data
        console.log('Fetched timeslots:', data)
        setTimeslots(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch timeslots', error)
        setTimeslots([])
      }
    }

    if (providerId) fetchTimeslots()
  }, [providerId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const selectedSlot = timeslots.find(
      (slot) => slot.timeslot_id === selectedTimeslotId
    )

    if (!selectedSlot) {
      setMessage('Invalid timeslot selected.')
      setLoading(false)
      return
    }

    const dateFormat = selectedSlot.day.split('T')[0] // 'YYYY-MM-DD'
    const timeFormat = selectedSlot.start_time.slice(0, 5) // 'HH:MM'

    const payload = {
      timeslotId: selectedSlot.timeslot_id,
      appointment_date: dateFormat,
      appointment_time: timeFormat,
    }

    try {
      console.log('Booking payload:', payload)
      const res = await api.post('/appointments/book', payload)
      setMessage(res.data.message || 'Appointment booked successfully')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Booking failed'
      setMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Book an Appointment</h2>

      <div>
        <label>Select Time Slot:</label>
        <select
          value={selectedTimeslotId}
          onChange={(e) => setSelectedTimeslotId(e.target.value)}
          required
        >
          <option value="">-- Choose a time slot --</option>
          {timeslots.map((slot) => (
            <option key={slot.timeslot_id} value={slot.timeslot_id}>
              {slot.day.split('T')[0]} at {slot.start_time} (
              {slot.provider_name})
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
