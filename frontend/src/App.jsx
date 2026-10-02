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
import AssignedComplaints from "./pages/staff/AssignedComplaints";
import StaffServiceRequests from "./pages/staff/StaffServiceRequests";
import StaffTasks from "./pages/staff/StaffTasks";
import StaffMaintenance from "./pages/staff/StaffMaintenance";
import StaffInventory from "./pages/staff/StaffInventory";
import StaffWorkHistory from "./pages/staff/StaffWorkHistory";
import StaffProfile from "./pages/staff/StaffProfile";


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
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* RESIDENT */}
        <Route path="/resident" element={<ResidentLayout />}>
          <Route index element={<ResidentDashboard />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="flat-details" element={<FlatDetails />} />
          <Route path="complaints" element={<ResidentComplaints />} />
          <Route path="payment" element={<Payment />} />
          <Route path="requests" element={<ServiceRequests />} />
          <Route path="visitors" element={<ResidentVisitors />} />
          <Route path="facilities" element={<Facilities />} />
          <Route path="notices" element={<ResidentNotices />} />
          <Route path="polls" element={<ResidentPolls />} />
        </Route>

        {/* STAFF (FIXED PATHS HERE) */}
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/complaints" element={<AssignedComplaints />} />
        <Route path="/staff/service-requests" element={<StaffServiceRequests />} />
        <Route path="/staff/tasks" element={<StaffTasks />} />
        <Route path="/staff/maintenance" element={<StaffMaintenance />} />
        <Route path="/staff/assets" element={<StaffInventory />} />
        <Route path="/staff/inventory" element={<StaffInventory />} />
        <Route path="/staff/work-history" element={<StaffWorkHistory />} />
        <Route path="/staff/profile" element={<StaffProfile />} />


        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />
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