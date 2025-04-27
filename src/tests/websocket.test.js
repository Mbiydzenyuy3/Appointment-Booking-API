import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("appointmentBooked", (data) => {
  console.log("Appointment Booked:", data);
});

socket.on("appointmentCancelled", (data) => {
  console.log("Appointment Cancelled:", data);
});
