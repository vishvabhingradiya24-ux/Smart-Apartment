import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck, ShieldCheck } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  AuthAlert,
  AuthButton,
  OtpInput
} from "../../components/auth/AuthKit";

const PERKS = [
  {
    icon: MailCheck,
    title: "OTP verification",
    text: "We confirm it is your registered email"
  },
  {
    icon: ShieldCheck,
    title: "Secure recovery",
    text: "The code can only be used once"
  }
];

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");

    if (!email) {
      setError("Email information is missing. Please request a new OTP.");
      return;
    }

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/resident/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            otp
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid OTP.");
        setLoading(false);
        return;
      }

      navigate("/reset-password", {
        state: {
          email,
          resetToken: data.resetToken
        }
      });

    } catch {
      setError(
        "Unable to connect to server. Please make sure backend is running."
      );
    }

    setLoading(false);
  };

  return (
    <AuthLayout
      headline={
        <>
          Check your inbox, <span>enter the code</span>
        </>
      }
      description="Verify your identity with the 6-digit code we emailed you, then choose a new password."
      perks={PERKS}
      badge="Step 2 of 3"
      title="Verify OTP"
      subtitle={
        email
          ? `Enter the 6-digit code sent to ${email}`
          : "Enter the 6-digit code sent to your email"
      }
      footer={
        <Link to="/forgot-password" className="au-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Request a new OTP
        </Link>
      }
    >
      <form onSubmit={handleVerify} noValidate>
        <div className="au-field">
          <span className="au-label">One-time password</span>

          <OtpInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setError("");
            }}
            invalid={Boolean(error)}
          />
        </div>

        <AuthAlert type="error">{error}</AuthAlert>

        <AuthButton loading={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

export default VerifyOTP;
