import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../css/auth.css";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!resetToken || !email) {
      setError("Reset session is missing. Please request a new OTP.");
      return;
    }

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

    } catch (error) {
      setError(
        "Unable to connect to server. Please make sure backend is running."
      );
    }

    setLoading(false);
  };

  return (
    <div className="login-page">

      <section className="login-left">
        <div className="left-content">

          <div className="building-icon">🏢</div>

          <h1>
            Smart <span>Apartment</span>
          </h1>

          <h3>Manage Better. Live Better.</h3>

          <p className="left-description">
            Create a new password and securely recover your account.
          </p>

          <div className="features">

            <div className="feature">
              <div className="feature-icon">🔐</div>
              <div>
                <h4>Secure Password Reset</h4>
                <p>Create a new secure password</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">🛡️</div>
              <div>
                <h4>Protected Account</h4>
                <p>Your account remains protected</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      <section className="login-right">
        <div className="login-card">

          <div className="login-logo">
            <div className="logo-building">🏢</div>

            <h2>
              Smart <span>Apartment</span>
            </h2>
          </div>

          <div className="login-heading">
            <h1>Reset Password</h1>

            <p>
              Create a new password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>New Password</label>

              <div className="input-wrapper">

                <span className="field-icon">🔒</span>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />

              </div>

            </div>

            <div className="form-group">

              <label>Confirm Password</label>

              <div className="input-wrapper">

                <span className="field-icon">🔒</span>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />

              </div>

            </div>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              <span>
                {loading ? "Resetting..." : "Reset Password"}
              </span>

              <span className="arrow">→</span>
            </button>

          </form>

          <div className="register-text">
            <Link to="/login">
              ← Back to Login
            </Link>
          </div>

          <div className="security">
            <span>🛡️</span>
            <p>Your information is protected and secure</p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default ResetPassword;