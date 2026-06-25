import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { Provider } from "./context/AuthContext.jsx";
import { GuestProvider } from "./context/GuestContext.jsx";
import { SocketProvider } from "./context/Socketio.jsx";
import { AISchedulerProvider } from "./context/AISchedulerContext.jsx";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initAnalytics } from "./services/analytics.js";
import PageLoader from "./components/Common/PageLoader.jsx";

// ── Lazy-loaded pages ───────────────────────────────────────────────
// Each page becomes its own JS chunk, downloaded only when navigated to.
// This dramatically reduces the initial bundle size.
const HomePage = React.lazy(() => import("./pages/LandingPage.jsx"));
const LoginPage = React.lazy(() => import("./pages/Login.jsx"));
const RegisterPage = React.lazy(() => import("./pages/Register.jsx"));
const ClientRegisterPage = React.lazy(() => import("./pages/ClientRegister.jsx"));
const UserProfile = React.lazy(() => import("./pages/UserProfile.jsx"));
const DashboardPage = React.lazy(() => import("./pages/Dashboard.jsx"));
const ProviderDashboard = React.lazy(() => import("./pages/ProviderDashboard.jsx"));
const TimeSlotsPage = React.lazy(() => import("./pages/TimeSlotPage.jsx"));
const ExplorePage = React.lazy(() => import("./pages/Explore.jsx"));
const AppointmentsPage = React.lazy(() => import("./pages/Appointments.jsx"));
const SlotPage = React.lazy(() => import("./pages/Slots.jsx"));
const Unauthorized = React.lazy(() => import("./pages/Unauthorized.jsx"));
const ProviderProfile = React.lazy(() => import("./pages/ProviderProfile.jsx"));

// ── Eagerly loaded (small, used on every page) ─────────────────────
import ClientDashboardHeader from "./components/Navigation/ClientDashboardHeader.jsx";
import ProviderDashboardHeader from "./components/Navigation/ProviderDashboardHeader.jsx";
import UserTypeSelection from "./components/Common/UserTypeSelection.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import AuthRoute from "./routes/AuthRoute.jsx";

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
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <CurrencyProvider>
      <Provider>
        <GuestProvider>
          <SocketProvider>
            <AISchedulerProvider>
              <Router>
                <Suspense fallback={<PageLoader />}>
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
                      path='/explore'
                      element={
                        <PublicLayout>
                          <ExplorePage />
                        </PublicLayout>
                      }
                    />
                    <Route
                      path='/provider/:bookingSlug'
                      element={
                        <PublicLayout>
                          <ProviderProfile />
                        </PublicLayout>
                      }
                    />

                    {/* AUTH (logged-in users redirected) */}
                    <Route
                      path='/login'
                      element={
                        <AuthRoute>
                          <PublicLayout>
                            <LoginPage />
                          </PublicLayout>
                        </AuthRoute>
                      }
                    />
                    <Route
                      path='/register'
                      element={
                        <AuthRoute>
                          <PublicLayout>
                            <UserTypeSelection />
                          </PublicLayout>
                        </AuthRoute>
                      }
                    />
                    <Route
                      path='/register/client'
                      element={
                        <AuthRoute>
                          <PublicLayout>
                            <ClientRegisterPage />
                          </PublicLayout>
                        </AuthRoute>
                      }
                    />
                    <Route
                      path='/register/provider'
                      element={
                        <AuthRoute>
                          <PublicLayout>
                            <RegisterPage />
                          </PublicLayout>
                        </AuthRoute>
                      }
                    />

                    {/* Protected Routes */}
                    {/* CLIENT */}
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

                    {/* PROVIDER */}
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
                      path='/profile'
                      element={
                        <PrivateRoute>
                          <ClientAuthLayout>
                            <UserProfile />
                          </ClientAuthLayout>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path='/provider/profile'
                      element={
                        <PrivateRoute allowedRoles={["provider"]}>
                          <ProviderAuthLayout>
                            <UserProfile />
                          </ProviderAuthLayout>
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
                </Suspense>
                <ToastContainer
                  position='bottom-right'
                  autoClose={3000}
                  className='toast-container'
                  toastClassName='toast-item'
                />
              </Router>
            </AISchedulerProvider>
          </SocketProvider>
        </GuestProvider>
      </Provider>
    </CurrencyProvider>
  );
}

export default App;
