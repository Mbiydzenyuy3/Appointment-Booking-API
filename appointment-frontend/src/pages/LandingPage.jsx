// src/pages/HomePage.jsx
import React from 'react'
import { Link } from 'react-router-dom'
// import Header from "../components/Header.jsx"
// import Footer from "../components/Footer.jsx"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">📅 BOOKEasy</h1>
          <nav className="space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="overlay flex items-center justify-center">
          <div className="text-center px-4 content">
            <h2 className="text-4xl font-extrabold text-black mb-4">
              Seamless Appointment Booking
            </h2>
            <p className="text-lg text-white mb-6">
              Connect with providers effortlessly. Book, manage, and receive
              real-time updates.
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="text-blue-800 border border-blue-600 px-6 py-3 rounded hover:bg-blue-50"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Secure Authentication
            </h3>
            <p className="text-gray-600">
              Protect your data with JWT-based authentication.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Real-Time Notifications
            </h3>
            <p className="text-gray-600">
              Stay updated with instant alerts via WebSockets.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Provider Management
            </h3>
            <p className="text-gray-600">
              View available slots and manage appointments efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} BOOKEasy. All rights reserved.
      </footer>
    </div>
  )
}
