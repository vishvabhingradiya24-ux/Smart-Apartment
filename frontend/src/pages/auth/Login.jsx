import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/auth.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    user_type: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.user_type || !formData.email || !formData.password) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      let loginURL = "";
      let requestBody = {};

      if (formData.user_type === "resident") {
        loginURL = "http://localhost:5000/api/resident/login";

        requestBody = {
          email: formData.email,
          password: formData.password
        };
      }

      if (formData.user_type === "staff") {
        loginURL = "http://localhost:5000/api/staff/login";

        requestBody = {
          email: formData.email,
          password: formData.password
        };
      }

      if (formData.user_type === "admin") {
        loginURL = "http://localhost:5000/api/admin/login";

        requestBody = {
          email: formData.email,
          password: formData.password
        };
      }

      const response = await fetch(loginURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);

      if (formData.user_type === "resident") {
        const residentUser = {
          ...data.user,
          user_type: "Resident"
        };

        localStorage.setItem(
          "user",
          JSON.stringify(residentUser)
        );

        setMessage("Resident login successful!");

        setTimeout(() => {
          navigate("/resident");
        }, 1000);

        return;
      }

      if (formData.user_type === "staff") {
        const staffUser = {
          ...data.staff,
          user_type: "Staff"
        };

        localStorage.setItem(
          "user",
          JSON.stringify(staffUser)
        );

        setMessage("Staff login successful!");

        setTimeout(() => {
          navigate("/staff");
        }, 1000);

        return;
      }

      if (formData.user_type === "admin") {
        const adminUser = {
          ...data.admin,
          user_type: "Admin"
        };

        localStorage.setItem(
          "user",
          JSON.stringify(adminUser)
        );

        setMessage("Admin login successful!");

        setTimeout(() => {
          navigate("/admin");
        }, 1000);

        return;
      }

    } catch (error) {
      console.error("Login Error:", error);

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

          <div className="building-icon">
            🏢
          </div>

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
              <div className="feature-icon">👥</div>

              <div>
                <h4>Easy Society Management</h4>
                <p>Manage your society efficiently</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">🛡️</div>

              <div>
                <h4>Secure Visitor Management</h4>
                <p>Keep your community safe</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">💳</div>

              <div>
                <h4>Maintenance & Payment Tracking</h4>
                <p>Track payments and maintenance</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">📅</div>

              <div>
                <h4>Amenity Booking</h4>
                <p>Book amenities easily</p>
              </div>
            </div>

          </div>

        </div>

      </section>

      <section className="login-right">

        <div className="login-card">

          <div className="login-logo">

            <div className="logo-building">
              🏢
            </div>

            <h2>
              Smart <span>Apartment</span>
            </h2>

          </div>

          <div className="login-heading">

            <h1>
              Welcome Back! <span>👋</span>
            </h1>

            <p>
              Login to access your account
            </p>

          </div>

          <form onSubmit={handleLogin}>

            <div className="form-group">

              <label>
                Login As
              </label>

              <div className="select-wrapper">

                <span className="field-icon">
                  👤
                </span>

                <select
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  required
                >

                  <option value="" disabled>
                    Select your role
                  </option>

                  <option value="resident">
                    Resident
                  </option>

                  <option value="staff">
                    Staff
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                </select>

              </div>

            </div>

            <div className="form-group">

              <label>
                Email Address
              </label>

              <div className="input-wrapper">

                <span className="field-icon">
                  ✉
                </span>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

              </div>

            </div>

            <div className="form-group">

              <div className="password-top">

                <label>
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot Password?
                </Link>

              </div>

              <div className="input-wrapper">

                <span className="field-icon">
                  🔒
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>

            </div>

            <div className="remember-row">

              <label className="remember">

                <input type="checkbox" />

                <span>
                  Remember me
                </span>

              </label>

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
                {loading ? "Logging in..." : "Login"}
              </span>

              <span className="arrow">
                →
              </span>

            </button>

          </form>

          <div className="register-text">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

          <div className="security">

            <span>
              🛡️
            </span>

            <p>
              Your information is protected and secure
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;