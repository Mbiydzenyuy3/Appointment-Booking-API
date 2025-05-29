// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import RescheduleModal from '../components/Appointments/ResheduleModal.jsx'
import api from '../services/api.js'
import { toast } from 'react-toastify'

const UserDashboard = () => {
  const { logout } = useAuth()
  const [services, setServices] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    appointment: null,
  })

  const [bookingModal, setBookingModal] = useState({
    open: false,
    service: null,
  })

  const handleReschedule = async (newDate) => {
    const appt = rescheduleModal.appointment
    try {
      await api.delete(`/appointments/${appt._id}`)
      const res = await api.post('/appointments/book', {
        serviceId: appt.serviceId,
        providerId: appt.providerId,
        date: newDate,
      })
      toast.success('Appointment rescheduled')
      setAppointments((prev) =>
        prev.map((a) => (a._id === appt._id ? res.data : a))
      )
    } catch (error) {
      toast.error('Failed to reschedule')
    }
  }

  const handleBook = async (e) => {
    e.preventDefault()
    const form = e.target
    const date = form.date.value
    console.log('Selected date:', date)
    const { service } = bookingModal
    console.log('Selected service:', service)

    const serviceId = service?.service_id
    const providerId = service?.provider_id

    if (!service?._id || !service?.providerId || !date) {
      toast.error('Incomplete booking information.')
      console.log('Failed due to:', { service, date })
      return
    }

    try {
      const payload = {
        serviceId,
        providerId,
        date,
        timeslotId: service?.timeslot_id,
      }

      console.log('Booking payload:', payload)

      const res = await api.post('/appointments/book', payload)

      toast.success('Appointment booked')
      setAppointments((prev) => [...prev, res.data])
      setBookingModal({ open: false, service: null })
    } catch (error) {
      toast.error('Failed to book appointment')
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      await api.delete(`/appointments/${appointmentId}`)
      setAppointments((prev) =>
        prev.filter((appt) => appt._id !== appointmentId)
      )
      toast.success('Appointment cancelled')
    } catch (error) {
      toast.error('Failed to cancel appointment')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Unauthorized. Please log in.')
        logout()
        return
      }

      try {
        const servicesRes = await api.get('/services')
        const appointmentsRes = await api.get('/appointments/list')

        const servicesWithProvider = (
          Array.isArray(servicesRes.data.data) ? servicesRes.data.data : []
        ).map((s) => ({
          ...s,
          providerId: s.providerId || 'default-provider-id',
        }))

        setServices(servicesWithProvider)
        setAppointments(
          Array.isArray(appointmentsRes.data.data)
            ? appointmentsRes.data.data
            : []
        )
      } catch (error) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [logout])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Available Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{service.service_name}</h3>
              <p className="text-gray-600 mb-2">{service.description}</p>
              <p className="text-gray-600 mb-1">Price: ${service.price}</p>
              <p className="text-gray-600 mb-4">
                Duration: {service.duration_minutes} min
              </p>
              <button
                onClick={() => setBookingModal({ open: true, service })}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-600">You have no appointments.</p>
        ) : (
          <ul className="space-y-4">
            {appointments.map((appt) => (
              <li
                key={appt._id}
                className="bg-white p-4 shadow rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{appt.serviceName}</p>
                  <p className="text-gray-600">
                    {new Date(appt.date).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-gray-500">Status: {appt.status}</p>
                </div>
                <div className="flex">
                  <button
                    onClick={() => cancelAppointment(appt._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      setRescheduleModal({ open: true, appointment: appt })
                    }
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Reschedule
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {bookingModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-bold mb-4">
              Book: {bookingModal.service?.service_name}
            </h3>

            <form onSubmit={handleBook}>
              <label className="block mb-2 text-sm font-medium">
                Choose a date & time
              </label>
              <input
                type="datetime-local"
                name="date"
                className="w-full mb-4 p-2 border rounded"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setBookingModal({ open: false, service: null })
                  }
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <RescheduleModal
        isOpen={rescheduleModal.open}
        onClose={() => setRescheduleModal({ open: false, appointment: null })}
        onSubmit={handleReschedule}
        initialDate={rescheduleModal.appointment?.date}
      />
    </div>
  )
}

export default UserDashboard
