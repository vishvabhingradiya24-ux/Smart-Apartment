import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../css/auth.css";

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
            Verify your identity and securely recover your account.
          </p>

          <div className="features">

            <div className="feature">
              <div className="feature-icon">🔐</div>
              <div>
                <h4>OTP Verification</h4>
                <p>Verify your registered email</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">🛡️</div>
              <div>
                <h4>Secure Recovery</h4>
                <p>Protect your account</p>
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
            <h1>Verify OTP</h1>

            <p>
              Enter the 6-digit OTP sent to your email
            </p>
          </div>

          <form onSubmit={handleVerify}>

            <div className="form-group">

              <label>OTP</label>

              <div className="input-wrapper">

                <span className="field-icon">🔢</span>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  inputMode="numeric"
                />

              </div>

            </div>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              <span>
                {loading ? "Verifying..." : "Verify OTP"}
              </span>

              <span className="arrow">→</span>
            </button>

          </form>

          <div className="register-text">
            <Link to="/forgot-password">
              ← Request New OTP
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

export default VerifyOTP;