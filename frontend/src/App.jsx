import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ResetPassword from "./pages/auth/ResetPassword";
import ResidentDashboard from "./pages/resident/ResidentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import Complaints from "./pages/resident/Complaints";
import MyProfile from "./pages/resident/MyProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/verify-otp" element={<VerifyOTP />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/resident" element={<ResidentDashboard />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/staff" element={<StaffDashboard />} />

        <Route path="/resident/complaints" element={<Complaints />} />

        <Route path="/resident/profile" element={<MyProfile />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;