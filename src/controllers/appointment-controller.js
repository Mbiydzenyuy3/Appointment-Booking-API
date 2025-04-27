import * as appointmentService from "../services/appointment-service.js";

export async function bookAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.book(req.body);
    res.status(201).json({ appointment });
  } catch (err) {
    next(err);
  }
}

export async function cancelAppointment(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const appointment = await appointmentService.cancel(appointmentId);
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

export async function listAppointments(req, res, next) {
  try {
    const appointments = await appointmentService.list(req.user.id);
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}
