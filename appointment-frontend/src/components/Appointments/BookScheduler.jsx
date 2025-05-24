// src/components/Appointments/BookingScheduler.jsx
import React from "react";
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  Resize,
  DragAndDrop,
} from "@syncfusion/ej2-react-schedule";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "react-toastify";

export default function BookingScheduler({ appointments, setAppointments }) {
  const { user } = useAuth();

  const onActionComplete = async (args) => {
    if (args.requestType === "eventCreated") {
      try {
        const newEvent = args.data[0];
        const res = await api.post("/appointments/book", {
          serviceId: newEvent.serviceId, // You'll need to provide this
          providerId: newEvent.providerId, // And this
          date: newEvent.StartTime,
        });
        toast.success("Appointment booked");
        setAppointments((prev) => [...prev, res.data]);
      } catch (err) {
        toast.error("Failed to book appointment");
      }
    }

    if (args.requestType === "eventChanged") {
      const updatedEvent = args.data;
      try {
        await api.delete(`/appointments/${updatedEvent._id}`);
        const res = await api.post("/appointments/book", {
          serviceId: updatedEvent.serviceId,
          providerId: updatedEvent.providerId,
          date: updatedEvent.StartTime,
        });
        toast.success("Appointment rescheduled");
        setAppointments((prev) =>
          prev.map((appt) => (appt._id === updatedEvent._id ? res.data : appt))
        );
      } catch (err) {
        toast.error("Failed to reschedule");
      }
    }
  };

  return (
    <div className="mt-12">
      <ScheduleComponent
        height="650px"
        eventSettings={{
          dataSource: appointments.map((appt) => ({
            Id: appt._id,
            Subject: appt.serviceName,
            StartTime: new Date(appt.date),
            EndTime: new Date(new Date(appt.date).getTime() + 30 * 60000), // Assuming 30 mins
          })),
        }}
        actionComplete={onActionComplete}
      >
        <Inject
          services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]}
        />
      </ScheduleComponent>
    </div>
  );
}
