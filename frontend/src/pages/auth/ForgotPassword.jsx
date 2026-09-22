import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../css/auth.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address.");
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
            A smart and secure platform to manage your society,
            residents, visitors, maintenance and amenities in one place.
          </p>

          <div className="features">

            <div className="feature">
              <div className="feature-icon">🔐</div>
              <div>
                <h4>Secure Account Recovery</h4>
                <p>Recover your account securely</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">🛡️</div>
              <div>
                <h4>Protected Information</h4>
                <p>Your account information stays protected</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">🏠</div>
              <div>
                <h4>Smart Society Management</h4>
                <p>Manage your apartment in one place</p>
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
            <h1>Forgot Password?</h1>
            <p>
              Enter your registered email address to receive an OTP
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>Email Address</label>

              <div className="input-wrapper">

                <span className="field-icon">✉</span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
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
                {loading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPassword;