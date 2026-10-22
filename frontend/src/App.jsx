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
import ResidentComplaints from "./pages/resident/ResidentComplaints";
import Payment from "./pages/resident/Payment";
import ServiceRequests from "./pages/resident/ServiceRequests";
import ResidentVisitors from "./pages/resident/ResidentVisitors";
import Facilities from "./pages/resident/Facilities";
import ResidentNotices from "./pages/resident/Notices";
import ResidentNotifications from "./pages/resident/ResidentNotifications";
import EmergencyContacts from "./pages/resident/EmergencyContacts";
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
import StaffNotifications from "./pages/staff/StaffNotifications";
import StaffVisitors from "./pages/staff/StaffVisitors";
import StaffReportIssue from "./pages/staff/StaffReportIssue";
import StaffSupervisorStaff from "./pages/staff/StaffSupervisorStaff";
import StaffSupervisorTasks from "./pages/staff/StaffSupervisorTasks";
import StaffSupervisorComplaints from "./pages/staff/StaffSupervisorComplaints";
import StaffSupervisorVerification from "./pages/staff/StaffSupervisorVerification";
import StaffSupervisorReports from "./pages/staff/StaffSupervisorReports";
import StaffSupervisorIncidents from "./pages/staff/StaffSupervisorIncidents";
import StaffWorkspaceLayout from "./components/StaffWorkspaceLayout";


// ==========================================
// ADMIN PAGES
// ==========================================

import AdminDashboard from "./pages/admin/AdminDashboard";
import Residents from "./pages/admin/Residents";
import AdminLayout from "./pages/admin/AdminLayout";
import Staff from "./pages/admin/Staff";
import Complaints from "./pages/admin/Complaints";
import Payments from "./pages/admin/Payments";
import Visitors from "./pages/admin/Visitors";
import Amenities from "./pages/admin/Amenities";
import FacilityBookings from "./pages/admin/FacilityBookings";
import Notices from "./pages/admin/Notices";
import Notifications from "./pages/admin/Notifications";
import Settings from "./pages/admin/Settings";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminServiceRequests from "./pages/admin/AdminServiceRequests";
import AdminAssets from "./pages/admin/AdminAssets";
import AdminIncidents from "./pages/admin/AdminIncidents";

// Keep personal/project-wide CSS overrides last so they can override page styles.
import "./css/admin_residents.css";
import "./css/admin_unified.css";
import "./css/staff_admin_theme.css";
import "./css/staff_workspace.css";
// import "./css/custom-overrides.css";

function App() {
  return (

    <h2>mulsha</h2>,
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
          <Route path="complaints" element={<ResidentComplaints />} />
          <Route path="payment" element={<Payment />} />
          <Route path="requests" element={<ServiceRequests />} />
          <Route path="visitors" element={<ResidentVisitors />} />
          <Route path="facilities" element={<Facilities />} />
          <Route path="notices" element={<ResidentNotices />} />
          <Route path="notifications" element={<ResidentNotifications />} />
          <Route path="emergency" element={<EmergencyContacts />} />
          <Route path="polls" element={<ResidentPolls />} />
        </Route>

        {/* STAFF (FIXED PATHS HERE) */}
        <Route path="/staff" element={<StaffWorkspaceLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="complaints" element={<AssignedComplaints />} />
          <Route path="tasks" element={<StaffTasks />} />
          <Route path="service-requests" element={<StaffServiceRequests />} />
          <Route path="maintenance" element={<StaffMaintenance />} />
          <Route path="assets" element={<StaffInventory />} />
          <Route path="inventory" element={<StaffInventory />} />
          <Route path="work-history" element={<StaffWorkHistory />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="notifications" element={<StaffNotifications />} />
          <Route path="visitors" element={<StaffVisitors />} />
          <Route path="report-issue" element={<StaffReportIssue />} />
          <Route path="supervisor/staff" element={<StaffSupervisorStaff />} />
          <Route path="supervisor/tasks" element={<StaffSupervisorTasks />} />
          <Route path="supervisor/complaints" element={<StaffSupervisorComplaints />} />
          <Route path="supervisor/verification" element={<StaffSupervisorVerification />} />
          <Route path="supervisor/reports" element={<StaffSupervisorReports />} />
          <Route path="supervisor/incidents" element={<StaffSupervisorIncidents />} />
        </Route>


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
          path="/admin/service-requests"
          element={
            <AdminLayout>
              <AdminServiceRequests />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/assets"
          element={
            <AdminLayout>
              <AdminAssets />
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
          path="/admin/incident-reports"
          element={
            <AdminLayout>
              <AdminIncidents />
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
          path="/admin/facility-bookings"
          element={
            <AdminLayout>
              <FacilityBookings />
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



        <Route
  path="/admin/task"
  element={
    <AdminLayout>
      <AdminTasks />
    </AdminLayout>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
