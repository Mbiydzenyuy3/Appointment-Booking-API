import React, { useEffect, useState } from 'react'
import api from '../../services/api.js'

export default function BookAppointmentForm({ providerId }) {
  const [timeslots, setTimeslots] = useState([])
  const [selectedTimeslotId, setSelectedTimeslotId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const fetchTimeslots = async () => {
      if (!providerId) return

      try {
        const response = await api.get(`/slots/${providerId}`)
        const data = response.data.data
        setTimeslots(Array.isArray(data) ? data : [])
        console.log('Fetched timeslots:', data)
      } catch (error) {
        console.error('Failed to fetch timeslots:', error)
        setTimeslots([])
      }
    }

    fetchTimeslots()
  }, [providerId])

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toISOString().split('T')[0]
    } catch {
      return dateStr
    }
  }

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':')
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
  }

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

    const payload = {
      timeslotId: selectedSlot.timeslot_id,
      appointment_date: formatDate(selectedSlot.day),
      appointment_time: formatTime(selectedSlot.start_time),
    }

    try {
      console.log('Sending booking payload:', payload)
      const response = await api.post('/appointments/book', payload)
      setMessage(response.data.message || 'Appointment booked successfully!')
    } catch (err) {
      console.error('Booking failed:', err)
      const errorMsg =
        err.response?.data?.message || 'Internal server error. Try again.'
      setMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Book an Appointment</h2>

      <div>
        <label htmlFor="timeslot">Select Time Slot:</label>
        <select
          id="timeslot"
          value={selectedTimeslotId}
          onChange={(e) => setSelectedTimeslotId(e.target.value)}
          required
        >
          <option value="">-- Choose a time slot --</option>
          {timeslots.map((slot) => (
            <option key={slot.timeslot_id} value={slot.timeslot_id}>
              {formatDate(slot.day)} at {formatTime(slot.start_time)} (
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
