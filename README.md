<div align="center">

# 📅 BookEasy

### Full-Stack Real-Time Appointment Booking System

[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**BookEasy is a production-ready, full-stack appointment scheduling engine.**
It connects service providers with clients through an automated, real-time interface that eliminates manual scheduling overhead and double-bookings.

🌐 **[Live Demo](https://appointment-booking-api-omega.vercel.app/)** · 📚 [API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Project Goals](#-project-goals)
- [Technical Architecture](#-technical-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Challenges Faced](#-challenges-faced)
- [What I Learned](#-what-i-learned)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

---

## 🔍 Problem Statement

### Who has the problem?
Service-based professionals (doctors, consultants, tutors, barbers) and their clients.

### Why it matters?
Manual booking is slow, error-prone, and frustrating. Providers waste time managing calendars, and clients often struggle with back-and-forth communication. The biggest pain point is **double-booking** — where two clients book the same slot at the same time.

### Why this solution exists?
BookEasy provides an **automated, single source of truth**. By combining a robust backend with a real-time frontend, it ensures that as soon as a slot is taken, it vanishes for all other users instantly. It moves the booking experience from "phone calls and emails" to "one-click automation."

---

## 🎯 Project Goals

- ✅ Build a scalable RESTful API with Node.js and Express
- ✅ Deliver a modern, mobile-responsive dashboard with React and Tailwind CSS
- ✅ Enable zero-latency availability updates using Socket.IO (WebSockets)
- ✅ Implement secure, role-based authentication (JWT) for Clients and Providers
- ✅ Optimize performance using Redis for high-frequency slot retrieval
- ✅ Provide interactive documentation via Swagger for developers

---

## 🏗️ Technical Architecture

BookEasy is built with a decoupled architecture, optimized for high-speed state synchronization.

```
BookEasy/
├── backend/               # Express.js API
│   ├── src/
│   │   ├── controllers/   # Request orchestration
│   │   ├── models/        # PostgreSQL schema & relationships
│   │   ├── routes/        # API surface (REST)
│   │   ├── services/      # Business logic (caching, conflict resolution)
│   │   └── sockets/       # WebSocket event emitters
│   └── tests/             # Jest/Supertest suite
└── frontend/              # React (Vite) Client
    ├── src/
    │   ├── components/    # Modular UI units
    │   ├── pages/         # Dashboard & Public booking views
    │   └── services/      # API communication layer (Axios)
```

### Backend Structure
- **Core Engine:** Node.js/Express.js handles the API logic.
- **Persistence Layer:** PostgreSQL stores user data, provider profiles, and booking history.
- **Caching Layer:** Redis stores transient slot availability to reduce database pressure during surges.
- **Real-Time Layer:** Socket.IO pushes instant notifications to the client upon booking/cancellation events.

### Frontend Structure
- **React:** Component-based UI for dynamic view management.
- **Tailwind CSS:** Utility-first styling for a fast, custom-branded interface.
- **Real-Time Hooks:** Custom hooks listen for WebSocket events to update the calendar view without reloading.

---

## ✨ Features

### 🔐 Multi-Role Auth (RBAC)
- **Providers:** Can manage their profile, create/delete availability slots, and view their schedule.
- **Clients:** Can browse providers, view available slots, and book/manage appointments.
- **Security:** Full JWT implementation with route-level protection and secure hashing.

### 📅 Real-Time Slot Engine
- WebSockets ensure that when a slot is booked, it disappears for everyone else in <100ms.
- Instant feedback via toast notifications when someone books your service.

### 🚀 Performance Optimization
- **Redis Caching:** High-traffic "available slots" queries are served from memory.
- **DB Transactions:** Ensures data integrity — even under heavy load, double-bookings are impossible.

### 📖 API Documentation (Swagger)
- Interactive documentation at `/api-docs`.
- Developers can test every endpoint directly from the browser.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express.js |
| **Frontend** | React, Tailwind CSS |
| **Database** | PostgreSQL |
| **Cache** | Redis |
| **Real-Time** | Socket.IO |
| **Documentation** | Swagger / OpenAPI |
| **Testing** | Jest, Supertest, Playwright |

---

## 🚀 Installation & Setup

### 1. Clone & Install
```bash
git clone https://github.com/Mbiydzenyuy3/Appointment-Booking-API.git
npm install
```

### 2. Run Backend
```bash
cd backend
npm run dev
```

### 3. Run Frontend
```bash
cd frontend
npm run dev
```

---

## 🚧 Challenges Faced

### 1. Frontend Challenge — Syncing Real-Time State
Handling WebSocket updates in a React application without causing unwanted re-renders or data inconsistency was difficult. If a client was viewing a list of slots and a "slot booked" event came in, I had to surgically update that specific item in the state. I solved this by creating a **custom Socket Context** that manages the listener lifecycle and uses functional updates to merge incoming events into the UI state.

### 2. Backend Challenge — Concurrency & Double-Bookings
In high-traffic situations, two users might try to book the same slot at the exact same moment. Standard application-level checks are not enough. I implemented **database-level unique constraints** and **atomic transactions** in PostgreSQL. This ensures that the first request succeeds while the second is blocked by the database itself, returning a clean 409 Conflict error.

### 3. Debugging Experience — Redis Connection Logic
During early testing, the backend would crash if the Redis server was temporarily unreachable. I had to implement a **robust reconnection strategy** using the Redis client's retry events and a fallback mechanism where the API reverts to direct database queries if the cache layer is down.

---

## 💡 What I Learned

### Technical Lesson
Building BookEasy taught me that **the database is the source of truth, but the UI is the source of trust**. Implementing WebSockets isn't just a "feature" — it builds user trust by preventing the frustration of clicking a button that doesn't work.

### Workflow Lesson
I learned the value of **interactive API documentation (Swagger)**. By documenting the backend first, I was able to build the frontend much faster because I didn't have to constantly check the backend source code for parameter names and response shapes.

### Code Organization Lesson
**Full-stack means holistic thinking.** I learned to treat the API and the Frontend as two halves of a single unit. Standardizing error responses and sharing validation logic (using Joi) saved countless hours of cross-layer debugging.

---

## 🔮 Future Improvements

- 💳 **Payment Integration:** Add Stripe to support paid appointments.
- 📅 **Google Calendar Sync:** Allow providers to sync their BookEasy slots with personal calendars.
- 🔔 **SMS Notifications:** Integrate Twilio for automated appointment reminders.

---

## 👤 Author

**Leila Mbiydzenyuy**
Full-Stack Engineer | Node.js · Express · React · PostgreSQL

[![LinkedIn](https://img.shields.io/badge/LinkedIn-eileen--leila-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/eileen-leila/)
[![GitHub](https://img.shields.io/badge/GitHub-Mbiydzenyuy3-333?style=flat-square&logo=github)](https://github.com/Mbiydzenyuy3)

---

<div align="center">

*Give this project a ⭐ if you find it interesting!*

</div>
