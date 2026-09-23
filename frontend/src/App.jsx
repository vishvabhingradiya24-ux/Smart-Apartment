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
// DASHBOARDS
// ==========================================

import ResidentDashboard from "./pages/resident/ResidentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";

// ==========================================
// RESIDENT PAGES
// ==========================================

import Complaints from "./pages/resident/Complaints";
import MyProfile from "./pages/resident/MyProfile";
import FlatDetails from "./pages/resident/FlatDetails";
import Payment from "./pages/resident/Payment";
import ServiceRequests from "./pages/resident/ServiceRequests";
import Visitors from "./pages/resident/Visitors";
import Facilities from "./pages/resident/Facilities";


function App() {
  return (

    <BrowserRouter>

      <Routes>

        {/* ==================================
            HOME
        =================================== */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* ==================================
            AUTH
        =================================== */}

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


        {/* ==================================
            DASHBOARDS
        =================================== */}

        <Route
          path="/resident"
          element={<ResidentDashboard />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/staff"
          element={<StaffDashboard />}
        />


        {/* ==================================
            RESIDENT
        =================================== */}

        <Route
          path="/resident/complaints"
          element={<Complaints />}
        />

        <Route
          path="/resident/profile"
          element={<MyProfile />}
        />

        <Route
          path="/resident/flat-details"
          element={<FlatDetails />}
        />

        <Route
          path="/resident/payment"
          element={<Payment />}
        />

        <Route
          path="/resident/requests"
          element={<ServiceRequests />}
        />

        <Route
          path="/resident/visitors"
          element={<Visitors />}
        />

        <Route
          path="/resident/facilities"
          element={<Facilities />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;