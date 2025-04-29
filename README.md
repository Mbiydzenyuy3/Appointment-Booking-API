# APPOINTMENT BOOKING APP

🚀 Project Overview
This is a Node.js/Express backend API for booking appointments with real-time WebSocket notifications.
It handles user registration, authentication, service provider management, slot creation, and booking appointments.

## 📂 Project Structure

/src
├── config/
├── controllers/
├── models/
├── routes/
├── services/
├── sockets/
├── middlewares/
├── utils/
└── validators/
tests/
app.js
www
swaggerConfig.js
jestConfig.js
.env

## 🛠️ Technologies Used

- Node.js (ESM syntax)

- Express.js

- PostgreSQL (pg driver)

- Socket.IO

- JWT for Authentication

- Joi for Validation

- Swagger for API Documentation

## ⚙️ Setup Instructions

### Clone Repository

- git clone https://github.com/Mbiydzenyuy3/Appointment-Booking-API.git
- cd appointment-booking-api
- Install Dependencies
- npm install

## Configure Environment Variables Create a .env file:

DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=appointmentbookingdb
DB_NAME_TEST=appointmentbooking_test
PORT=4000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=2h
NODE_ENV=development

## Start Development Server
command: npm run dev

View API Docs Visit http://localhost:4000/api-docs after starting server.

## Run Tests
npm test

## API Endpoints Summary
Resource      | Method |      Path                    |      Description
Auth          | POST   |   /api/auth/register         |   Register a new user
Auth          | POST   |   /api/auth/login            |   Login and get JWT token
Appointments  | POST   |   /api/appointments          |   Book a new appointment
Appointments  | GET    |   /api/appointments          |   Get user's appointments
Providers     | GET    |   /api/providers             |   List all service providers
Slots         | POST   |   /api/slots (provider-only) |   Create available time slots
Slots         | GET    |   /api/slots/:providerId     |   Get slots by provider


## ⚡ Real-time Features
- appointmentBooked event (broadcasted when appointment created).

- appointmentCancelled event (broadcasted when appointment cancelled).

## 🧪 Testing
Test files located under /tests:

- auth.test.js

- booking.test.js

- password.test.js

- websocket.test.js

## Simply run:
npm test

## 🔒 Authentication
All protected routes require sending the JWT token in the Authorization header:
Authorization: Bearer <token>

## 🎯 Future Enhancements
  The app is open to contributions and enhancement, 👉 feel free to contribute .
