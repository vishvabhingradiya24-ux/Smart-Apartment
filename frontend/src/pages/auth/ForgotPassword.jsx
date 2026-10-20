import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Info, KeyRound, Mail, ShieldCheck } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  AuthAlert,
  AuthButton,
  AuthField
} from "../../components/auth/AuthKit";
import { getEmailError } from "../../utils/validation";

const PERKS = [
  {
    icon: KeyRound,
    title: "Secure account recovery",
    text: "A one-time code proves it is really you"
  },
  {
    icon: ShieldCheck,
    title: "Protected information",
    text: "Your account details always stay private"
  }
];

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailError = getEmailError(email);
  const shownError = touched ? emailError : "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setTouched(true);

    if (emailError) {
      setError(
        email
          ? "Please fix the highlighted field."
          : "Please enter your email address."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/resident/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to send OTP.");
        setLoading(false);
        return;
      }

      setMessage("OTP has been sent to your email.");

      setTimeout(() => {
        navigate("/verify-otp", {
          state: {
            email: email.trim()
          }
        });
      }, 1000);

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
          Forgot your password? <span>No worries</span>
        </>
      }
      description="Enter the email you registered with and we will send you a one-time code to get you back into your account."
      perks={PERKS}
      badge="Step 1 of 3"
      title="Forgot password?"
      subtitle="Enter your registered email address and we will send you an OTP."
      footer={
        <Link to="/login" className="au-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          label="Email address"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          error={shownError}
          valid={touched && !emailError}
        />

        <p className="au-note">
          <Info size={17} aria-hidden="true" />
          The code is valid for a short time. Check your spam folder if you
          do not see the email.
        </p>

        <AuthAlert type="error">{error}</AuthAlert>
        <AuthAlert type="success">{message}</AuthAlert>

        <AuthButton loading={loading}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;
