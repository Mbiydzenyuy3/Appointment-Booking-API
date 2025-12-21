import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { Provider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/Socketio.jsx";
import { AISchedulerProvider } from "./context/AISchedulerContext.jsx";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import ProviderDashboard from "./pages/ProviderDashboard.jsx";
import TimeSlotsPage from "./pages/TimeSlotPage.jsx";
import ClientDashboardHeader from "./components/Navigation/ClientDashboardHeader.jsx";
import ProviderDashboardHeader from "./components/Navigation/ProviderDashboardHeader.jsx";
import AppointmentsPage from "./pages/Appointments.jsx";
import SlotPage from "./pages/Slots.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";

// Layout component for authenticated client pages
function ClientAuthLayout({ children }) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <ClientDashboardHeader />
      <main className='container-mobile py-4 sm:py-6 lg:py-8'>{children}</main>
    </div>
  );
}

// Layout component for authenticated provider pages
function ProviderAuthLayout({ children }) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <ProviderDashboardHeader />
      <main className='container-mobile py-4 sm:py-6 lg:py-8'>{children}</main>
    </div>
  );
}

// Layout component for public pages (landing, login, register)
function PublicLayout({ children }) {
  return <div className='min-h-screen bg-gray-50'>{children}</div>;
}

function App() {
  return (
    <CurrencyProvider>
      <Provider>
        <SocketProvider>
          <AISchedulerProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route
                  path='/'
                  element={
                    <PublicLayout>
                      <HomePage />
                    </PublicLayout>
                  }
                />
                <Route
                  path='/login'
                  element={
                    <PublicLayout>
                      <LoginPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path='/register'
                  element={
                    <PublicLayout>
                      <RegisterPage />
                    </PublicLayout>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path='/dashboard'
                  element={
                    <PrivateRoute allowedRoles={["client"]}>
                      <ClientAuthLayout>
                        <DashboardPage />
                      </ClientAuthLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path='/provider/dashboard'
                  element={
                    <PrivateRoute allowedRoles={["provider"]}>
                      <ProviderAuthLayout>
                        <ProviderDashboard />
                      </ProviderAuthLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path='/slots'
                  element={
                    <PrivateRoute>
                      <ClientAuthLayout>
                        <SlotPage />
                      </ClientAuthLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path='/timeslots'
                  element={
                    <PrivateRoute>
                      <ProviderAuthLayout>
                        <TimeSlotsPage />
                      </ProviderAuthLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path='/appointments'
                  element={
                    <PrivateRoute allowedRoles={["provider"]}>
                      <ProviderAuthLayout>
                        <AppointmentsPage />
                      </ProviderAuthLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path='/my-appointments'
                  element={
                    <PrivateRoute allowedRoles={["client"]}>
                      <ClientAuthLayout>
                        <AppointmentsPage />
                      </ClientAuthLayout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path='/unauthorized'
                  element={
                    <PublicLayout>
                      <Unauthorized />
                    </PublicLayout>
                  }
                />

                {/* Fallback */}
                <Route path='*' element={<Navigate to='/' />} />
              </Routes>
              <ToastContainer
                position='bottom-right'
                autoClose={3000}
                className='toast-container'
                toastClassName='toast-item'
              />
            </Router>
          </AISchedulerProvider>
        </SocketProvider>
      </Provider>
    </CurrencyProvider>
  );
}

export default App;
