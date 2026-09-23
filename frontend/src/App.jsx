import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ResetPassword from "./pages/auth/ResetPassword";

import ResidentDashboard from "./pages/resident/ResidentDashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Residents from "./pages/admin/Residents";
import "./css/global.css";
import StaffDashboard from "./pages/staff/StaffDashboard";
import Security from "./pages/admin/Security";

import AdminLayout from "./pages/admin/AdminLayout";
import Staff from "./pages/admin/Staff";
import Complaints from "./pages/admin/Complaints";
import Payments from "./pages/admin/Payments";
import Visitors from "./pages/admin/Visitors";
import Amenities from "./pages/admin/Amenities";
import Notices from "./pages/admin/Notices";
import Notifications from "./pages/admin/Notifications";
import Settings from "./pages/admin/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Resident Pages */}
        <Route
          path="/resident"
          element={<ResidentDashboard />}
        />

        <Route
          path="/resident/complaints"
          element={<Complaints />}
        />

        {/* Staff Pages */}
        <Route
          path="/staff"
          element={<StaffDashboard />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />

        {/* Admin Residents */}
        <Route
          path="/admin/residents"
          element={
            <AdminLayout>
              <Residents />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/security"
          element={
            <AdminLayout>
              <Security />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/staff"
          element={
            <AdminLayout>
              <Staff />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/complaints"
          element={
            <AdminLayout>
              <Complaints />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <AdminLayout>
              <Payments />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/visitors"
          element={
            <AdminLayout>
              <Visitors />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/amenities"
          element={
            <AdminLayout>
              <Amenities />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/notices"
          element={
            <AdminLayout>
              <Notices />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <AdminLayout>
              <Notifications />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminLayout>
              <Settings />
            </AdminLayout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;