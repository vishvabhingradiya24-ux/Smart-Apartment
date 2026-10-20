import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  AuthAlert,
  AuthButton,
  AuthField,
  PasswordStrength
} from "../../components/auth/AuthKit";

const PERKS = [
  {
    icon: Lock,
    title: "Secure password reset",
    text: "Pick a strong password only you know"
  },
  {
    icon: ShieldCheck,
    title: "Protected account",
    text: "Your account stays safe and private"
  }
];

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({});

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fieldErrors = {
    password: !password
      ? "Password is required"
      : password.length < 6
        ? "Password must be at least 6 characters"
        : "",
    confirm: !confirmPassword
      ? "Please confirm your password"
      : confirmPassword !== password
        ? "Passwords do not match"
        : ""
  };

  const fieldError = (name) =>
    touched[name] && fieldErrors[name] ? fieldErrors[name] : "";

  const touch = (name) => setTouched((prev) => ({ ...prev, [name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!resetToken || !email) {
      setError("Reset session is missing. Please request a new OTP.");
      return;
    }

    setTouched({ password: true, confirm: true });

    if (!password || !confirmPassword) {
      setError("Please fill both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/resident/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            resetToken,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Password reset failed.");
        setLoading(false);
        return;
      }

      setMessage("Password reset successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

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
          Almost there, <span>choose a new password</span>
        </>
      }
      description="Create a new password for your account. Use a mix of letters, numbers and symbols to keep it strong."
      perks={PERKS}
      badge="Step 3 of 3"
      title="Reset password"
      subtitle="Create a new password for your account."
      footer={
        <Link to="/login" className="au-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <AuthField
            label="New password"
            icon={Lock}
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              touch("password");
            }}
            onBlur={() => touch("password")}
            error={fieldError("password")}
          />

          <PasswordStrength password={password} />
        </div>

        <AuthField
          className="au-field-spaced"
          label="Confirm password"
          icon={Lock}
          type="password"
          name="confirm_password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            touch("confirm");
          }}
          onBlur={() => touch("confirm")}
          error={fieldError("confirm")}
          valid={touched.confirm && !fieldErrors.confirm}
        />

        <AuthAlert type="error">{error}</AuthAlert>
        <AuthAlert type="success">{message}</AuthAlert>

        <AuthButton loading={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
