# Appointment Booking API
A robust Node.js + Express backend API for scheduling appointments with real-time notifications using WebSockets. The system supports user registration, JWT authentication, provider management, slot creation, and appointment booking with comprehensive validation and Swagger documentation.

## 🚀 Features
- User and provider registration/login with JWT

- Role-based route protection

- Time slot creation (by providers)

- Appointment booking & retrieval

- Real-time updates via Socket.IO (appointmentBooked, appointmentCancelled)

- Input validation with Joi

- API documentation with Swagger

- Unit + integration testing with Jest & Supertest


## 📁 Project Structure

/src
├── config/         # Configuration files
├── controllers/    # Route logic
├── models/         # DB models
├── routes/         # API endpoints
├── services/       # Business logic
├── sockets/        # WebSocket events
├── middlewares/    # Auth, error handling, etc.
├── utils/          # Helper functions
├── validators/     # Joi schemas
/tests              # Jest test cases
app.js              # Entry point
www                 # Server launcher
swaggerConfig.js    # Swagger setup
jestConfig.js       # Jest setup
.env                # Environment variables

## 🛠️ Tech Stack
- Node.js (ESM)

- Express.js

- PostgreSQL (via pg)

- Socket.IO (WebSocket support)

- JWT (Authentication)

- Joi (Validation)

- Swagger (API Docs)

- Jest + Supertest (Testing)


## ⚙️ Getting Started
### 📦 Clone & Install

- git clone https://github.com/Mbiydzenyuy3/Appointment-Booking-API.git
- cd appointment-booking-api
- npm install

## 🔐 Configure .env
Create a .env file in the root:
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

## 🚀 Start Dev Server
To start server run the command:
- npm run dev

### To see application Docs
- API Docs available at: http://localhost:4000/api-docs

## 📖 API Endpoint Summary
Resource	    |  Method	     |    Path	                    |   Description
Auth	        |   POST	     |   /auth/register	            |   Register a new user
Auth	        |   POST	     |   /auth/login	              |   Login and receive JWT token
Appointments  |   POST	     |   /appointments	            |   Book a new appointment
Appointments	|   GET	       |   /appointments	            |   View all user's appointments
Providers	    |   GET	       |   /providers	                |   List all registered service providers
Slots	        |   POST	     |   /slots (provider only)	    |   Create time slots
Slots	        |   GET	       |   /slots/:providerId	        |   View slots by provider

## ⚡ WebSocket Events
Event Name	Triggered On
- appointmentBooked	When an appointment is created
- appointmentCancelled	When an appointment is cancelled

## 🔒 Authentication
For all protected routes, include the JWT in the Authorization header:

### Authorization: Bearer <your_token>

## 🧪 Testing
To run the full test suite:

- npm test

### Test files are located in /tests:

- auth.test.js

- booking.test.js

- password.test.js

- websocket.test.js

## 🤝 Contributing
The project is open to enhancements! Feel free to fork the repo, create a branch, and submit a pull request. Contributions are welcome.
