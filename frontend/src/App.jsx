import { BrowserRouter, Routes, Route } from "react-router-dom";

// ==========================================
// MAIN PAGES
// ==========================================

import Home from "./pages/Home";

// ==========================================
// AUTH PAGES
// ==========================================

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ResetPassword from "./pages/auth/ResetPassword";

// ==========================================
// RESIDENT PAGES
// ==========================================

import ResidentDashboard from "./pages/resident/ResidentDashboard";
import MyProfile from "./pages/resident/MyProfile";
import FlatDetails from "./pages/resident/FlatDetails";
import ResidentComplaints from "./pages/resident/ResidentComplaints";
import Payment from "./pages/resident/Payment";
import ServiceRequests from "./pages/resident/ServiceRequests";
import ResidentVisitors from "./pages/resident/ResidentVisitors";
import Facilities from "./pages/resident/Facilities";
import ResidentNotices from "./pages/resident/Notices";
import ResidentPolls from "./pages/resident/residentPolls";
import ResidentLayout from "./pages/resident/ResidentLayout";

// ==========================================
// GLOBAL CSS
// ==========================================

import "./css/global.css";

// ==========================================
// STAFF
// ==========================================

import StaffDashboard from "./pages/staff/StaffDashboard";

// ==========================================
// ADMIN PAGES
// ==========================================

import AdminDashboard from "./pages/admin/AdminDashboard";
import Residents from "./pages/admin/Residents";
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

        {/* ==========================================
            PUBLIC
        ========================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* ==========================================
            AUTH
        ========================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

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

        {/* ==========================================
            RESIDENT
            Common Sidebar + Header + Footer
            Only middle content changes
        ========================================== */}

        <Route
          path="/resident"
          element={<ResidentLayout />}
        >

          {/* Dashboard */}
          <Route
            index
            element={<ResidentDashboard />}
          />

          {/* My Profile */}
          <Route
            path="profile"
            element={<MyProfile />}
          />

          {/* Flat Details */}
          <Route
            path="flat-details"
            element={<FlatDetails />}
          />

          {/* Complaints */}
          <Route
            path="complaints"
            element={<ResidentComplaints />}
          />

          {/* Payments */}
          <Route
            path="payment"
            element={<Payment />}
          />

          {/* Service Requests */}
          <Route
            path="requests"
            element={<ServiceRequests />}
          />

          {/* Visitors */}
          <Route
            path="visitors"
            element={<ResidentVisitors />}
          />

          {/* Amenity Booking */}
          <Route
            path="facilities"
            element={<Facilities />}
          />

          {/* Notices & Events */}
          <Route
            path="notices"
            element={<ResidentNotices />}
          />

          {/* Polls & Voting */}
          <Route
            path="polls"
            element={<ResidentPolls />}
          />

        </Route>

        {/* ==========================================
            STAFF
        ========================================== */}

        <Route
          path="/staff"
          element={<StaffDashboard />}
        />

        {/* ==========================================
            ADMIN DASHBOARD
        ========================================== */}

        <Route
          path="/admin"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />

        {/* ==========================================
            ADMIN RESIDENTS
        ========================================== */}

        <Route
          path="/admin/residents"
          element={
            <AdminLayout>
              <Residents />
            </AdminLayout>
          }
        />

        {/* ==========================================
            ADMIN SECURITY
        ========================================== */}

        <Route
          path="/admin/security"
          element={
            <AdminLayout>
              <Security />
            </AdminLayout>
          }
        />

        {/* ==========================================
            ADMIN STAFF
        ========================================== */}

        <Route
          path="/admin/staff"
          element={
            <AdminLayout>
              <Staff />
            </AdminLayout>
          }
        />

        {/* ==========================================
            ADMIN COMPLAINTS
        ========================================== */}

        <Route
          path="/admin/complaints"
          element={
            <AdminLayout>
              <Complaints />
            </AdminLayout>
          }
        />

        {/* ==========================================
            ADMIN PAYMENTS
        ========================================== */}

        <Route
          path="/admin/payments"
          element={
            <AdminLayout>
              <Payments />
            </AdminLayout>
          }
        />

        {/* ==========================================
            ADMIN VISITORS
        ========================================== */}

        <Route
          path="/admin/visitors"
          element={
            <AdminLayout>
              <Visitors />
            </AdminLayout>
          }
        />

        {/* ==========================================
            ADMIN AMENITIES
        ========================================== */}

        <Route
          path="/admin/amenities"
          element={
            <AdminLayout>
              <Amenities />
            </AdminLayout>
          }
        />

        {/* ==========================================
            ADMIN NOTICES
        ========================================== */}

        <Route
          path="/admin/notices"
          element={
            <AdminLayout>
              <Notices />
            </AdminLayout>
          }
        />

        {/* ==========================================
            ADMIN NOTIFICATIONS
        ========================================== */}

        <Route
          path="/admin/notifications"
          element={
            <AdminLayout>
              <Notifications />
            </AdminLayout>
          }
        />

        {/* ==========================================
            ADMIN SETTINGS
        ========================================== */}

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