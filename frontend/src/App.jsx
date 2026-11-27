import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ==========================================
// MAIN PAGES
// ==========================================

const Home = lazy(() => import("./pages/Home"));

// ==========================================
// AUTH PAGES
// ==========================================

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const VerifyOTP = lazy(() => import("./pages/auth/VerifyOTP"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

// ==========================================
// RESIDENT PAGES
// ==========================================

const ResidentDashboard = lazy(() => import("./pages/resident/ResidentDashboard"));
const MyProfile = lazy(() => import("./pages/resident/MyProfile"));
const ResidentComplaints = lazy(() => import("./pages/resident/ResidentComplaints"));
const Payment = lazy(() => import("./pages/resident/Payment"));
const ResidentVisitors = lazy(() => import("./pages/resident/ResidentVisitors"));
const Facilities = lazy(() => import("./pages/resident/Facilities"));
const ResidentNotices = lazy(() => import("./pages/resident/Notices"));
const ResidentNotifications = lazy(() => import("./pages/resident/ResidentNotifications"));
const ResidentPolls = lazy(() => import("./pages/resident/residentPolls"));
import ResidentLayout from "./pages/resident/ResidentLayout";

// ==========================================
// GLOBAL CSS
// ==========================================

import "./css/global.css";

// ==========================================
// STAFF
// ==========================================

const StaffDashboard = lazy(() => import("./pages/staff/StaffDashboard"));
const AssignedComplaints = lazy(() => import("./pages/staff/AssignedComplaints"));
const StaffTasks = lazy(() => import("./pages/staff/StaffTasks"));
const StaffMaintenance = lazy(() => import("./pages/staff/StaffMaintenance"));
const StaffInventory = lazy(() => import("./pages/staff/StaffInventory"));
const StaffWorkHistory = lazy(() => import("./pages/staff/StaffWorkHistory"));
const StaffProfile = lazy(() => import("./pages/staff/StaffProfile"));
const StaffNotifications = lazy(() => import("./pages/staff/StaffNotifications"));
const StaffVisitors = lazy(() => import("./pages/staff/StaffVisitors"));
const StaffSupervisorStaff = lazy(() => import("./pages/staff/StaffSupervisorStaff"));
const StaffSupervisorTasks = lazy(() => import("./pages/staff/StaffSupervisorTasks"));
const StaffSupervisorComplaints = lazy(() => import("./pages/staff/StaffSupervisorComplaints"));
const StaffSupervisorVerification = lazy(() => import("./pages/staff/StaffSupervisorVerification"));
const StaffSupervisorReports = lazy(() => import("./pages/staff/StaffSupervisorReports"));
import StaffWorkspaceLayout from "./components/StaffWorkspaceLayout";


// ==========================================
// ADMIN PAGES
// ==========================================

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const Residents = lazy(() => import("./pages/admin/Residents"));
import AdminLayout from "./pages/admin/AdminLayout";
const Staff = lazy(() => import("./pages/admin/Staff"));
const Complaints = lazy(() => import("./pages/admin/Complaints"));
const Payments = lazy(() => import("./pages/admin/Payments"));
const Visitors = lazy(() => import("./pages/admin/Visitors"));
const Amenities = lazy(() => import("./pages/admin/Amenities"));
const FacilityBookings = lazy(() => import("./pages/admin/FacilityBookings"));
const Notices = lazy(() => import("./pages/admin/Notices"));
const Notifications = lazy(() => import("./pages/admin/Notifications"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const AdminTasks = lazy(() => import("./pages/admin/AdminTasks"));
const AdminAssets = lazy(() => import("./pages/admin/AdminAssets"));
const AdminPolls = lazy(() => import("./pages/admin/AdminPolls"));

// Keep personal/project-wide CSS overrides last so they can override page styles.
import "./css/admin_residents.css";
import "./css/admin_unified.css";
import "./css/staff_admin_theme.css";
import "./css/staff_workspace.css";
// import "./css/custom-overrides.css";

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}>
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
          <Route path="visitors" element={<ResidentVisitors />} />
          <Route path="facilities" element={<Facilities />} />
          <Route path="notices" element={<ResidentNotices />} />
          <Route path="notifications" element={<ResidentNotifications />} />
          <Route path="polls" element={<ResidentPolls />} />
        </Route>

        {/* STAFF (FIXED PATHS HERE) */}
        <Route path="/staff" element={<StaffWorkspaceLayout />}>
          <Route index element={<StaffDashboard />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="complaints" element={<AssignedComplaints />} />
          <Route path="tasks" element={<StaffTasks />} />
          <Route path="maintenance" element={<StaffMaintenance />} />
          <Route path="assets" element={<StaffInventory />} />
          <Route path="inventory" element={<StaffInventory />} />
          <Route path="work-history" element={<StaffWorkHistory />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="notifications" element={<StaffNotifications />} />
          <Route path="visitors" element={<StaffVisitors />} />
          <Route path="supervisor/staff" element={<StaffSupervisorStaff />} />
          <Route path="supervisor/tasks" element={<StaffSupervisorTasks />} />
          <Route path="supervisor/complaints" element={<StaffSupervisorComplaints />} />
          <Route path="supervisor/verification" element={<StaffSupervisorVerification />} />
          <Route path="supervisor/reports" element={<StaffSupervisorReports />} />
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
          path="/admin/polls"
          element={
            <AdminLayout>
              <AdminPolls />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
