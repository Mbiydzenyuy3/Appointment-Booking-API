import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/Socketio.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import ProviderDashboard from "./pages/ProviderDashboard.jsx";
// import TimeSlotsPage from "./pages/TimeSlotsPage";
// import Header from "./components/Header.jsx"
// import Footer from "./components/Footer.jsx"
// import AppointmentsPage from "./pages/Appointments.jsx";
import BookAppointmentPage from "./pages/BookAppointment.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
// import ProtectedRoute from "./routes/ProtectedRoute.jsx";

function App() {
  return (
    <Provider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute allowedRoles={["user"]}>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/provider/dashboard"
                element={
                  <PrivateRoute allowedRoles={["provider"]}>
                    <ProviderDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/timeslots"
                element={
                  <PrivateRoute>{/* <TimeSlotsPage /> */}</PrivateRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <PrivateRoute>{/* <AppointmentsPage /> */}</PrivateRoute>
                }
              />
              <Route
                path="/book/:providerId"
                element={
                  <PrivateRoute>
                    <BookAppointmentPage />
                  </PrivateRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </Router>
      </SocketProvider>
    </Provider>
  );
}

export default App;
